FROM nginx:1.18.0-alpine

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY ./dist/yunikorn-web .
