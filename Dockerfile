FROM node:18.6

ARG TC=UTC
ARG NODE_ENV=production

ENV TC=$TC
ENV NODE_ENV=$NODE_ENV

WORKDIR /app
COPY . .
RUN npm ci --only=production
EXPOSE 3000

ENTRYPOINT ["node", "src/index.js", "--volume", "/mnemosyne" ]