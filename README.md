<!--
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 -->

# Yunikorn web UI
YuniKorn web provides a web interface on top of the scheduler. It provides insight in the current and historic scheduler status.
It depends on `yunikorn-core` which encapsulates all the actual scheduling logic.

For detailed information on the components and how to build the overall scheduler please see the [yunikorn-core](https://github.com/apache/yunikorn-core).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.0.

## Development Environment setup
### Dependencies
The project requires a number of external tools to be installed before the build and development:
- [Node.js](https://nodejs.org/en/)
- [Angular CLI](https://github.com/angular/angular-cli)
- [Karma](https://karma-runner.github.io)
- [yarn](https://www.npmjs.com/package/yarn)
- [json-server](https://www.npmjs.com/package/json-server)

### Development server

Run `make start-dev` for a development server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `make build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `make build-prod` for a production build.
Production builds will add the `--prod` flag to the angular build.

### Docker image build
Image builds are geared towards a production build and will always build with the `--prod` flag set.

Run `make image` to build the docker image `apache/yunikorn:web-latest`. 
Run `make run` to build the image and deploy the container from the docker image `apache/yunikorn:web-latest`.

You can set `REGISTRY`, `VERSION` and `DOCKER_ARCH` in the commandline to build docker image with a specified version, registry and host architecture. For example,
```
make image REGISTRY=apache VERSION=latest DOCKER_ARCH=amd64
```
This command will build binary with version `web-latest` and the docker full image tag is `apache/yunikorn:web-amd64-latest`.

The Makefile is smart enough to detect your host architecture but it will tag the image name.

Run `make deploy-prod` to build and deploy the scheduler webapp using docker-compose.
The project uses [multi-stage build](https://docs.docker.com/develop/develop-images/multistage-build/) feature of the docker and requires Docker 17.05 or higher.

### Running tests

All tests can be executed via `make test`. It will first build the project and then execute the unit tests followed by the end to end tests.  
If you want to run the unit tests separately, run `yarn test` to execute them via [Karma](https://karma-runner.github.io). If you want to run the unit tests with code coverage, run `yarn test:coverage`.

## Local development
Beside the simple all in way to start the development server via make you can also start a development environment manually. 

The application depends on [json-server](https://www.npmjs.com/package/json-server) for data. Install json-server locally. Run `yarn start:srv` to start json-server for local development.
Run `yarn start` to start the angular development server and navigate to `http://localhost:4200/`.

## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Code scaffolding
Run `ng generate component component-name` to generate a new component.

You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Port configurations
The default port used for the web server is port 9889 and is set in the `nginx/nginx.conf`. 

The port is also referenced in other scripts and configurations to this port also, if you change the port make sure that the other locations are updated:
- Makefile

## How do I contribute code?
See how to contribute code from [this guide](https://yunikorn.apache.org/community/how_to_contribute).
