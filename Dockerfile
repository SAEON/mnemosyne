FROM node:20.3.1-alpine

ARG TC=UTC
ARG NODE_ENV=production

ENV TC=$TC
ENV NODE_ENV=$NODE_ENV

WORKDIR /app
COPY . .
RUN npm ci --omit=dev
EXPOSE 3000

ENTRYPOINT [ "bin/mnemosyne.js" ]