FROM node:18.6

ARG TC=UTC
ARG NODE_ENV=production
ARG VOLUME=false
ARG KEY=false
ARG LOGINS=false

ENV TC=$TC
ENV NODE_ENV=$NODE_ENV
ENV VOLUME=$VOLUME
ENV KEY=$KEY
ENV LOGINS=$LOGINS

WORKDIR /app
COPY . .
RUN npm ci --omit=dev
EXPOSE 3000

ENTRYPOINT [ "node", "src/index.js" ]
CMD [ "--volume", "--key", "--logins" ]