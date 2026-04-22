FROM node:24 AS ui-build
WORKDIR /src/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM node:24 AS server-build
WORKDIR /src/server-node
COPY server-node/package.json server-node/package-lock.json ./
RUN npm ci
COPY common-ts/ ../common-ts/
COPY server-node/ ./
RUN npm run build

FROM node:24-slim AS runtime
WORKDIR /app/server-node
COPY server-node/package.json server-node/package-lock.json ./
RUN npm ci --omit=dev

WORKDIR /app
COPY --from=server-build /src/server-node/build/common-ts ./common-ts
COPY --from=server-build /src/server-node/build/server-node ./server-node
COPY --from=ui-build /src/ui/dist/song-game ./server-node/src/public

EXPOSE 8080
CMD ["node", "server-node/src/start.js"]
