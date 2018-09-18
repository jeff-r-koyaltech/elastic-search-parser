FROM node:10-slim

ENV NODE_ENV dev
EXPOSE 3000

VOLUME /home/node/in
VOLUME /home/node/out

WORKDIR /home/node

COPY package*.json ./
COPY yarn.lock yarn.lock
RUN yarn install

COPY src src
RUN yarn run babel

CMD yarn run docker_start
