ARG NODE_VERSION=24

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY ca/ ./ca/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN --mount=type=secret,id=GITHUB_TOKEN \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/GITHUB_TOKEN)" >> .npmrc && \
    corepack enable && \
    pnpm install --frozen-lockfile && \
    rm -f .npmrc

COPY . .

RUN pnpm run build

# Stage 2: Production
FROM node:${NODE_VERSION}-alpine AS production

ENV NODE_ENV=production
ENV NODE_EXTRA_CA_CERTS=/app/ca/smart-proxy-ca.pem

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/pnpm-lock.yaml ./
COPY --from=builder --chown=node:node /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/public ./public
COPY --chown=node:node ca/ ./ca/

RUN --mount=type=secret,id=GITHUB_TOKEN \
    echo "@alejandroakbal:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/GITHUB_TOKEN)" >> .npmrc && \
    corepack enable && \
    pnpm prune --prod && \
    rm -f .npmrc

USER node

EXPOSE 3000

HEALTHCHECK CMD wget --no-verbose --spider http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
