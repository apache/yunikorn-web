# Yunikorn web UI
YuniKorn web provides a web interface on top of the scheduler. It provides insight in the current and historic scheduler status.
It depends on `yunikorn-core` which encapsulates all the actual scheduling logic.

For detailed information on the components and how to build the overall scheduler please see the [yunikorn-core](https://github.com/cloudera/yunikorn-core).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.3.

## Development Environment setup
### Dependencies
The project requires a number of external tools to be installed before the build and development:
- [Node.js](https://nodejs.org/en/)
- [Angular CLI](https://github.com/angular/angular-cli)
- [Karma](https://karma-runner.github.io)
- [Protractor](http://www.protractortest.org/)
- [json-server](https://www.npmjs.com/package/json-server)
- [yarn](https://www.npmjs.com/package/yarn)

### Development server

Run `make start-dev` for a development server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `make build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `make build-prod` for a production build.
Production builds will add the `--prod` flag to the angular build.

### Docker image build
Image builds are geared towards a production build and will always build with the `--prod` flag set.

Run `make image` to build the docker image `yunikorn-web`. 
Run `make run` to build the image and deploy the container from the docker image `yunikorn-web`.

Run `make deploy-prod` to build and deploy the scheduler webapp using docker-compose.
The project uses [multi-stage build](https://docs.docker.com/develop/develop-images/multistage-build/) feature of the docker and requires Docker 17.05 or higher.

### Running tests

All tests can be executed via `make test`. It will first build the project and then execute the unit tests followed by the end to end tests.  
If you want to run the unit tests separately, run `ng test` to execute them via [Karma](https://karma-runner.github.io).

The end to end tests run via [Protractor](http://www.protractortest.org/) and can be directly run by executing `ng e2e`.

## Local development
Beside the simple all in way to start the development server via make you can also start a development environment manually. 

The application depends on [json-server](https://www.npmjs.com/package/json-server) for data. Install json-server locally. Run `yarn start:srv` to start json-server for local development.
Run `yarn start` to start the angular development server and navigate to `http://localhost:4200/`.

## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli).

## Code scaffolding
Run `ng generate component component-name` to generate a new component.

You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Endpoint configurations
The configurations for the endpoints of scheduler and prometheus should be provided in the `src/assets/config/envconfig.json` file.

The web address can be configured as `"hostname:port"` or `":port"`. If there is no hostname provided, the hostname will be inferred from the URL at which the UI is running.
The default port used for the web server is port 9889 and is set in the `nginx/nginx.conf`. 

The port is also referenced in other scripts and configurations to this port also, if you change the port make sure that the other locations are updated:
- docker-compose.yml
- start.sh
- Makefile

## How do I contribute code?

See how to contribute code from [this guide](docs/how-to-contribute.md).
