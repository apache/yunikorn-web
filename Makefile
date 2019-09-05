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

# Make sure we are in the same directory as the Makefile
BASE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

all:
	$(MAKE) -C $(dir $(BASE_DIR)) build

# Version parameters
DATE=$(shell date +%FT%T%z)
ifeq ($(VERSION),)
VERSION := latest
endif

# Image build parameters
# This tag of the image must be changed when pushed to a public repository.
ifeq ($(TAG),)
TAG := yunikorn/yunikorn-web
endif

# Set the default web port, this must be the same as in the nginx/nginx.conf file.
PORT=9889

# Local build and deploy with compose
.PHONY: deploy-prod
deploy-prod:
	docker-compose up -d

# Start web interface in a local dev setup
.PHONY: start-dev
start-dev:
	yarn start:srv & yarn start

# Run the web interface from the production image
.PHONY: run
run: image
	docker run -d -p ${PORT}:9889 ${TAG}:${VERSION}

# Build the web interface in a production ready version
.PHONY: build-prod
build-prod:
	yarn install && yarn build:prod

# Build an image based on the production ready version
image: build-prod
	@SHA=$$(git rev-parse --short=12 HEAD) ; \
	docker build -t ${TAG}:${VERSION} . \
	--label "GitRevision=$${SHA}" \
	--label "Version=${VERSION}" \
	--label "BuildTimeStamp=${DATE}"

# Build the web interface for dev and test
.PHONY: build
build:
	yarn install && ng build

# Run the tests after building
test: build
	ng test
	ng e2e

# Simple clean of generated files only (no local cleanup).
.PHONY: clean
clean:
	rm -rf ./dist
	rm -rf ./node_modules
	rm -rf ./out
	rm -rf ./out-tsc
  echo "Done"
