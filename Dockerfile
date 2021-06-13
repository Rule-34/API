# --- Development --- 
FROM node:15-alpine As build

WORKDIR /usr/src/app

# Environment variables
ARG GITHUB_TOKEN

COPY package*.json ./

# Copy custom NPM configuration
COPY .npmrc ./

RUN npm ci --only=development

COPY . .

RUN npm run build

# --- Production --- 
FROM node:15-alpine as production

WORKDIR /usr/src/app

# Environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG GITHUB_TOKEN

COPY package*.json ./

# Copy custom NPM configuration
COPY .npmrc ./

RUN npm ci --only=production

COPY . .

COPY --from=build /usr/src/app/dist ./dist

CMD ["npm", "run", "start:prod"]