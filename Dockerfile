ARG NODE_VERSION=20

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

RUN --mount=type=secret,id=GITHUB_TOKEN \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/GITHUB_TOKEN)" >> .npmrc

RUN npm ci

RUN rm -f .npmrc

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:${NODE_VERSION}-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

RUN npm prune --omit=dev

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000

HEALTHCHECK CMD wget --no-verbose --spider http://127.0.0.1:3000/ || exit 1

# Use `docker run --init` or `init: true` in compose for proper signal handling
CMD ["node", "dist/main.js"]
