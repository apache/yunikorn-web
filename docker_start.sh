#!/bin/sh

#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

echo "[1/5] Removing dist and node_modules..."
rm -rf dist/ node_modules/

echo "[2/5] Installing dependencies..."
yarn install

echo "[3/5] Building modules..."
yarn build:prod

echo "[4/5] Building docker image yunikorn/yunikorn-web:latest..."
docker build -t yunikorn/yunikorn-web:latest -f ./nginx/Dockerfile .

echo "[5/5] Starting docker container using image yunikorn/yunikorn-web:latest..."
docker run -d -p 9889:9889 yunikorn/yunikorn-web:latest
