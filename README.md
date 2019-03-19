# Yunikorn UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Local development

The app depends on [json-server](https://www.npmjs.com/package/json-server) for data. Install json-server locally. Run `make start-jsonserver` to start json-server for local development.

## Docker for production

Run `make build-webapp` to build the docker image scheduler-web. Run `make start-webapp` to deploy the container from the docker image scheduler-web.

## Docker compose for production

Run `make deploy-prod` to build and deploy the scheduler webapp using docker-compose.

## Endpoint configurations

The configurations for the endpoints of scheduler and prometheus should be provided in the `/assets/config/envconfig.json` file.
The webaddress can be configured as `"hostname:port"` or `":port"`. If there is no hostname provided, the hostname will be inferred from the URL at which the UI is running.