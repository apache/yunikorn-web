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

# Allow architecture to be overwritten
ifeq ($(HOST_ARCH),)
HOST_ARCH := $(shell uname -m)
endif

# Build architecture settings:
# EXEC_ARCH defines the architecture of the executables that gets compiled
# DOCKER_ARCH defines the architecture of the docker image
ifeq (x86_64, $(HOST_ARCH))
DOCKER_ARCH := amd64
else ifeq (i386, $(HOST_ARCH))
DOCKER_ARCH := i386
else ifneq (,$(filter $(HOST_ARCH), arm64 aarch64))
DOCKER_ARCH := arm64v8
else ifeq (armv7l, $(HOST_ARCH))
DOCKER_ARCH := arm32v7
else
DOCKER_ARCH := amd64
endif

WEB_SHA=$(shell git rev-parse --short=12 HEAD)

.PHONY: license-check
# This is a bit convoluted but using a recursive grep on linux fails to write anything when run
# from the Makefile. That caused the pull-request license check run from the github action to
# always pass. The syntax for find is slightly different too but that at least works in a similar
# way on both Mac and Linux. Excluding all .git* files from the checks.
OS := $(shell uname -s | tr '[:upper:]' '[:lower:]')
license-check:
	@echo "checking license headers:"
ifeq (darwin,$(OS))
	$(shell find -E . ! -path "./.git*" ! -path "./node_modules*" ! -path "./dist*" -regex ".*\.(sh|md|conf|yaml|yml|js|ts|html|js|scss)" -exec grep -L "Licensed to the Apache Software Foundation" {} \; > LICRES)
else
	$(shell find . ! -path "./.git*" ! -path "./node_modules*" ! -path "./dist*" -regex ".*\.\(sh\|md\|conf\|yaml\|yml\|js\|ts\|html\|js\|scss\)" -exec grep -L "Licensed to the Apache Software Foundation" {} \; > LICRES)
endif
	@if [ -s LICRES ]; then \
		echo "following files are missing license header:" ; \
		cat LICRES ; \
		rm -f LICRES ; \
		exit 1; \
	fi ; \
	rm -f LICRES
	@echo "  all OK"

# Start web interface in a local dev setup
.PHONY: start-dev
start-dev:
	yarn start:srv & yarn start

# Build the web interface for dev and test
.PHONY: build
build:
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 && yarn install && ng build

# Run the tests after building
test: build
	yarn test:singleRun

# Build the web interface in a production ready version
.PHONY: build-prod
build-prod:
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 && yarn install && yarn build:prod

# Simple clean of generated files only (no local cleanup).
.PHONY: clean
clean:
	rm -rf ./dist
	rm -rf ./coverage
	rm -rf ./node_modules
	rm -rf ./out
	rm -rf ./out-tsc

# Build an image based on the production ready version
.PHONY: image
NODE_VERSION := $(shell cat .nvmrc)
image:
	@echo "Building web UI docker image"
	docker build -t ${REGISTRY}/yunikorn:web-${DOCKER_ARCH}-${VERSION} . \
	--label "yunikorn-web-revision=${WEB_SHA}" \
	--label "Version=${VERSION}" \
	--label "BuildTimeStamp=${DATE}" \
	--build-arg NODE_VERSION=${NODE_VERSION} \
	--build-arg ARCH=${DOCKER_ARCH}/ \
	${QUIET}

# Run the web interface from the production image
.PHONY: run
run: image
	docker run -d -p ${PORT}:9889 ${REGISTRY}/yunikorn:web-${DOCKER_ARCH}-${VERSION}
