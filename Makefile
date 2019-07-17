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

# Version parameters
DATE=$(shell date +%FT%T%z)
ifeq ($(VERSION),)
VERSION := 0.1.0-SNAPSHOT
endif

# Image build parameters
# This tag of the image must be changed when pushed to a public repository.
ifeq ($(TAG),)
TAG := yunikorn/yunikorn-web
endif

# Set the default web port, this must be the same as in the nginx/nginx.conf file.
PORT=9889

.PHONY: deploy-prod
deploy-prod:
	docker-compose up -d

.PHONY: build-prod
build-prod:
	yarn install && yarn build:prod

.PHONY: start-dev
start-dev:
	yarn start:srv & yarn start

.PHONY: build-prod
image: image
	@SHA=$$(git rev-parse --short=12 HEAD) ; \
	docker build -t ${TAG}:${VERSION} . \
	--label "GitRevision=$${SHA}" \
	--label "Version=${VERSION}" \
	--label "BuildTimeStamp=${DATE}"

.PHONY: run
run: image
	docker run -d -p ${PORT}:80 ${IMAGE_TAG}:${VERSION}

.PHONY build
build:
	ng build

.PHONY: test-all
test-all: build
	ng test
	ng e2e

.PHONY: clean
clean:
	rm -rf ./dist
	rm -rf ./out
	rm -rf ./out-tsc
