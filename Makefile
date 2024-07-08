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

# Go compiler selection
ifeq ($(GO),)
GO := go
endif

GO_VERSION := $(shell "$(GO)" version | awk '{print substr($$3, 3, 4)}')
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

OUTPUT=build
TOOLS_DIR=tools
DEV_BIN_DIR=${OUTPUT}/dev
RELEASE_BIN_DIR=${OUTPUT}/prod
SERVER_BINARY=yunikorn-web
REPO=github.com/apache/yunikorn-web/pkg

# Build date - Use git commit, then cached build.date, finally current date
# This allows for reproducible builds as long as release tarball contains the build.date file.
DATE := $(shell if [ -d "$(BASE_DIR)/.git" ]; then TZ=UTC0 git --no-pager log -1 --date=iso8601-strict-local --format=%cd 2>/dev/null ; fi || true)
ifeq ($(DATE),)
DATE := $(shell cat "$(BASE_DIR)/build.date" 2>/dev/null || true)
endif
ifeq ($(DATE),)
DATE := $(shell date +%FT%T%z)
endif
DATE := $(shell echo "$(DATE)" > "$(BASE_DIR)/build.date" ; cat "$(BASE_DIR)/build.date")

# Version parameters
ifeq ($(VERSION),)
VERSION := latest
endif

# Image build parameters
# This tag of the image must be changed when pushed to a public repository.
ifeq ($(REGISTRY),)
REGISTRY := apache
endif

# Reproducible builds mode
GO_REPRO_VERSION := $(shell cat .go_repro_version)
ifeq ($(REPRODUCIBLE_BUILDS),1)
  REPRO := 1
else
  REPRO :=
endif

# Set the default web port
PORT=9889

# Kernel (OS) Name
OS := $(shell uname -s | tr '[:upper:]' '[:lower:]')

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
DOCKER_ARCH := arm64
else ifeq (armv7l, $(HOST_ARCH))
EXEC_ARCH := arm
DOCKER_ARCH := arm32v7
else
$(info Unknown architecture "${HOST_ARCH}" defaulting to: amd64)
EXEC_ARCH := amd64
DOCKER_ARCH := amd64
endif

# golangci-lint
GOLANGCI_LINT_VERSION=1.57.2
GOLANGCI_LINT_BIN=$(TOOLS_DIR)/golangci-lint
GOLANGCI_LINT_ARCHIVE=golangci-lint-$(GOLANGCI_LINT_VERSION)-$(OS)-$(EXEC_ARCH).tar.gz
GOLANGCI_LINT_ARCHIVEBASE=golangci-lint-$(GOLANGCI_LINT_VERSION)-$(OS)-$(EXEC_ARCH)

WEB_SHA=$(shell git rev-parse --short=12 HEAD)

ifeq ($(WEB_TAG),)
WEB_TAG := $(REGISTRY)/yunikorn:web-$(DOCKER_ARCH)-$(VERSION)
endif

all:
	$(MAKE) -C $(dir $(BASE_DIR)) build

# Install pnpm
.PHONY: install-pnpm
install-pnpm:
	@pnpm version >/dev/null 2>/dev/null || npm install -g pnpm

# Install tools
.PHONY: tools
tools: $(GOLANGCI_LINT_BIN)

# Install golangci-lint
$(GOLANGCI_LINT_BIN):
	@echo "installing golangci-lint v$(GOLANGCI_LINT_VERSION)"
	@mkdir -p "$(TOOLS_DIR)"
	@curl -sSfL "https://github.com/golangci/golangci-lint/releases/download/v$(GOLANGCI_LINT_VERSION)/$(GOLANGCI_LINT_ARCHIVE)" \
		| tar -x -z --strip-components=1 -C "$(TOOLS_DIR)" "$(GOLANGCI_LINT_ARCHIVEBASE)/golangci-lint"

# Run lint against the previous commit for PR and branch build
# In dev setup look at all changes on top of master
.PHONY: lint
lint: $(GOLANGCI_LINT_BIN)
	@echo "running golangci-lint"
	@git symbolic-ref -q HEAD && REV="origin/HEAD" || REV="HEAD^" ; \
	headSHA=$$(git rev-parse --short=12 $${REV}) ; \
	echo "checking against commit sha $${headSHA}" ; \
	"$(GOLANGCI_LINT_BIN)" run

.PHONY: license-check
# This is a bit convoluted but using a recursive grep on linux fails to write anything when run
# from the Makefile. That caused the pull-request license check run from the github action to
# always pass. The syntax for find is slightly different too but that at least works in a similar
# way on both Mac and Linux. Excluding all .git* files from the checks.
OS := $(shell uname -s | tr '[:upper:]' '[:lower:]')
license-check:
	@echo "checking license headers:"
ifeq (darwin,$(OS))
	$(shell mkdir -p "$(OUTPUT)" && find -E . -not \( -path './.git*' -prune \) -not \( -path ./coverage -prune \) -not \( -path ./node_modules -prune \) -not \( -path ./build -prune \) -not \( -path ./tools -prune \) -not -path ./pnpm-lock.yaml -regex ".*\.(go|sh|md|conf|yaml|yml|html|mod)" -exec grep -L "Licensed to the Apache Software Foundation" {} \; > "$(OUTPUT)/license-check.txt")
