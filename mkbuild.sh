#!/usr/bin/bash

yarn build
rm -rf out
mkdir -p out/{node,bin,data}

cp ./scripts/start.bat out/
