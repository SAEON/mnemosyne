FROM node:20.4.0-alpine

ARG TZ=UTC
ARG NODE_ENV=production

ENV TZ=$TZ
ENV NODE_ENV=$NODE_ENV

WORKDIR /mnemosyne
COPY . .
RUN npm ci --omit=dev
EXPOSE 3000

ENTRYPOINT [ "bin/mnemosyne.js" ]