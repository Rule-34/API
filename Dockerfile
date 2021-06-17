# --- Development --- 
FROM node:15-alpine As build

WORKDIR /usr/src/app

# Environment variables
ARG GITHUB_TOKEN

COPY . .

# System dependencies
RUN apk --no-cache add git

# Download git submodules
RUN git submodule update --init --recursive

RUN npm ci

RUN npm run build


# --- Production --- 
FROM node:15-alpine as production

WORKDIR /usr/src/app

# System dependencies
RUN apk --no-cache add curl

# Environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=80
ARG PORT

ARG GITHUB_TOKEN

COPY . .

COPY --from=build /usr/src/app/dist ./dist

RUN npm ci --only=production

USER node

EXPOSE ${PORT}

HEALTHCHECK --interval=1m --timeout=15s --start-period=10s --retries=3 CMD curl --fail http://localhost:${PORT}/ || exit 1

CMD ["npm", "run", "start:prod"]