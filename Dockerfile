# --- Development --- 
FROM node:15-alpine As build

WORKDIR /usr/src/app

# Environment variables
ARG GITHUB_TOKEN

COPY . .

RUN apk --no-cache add git

# Download git submodules
RUN git submodule update --init --recursive

RUN npm ci

RUN npm run build


# --- Production --- 
FROM node:15-alpine as production

WORKDIR /usr/src/app

# Environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG GITHUB_TOKEN

COPY . .

COPY --from=build /usr/src/app/dist ./dist

RUN npm ci --only=production

USER node

CMD ["npm", "run", "start:prod"]