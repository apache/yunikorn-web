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
ifeq ($(REGISTRY),)
REGISTRY := apache
endif

# Set the default web port, this must be the same as in the nginx/nginx.conf file.
PORT=9889

.PHONY: license-check
# This is a bit convoluted but using a recursive grep on linux fails to write anything when run
# from the Makefile. That caused the pull-request license check run from the github action to
# always pass. The syntax for find is slightly different too but that at least works in a similar
# way on both Mac and Linux. Excluding all .git* files from the checks.
OS := $(shell uname -s)
license-check:
	@echo "checking license headers:"
ifeq (Darwin,$(OS))
	$(shell find -E . ! -path "./.git*" ! -path "./node_modules*" ! -path "./dist*" -regex ".*\.(sh|md|yaml|yml|js|ts|html|js|scss)" -exec grep -L "Licensed to the Apache Software Foundation" {} \; > LICRES)
else
	$(shell find . ! -path "./.git*" ! -path "./node_modules*" ! -path "./dist*" -regex ".*\.\(sh\|md\|yaml\|yml\|js\|ts\|html\|js\|scss\)" -exec grep -L "Licensed to the Apache Software Foundation" {} \; > LICRES)
endif
	@if [ -s LICRES ]; then \
		echo "following files are missing license header:" ; \
		cat LICRES ; \
		rm -f LICRES ; \
		exit 1; \
	fi ; \
	rm -f LICRES

# Start web interface in a local dev setup
.PHONY: start-dev
start-dev:
	yarn start:srv & yarn start

# Build the web interface for dev and test
.PHONY: build
build:
	yarn install && ng build

# Run the tests after building
test: build
	ng test
	ng e2e

# Build the web interface in a production ready version
.PHONY: build-prod
build-prod:
	yarn install && yarn build:prod

# Simple clean of generated files only (no local cleanup).
.PHONY: clean
clean:
	rm -rf ./dist
	rm -rf ./node_modules
	rm -rf ./out
	rm -rf ./out-tsc

# Build an image based on the production ready version
.PHONY: image
image:
	@echo "Building web UI docker image"
	@SHA=$$(git rev-parse --short=12 HEAD) ; \
	docker build -t ${REGISTRY}/yunikorn:web-${VERSION} . \
	--label "GitRevision=$${SHA}" \
	--label "Version=${VERSION}" \
	--label "BuildTimeStamp=${DATE}"

# Run the web interface from the production image
.PHONY: run
run: image
	docker run -d -p ${PORT}:9889 ${REGISTRY}/yunikorn:web-${VERSION}

# Pushing the production image to the public repository
.PHONY: push_image
push_image: image
	@echo "Pushing web UI docker image"
	echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
	docker push ${REGISTRY}/yunikorn:web-${VERSION}
