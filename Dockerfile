# node:8-slim fails with "TypeError: Object is not async iterable"
# node:10-slim works
FROM node:8-slim

ENV NODE_ENV dev
EXPOSE 3000
WORKDIR /home/node

COPY package*.json ./
RUN yarn install --production=false

COPY elastic-search.json elastic-search.json
COPY src src
RUN yarn run babel

CMD yarn run start
