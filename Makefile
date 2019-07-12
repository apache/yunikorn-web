#
# Copyright 2019 Cloudera, Inc.  All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Version parameter
IMAGE_VERSION=0.3.5

# Image build parameters
# change this to tag the image with a different name
IMAGE_TAG=yunikorn/yunikorn-web
# change this to tag the image with a different name

# Set the default web port, this must be the same as in the nginx/nginx.conf file.
PORT=9889

deploy-prod:
	docker-compose up -d

build-prod:
	yarn install && yarn build:prod

start-dev:
	yarn start:srv & yarn start

image: build-prod
	docker build -t ${IMAGE_TAG}:${IMAGE_VERSION} .

run: image
	docker run -d -p ${PORT}:80 ${IMAGE_TAG}:${IMAGE_VERSION}

build:
	ng build

test-all: build
	ng test
	ng e2e

clean:
	rm -rf ./dist
	rm -rf ./out
	rm -rf ./out-tsc
