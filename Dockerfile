FROM node:20.3.0-alpine

ARG TC=UTC
ARG NODE_ENV=production

ENV TC=$TC
ENV NODE_ENV=$NODE_ENV

WORKDIR /app
COPY . .
RUN npm ci --omit=dev
EXPOSE 3000

ENTRYPOINT [ "node", "src/index.js" ]