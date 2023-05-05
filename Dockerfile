FROM node:20.1.0-alpine

ARG TC=UTC
ARG NODE_ENV=production
ARG KEY=false

ENV TC=$TC
ENV NODE_ENV=$NODE_ENV
ENV KEY=$KEY

WORKDIR /app
COPY . .
RUN npm ci --omit=dev
EXPOSE 3000

ENTRYPOINT [ "node", "src/index.js" ]