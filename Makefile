deploy-prod:
	docker-compose up -d

build-prod:
	yarn install && yarn build:prod

start-dev:
	yarn start:srv & yarn start

build-webapp:
	docker build -t yunikorn/scheduler-web:0.3.5 .

start-webapp:
	docker run -d -p 8089:80 yunikorn/scheduler-web:0.1.0
