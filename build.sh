#!/bin/sh

cd ui
yarn install &
cd ..
cd server-node
yarn install &
cd ..
wait

cd ui
yarn run build
cd ..

rm -rf server-node/build

# this is necessary because of e7446021 ... this is ugly :/
mkdir -p                    server-node/build/server-node/src/
cp -r ui/dist/song-game     server-node/build/server-node/src/public
# yarn install will happen here
cp server-node/package.json server-node/build/package.json
cp server-node/package.json server-node/build/yarn.lock

cd server-node
yarn run tsc

cd ..

docker build -t phip1611/song-game .
