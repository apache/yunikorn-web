#!/bin/bash

echo "[1/3] Removing dist and node_modules..."
rm -rf dist/ node_modules/

echo "[2/3] Installing dependencies..."
yarn install

echo "[3/3] Building modules..."
yarn build:prod
