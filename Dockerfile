FROM node:12
WORKDIR /usr/src/app
COPY server-node/build ./
RUN yarn install
EXPOSE 8080
CMD [ "node", "start.js" ]