else
	$(shell mkdir -p "$(OUTPUT)" && find . -not \( -path './.git*' -prune \) -not \( -path ./coverage -prune \) -not \( -path ./node_modules -prune \) -not \( -path ./build -prune \) -not \( -path ./tools -prune \) -not -path ./pnpm-lock.yaml -regex ".*\.\(go\|sh\|md\|conf\|yaml\|yml\|html\|mod\)" -exec grep -L "Licensed to the Apache Software Foundation" {} \; > "$(OUTPUT)/license-check.txt")
endif
	@if [ -s "$(OUTPUT)/license-check.txt" ]; then \
		echo "following files are missing license header:" ; \
		cat "$(OUTPUT)/license-check.txt" ; \
		exit 1; \
	fi
	@echo "  all OK"

# Start web interface in a local dev setup
.PHONY: start-dev
start-dev: install-pnpm
	pnpm start:srv & pnpm start

# Build the web interface for dev and test
.PHONY: build
build: install-pnpm
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 && pnpm i && ng build

# Run JS unit tests
.PHONY: test_js
test_js: build install-pnpm
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 && pnpm test:singleRun

# Run Go unit tests
.PHONY: test_go
test_go:
	@mkdir -p "$(OUTPUT)"
	"$(GO)" clean -testcache
	"$(GO)" test ./pkg/... -cover -race -tags deadlock -coverprofile=build/coverage.txt -covermode=atomic
	"$(GO)" vet $(REPO)...

# Run the tests after building
.PHONY: test
test: test_js test_go

# Build the web interface in a production ready version
.PHONY: build-prod
build-prod: install-pnpm
	PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 && pnpm i && pnpm build:prod

# Simple clean of generated files only (no local cleanup).
.PHONY: clean
clean:
	@rm -rf ./dist ./coverage ./node_modules ./build ./bin ./out ./out-tsc ./coverage.txt

# Remove all dist files
.PHONY: distclean
distclean: clean
	@rm -rf ./tools

# Build an image based on the production ready version
.PHONY: image
NODE_VERSION := $(shell cat .nvmrc)
image: $(RELEASE_BIN_DIR)/$(SERVER_BINARY)
	@echo "Building web UI docker image"
	DOCKER_BUILDKIT=1 \
	docker build -t "$(WEB_TAG)" . \
	--platform "linux/${DOCKER_ARCH}" \
	--label "yunikorn-web-revision=${WEB_SHA}" \
	--label "Version=${VERSION}" \
	--label "BuildTimeStamp=${DATE}" \
	--build-arg NODE_VERSION=${NODE_VERSION} \
	${QUIET}

.PHONY: build_server_dev
build_server_dev: $(DEV_BIN_DIR)/$(SERVER_BINARY)

$(DEV_BIN_DIR)/$(SERVER_BINARY): go.mod go.sum $(shell find pkg)
	@echo "building local web server binary"
	@mkdir -p "${DEV_BIN_DIR}"
	"$(GO)" build -o=${DEV_BIN_DIR}/${SERVER_BINARY} -race -ldflags \
	'-buildid= -X main.version=${VERSION} -X main.date=${DATE}' \
	./pkg/cmd/web/

.PHONY: build_server_prod
build_server_prod: $(RELEASE_BIN_DIR)/$(SERVER_BINARY)

$(RELEASE_BIN_DIR)/$(SERVER_BINARY): go.mod go.sum $(shell find pkg)
	@echo "building web server binary"
	@mkdir -p ${RELEASE_BIN_DIR}
ifeq ($(REPRO),1)
	docker run -t --rm=true --volume "$(BASE_DIR):/buildroot" "golang:$(GO_REPRO_VERSION)" sh -c "cd /buildroot && \
	CGO_ENABLED=0 GOOS=linux GOARCH=\"${EXEC_ARCH}\" \
	go build -a -o=${RELEASE_BIN_DIR}/${SERVER_BINARY} -trimpath -ldflags \
	'-buildid= -extldflags \"-static\" -X main.version=${VERSION} -X main.date=${DATE}' \
	-tags netgo -installsuffix netgo \
	./pkg/cmd/web/"
else
	CGO_ENABLED=0 GOOS=linux GOARCH="${EXEC_ARCH}" \
	"$(GO)" build -a -o=${RELEASE_BIN_DIR}/${SERVER_BINARY} -trimpath -ldflags \
	'-buildid= -extldflags "-static" -X main.version=${VERSION} -X main.date=${DATE}' \
	-tags netgo -installsuffix netgo \
	./pkg/cmd/web/
endif

# Run the web interface from the production image
.PHONY: run
run: image
	docker run -d -p ${PORT}:9889 "$(WEB_TAG)"

# Start the json-server based on the json-db and route.
.PHONY: json-server
json-server:
	json-server ./json-db.json
