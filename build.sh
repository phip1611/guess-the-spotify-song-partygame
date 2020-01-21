#!/bin/sh

cd ui
yarn install &
cd ..
cd server-node
yarn install &
cd ..
wait

rm -rf server-node/build
mkdir server-node/build
cp -r ui/dist/song-game server-node/build/public

cd server-node
yarn run tsc