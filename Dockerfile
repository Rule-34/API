ARG NODE_VERSION=20

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Set up GitHub token for private npm packages
ARG GITHUB_TOKEN
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Remove .npmrc after install (don't leak token)
RUN rm -f .npmrc

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Set up GitHub token for private npm packages
ARG GITHUB_TOKEN
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install only production dependencies
RUN npm ci --omit=dev

# Remove .npmrc after install (don't leak token)
RUN rm -f .npmrc

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy public directory for static files
COPY --from=builder /app/public ./public

# Switch to non-root user (node user is included in the base image)
USER node

# Expose port (configurable via PORT env var)
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"]
