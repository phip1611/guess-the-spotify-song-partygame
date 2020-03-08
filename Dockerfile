FROM node:12
WORKDIR /usr/src/app
COPY server-node/build ./
RUN yarn install
RUN mv node_modules server-node/src/
EXPOSE 8080
# since we use two inputs for typescript (common-ts and server-node)
# the output also creates the same directory structure in the
# build directory; this is the reason this was changed from just "server.js"
CMD [ "node", "server-node/src/start.js" ]
