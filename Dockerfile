ARG NODE_VERSION=20

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

ARG GITHUB_TOKEN

WORKDIR /app

COPY package.json package-lock.json ./

# Set up GitHub token for private npm packages
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

RUN npm ci

# Remove .npmrc after install (don't leak token)
RUN rm -f .npmrc

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:${NODE_VERSION}-alpine AS production

ARG GITHUB_TOKEN

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./

# Set up GitHub token for private npm packages
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install only production dependencies
RUN npm ci --omit=dev

# Remove .npmrc after install (don't leak token)
RUN rm -f .npmrc

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/public ./public

USER node

EXPOSE 3000

HEALTHCHECK CMD wget --no-verbose --spider http://localhost:3000/ || exit 1

CMD ["node", "dist/main.js"]
