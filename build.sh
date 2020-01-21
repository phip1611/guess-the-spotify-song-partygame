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
mkdir server-node/build
cp -r ui/dist/song-game server-node/build/public
cp server-node/package.json server-node/build/package.json
cp server-node/package.json server-node/build/yarn.lock

cd server-node
yarn run tsc

docker build -t phip1611:guess-spotify-song-game .
