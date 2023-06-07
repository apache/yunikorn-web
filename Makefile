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

# Check if this GO tools version used is at least the version of go specified in
# the go.mod file. The version in go.mod should be in sync with other repos.
GO_VERSION := $(shell go version | awk '{print substr($$3, 3, 10)}')
MOD_VERSION := $(shell cat .go_version) 

GM := $(word 1,$(subst ., ,$(GO_VERSION)))
MM := $(word 1,$(subst ., ,$(MOD_VERSION)))
FAIL := $(shell if [ $(GM) -lt $(MM) ]; then echo MAJOR; fi)
ifdef FAIL
$(error Build should be run with at least go $(MOD_VERSION) or later, found $(GO_VERSION))
endif
GM := $(word 2,$(subst ., ,$(GO_VERSION)))
MM := $(word 2,$(subst ., ,$(MOD_VERSION)))
FAIL := $(shell if [ $(GM) -lt $(MM) ]; then echo MINOR; fi)
ifdef FAIL
$(error Build should be run with at least go $(MOD_VERSION) or later, found $(GO_VERSION))
endif

# Make sure we are in the same directory as the Makefile
BASE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

OUTPUT=bin
DEV_BIN_DIR=${OUTPUT}/dev
RELEASE_BIN_DIR=${OUTPUT}/prod
SERVER_BINARY=yunikorn-web
REPO=github.com/apache/yunikorn-web/pkg

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

# Set the default web port
PORT=9889

# Allow architecture to be overwritten
ifeq ($(HOST_ARCH),)
HOST_ARCH := $(shell uname -m)
endif

# Build architecture settings:
# EXEC_ARCH defines the architecture of the executables that gets compiled
# DOCKER_ARCH defines the architecture of the docker image
# Both vars must be set, an unknown architecture defaults to amd64
ifeq (x86_64, $(HOST_ARCH))
EXEC_ARCH := amd64
DOCKER_ARCH := amd64
else ifeq (i386, $(HOST_ARCH))
EXEC_ARCH := 386
DOCKER_ARCH := i386
else ifneq (,$(filter $(HOST_ARCH), arm64 aarch64))
EXEC_ARCH := arm64
DOCKER_ARCH := arm64v8
else ifeq (armv7l, $(HOST_ARCH))
EXEC_ARCH := arm
DOCKER_ARCH := arm32v7
else
$(info Unknown architecture "${HOST_ARCH}" defaulting to: amd64)
EXEC_ARCH := amd64
DOCKER_ARCH := amd64
endif

WEB_SHA=$(shell git rev-parse --short=12 HEAD)

all:
	$(MAKE) -C $(dir $(BASE_DIR)) build

LINTBASE := $(shell go env GOPATH)/bin
LINTBIN  := $(LINTBASE)/golangci-lint
$(LINTBIN):
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(LINTBASE) v1.51.2
	stat $@ > /dev/null 2>&1

# Run lint against the previous commit for PR and branch build
# In dev setup look at all changes on top of master
.PHONY: lint
lint: $(LINTBIN)
	@echo "running golangci-lint"
	git symbolic-ref -q HEAD && REV="origin/HEAD" || REV="HEAD^" ; \
	headSHA=$$(git rev-parse --short=12 $${REV}) ; \
	echo "checking against commit sha $${headSHA}" ; \
	${LINTBIN} run --new-from-rev=$${headSHA}

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

# Run JS unit tests
.PHONY: test_js
test_js: build
	yarn test:singleRun

# Run Go unit tests
.PHONY: test_go
test_go:
	go test ./pkg/... -cover -race -tags deadlock -coverprofile=coverage.txt -covermode=atomic
	go vet $(REPO)...

# Run the tests after building
.PHONY: test
test: test_js test_go

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
	rm -rf ./bin
	rm -rf ./out
	rm -rf ./out-tsc

# Build an image based on the production ready version
.PHONY: image
NODE_VERSION := $(shell cat .nvmrc)
image: build_server_prod
	@echo "Building web UI docker image"
	DOCKER_BUILDKIT=1 \
	docker build -t ${REGISTRY}/yunikorn:web-${DOCKER_ARCH}-${VERSION} . \
	--platform "linux/${DOCKER_ARCH}" \
	--label "yunikorn-web-revision=${WEB_SHA}" \
	--label "Version=${VERSION}" \
	--label "BuildTimeStamp=${DATE}" \
	--build-arg NODE_VERSION=${NODE_VERSION} \
	${QUIET}

# Create output directories
.PHONY: init
init:
	mkdir -p ${DEV_BIN_DIR}
	mkdir -p ${RELEASE_BIN_DIR}

.PHONY: build_server_dev
build_server_dev: init
	@echo "building local web server binary"
	go build -o=${DEV_BIN_DIR}/${SERVER_BINARY} -race -ldflags \
	'-X main.version=${VERSION} -X main.date=${DATE}' \
	./pkg/cmd/web/
	@chmod +x ${DEV_BIN_DIR}/${SERVER_BINARY}

.PHONY: build_server_prod
build_server_prod: init
	@echo "building web server binary"
	CGO_ENABLED=0 GOOS=linux GOARCH="${EXEC_ARCH}" \
	go build -a -o=${RELEASE_BIN_DIR}/${SERVER_BINARY} -trimpath -ldflags \
	'-extldflags "-static" -X main.version=${VERSION} -X main.date=${DATE}' \
	-tags netgo -installsuffix netgo \
	./pkg/cmd/web/

# Run the web interface from the production image
.PHONY: run
run: image
	docker run -d -p ${PORT}:9889 ${REGISTRY}/yunikorn:web-${DOCKER_ARCH}-${VERSION}

# Start the json-server based on the json-db and route.
.PHONY: json-server
json-server:
	json-server ./json-db.json
