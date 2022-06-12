#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# State 1
FROM node:16.14.2-alpine3.15 as buildstage

WORKDIR /usr/uiapp

COPY . .

RUN rm -rf ./dist

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 yarn install

RUN yarn build:prod

# Stage 2
FROM nginx:1.21.4-alpine

COPY --from=buildstage /usr/uiapp/dist/yunikorn-web /usr/share/nginx/html

COPY ./nginx/default.conf.template /etc/nginx/templates/

RUN mkdir -p /opt/nginx/work && \
    chown -R nginx:nginx /opt/nginx/work /etc/nginx/conf.d && \
    chmod 755 /opt/nginx/work && \
    mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx && \
    sed -i 's_^user .*$__' /etc/nginx/nginx.conf && \
    sed -i 's_^pid .*$_pid /opt/nginx/work/nginx.pid;_' /etc/nginx/nginx.conf

WORKDIR /opt/nginx/work
USER nginx
ENTRYPOINT ["sh", "-c", "envsubst \"`env | awk -F = '{printf \" $$%s\", $$1}'`\" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -c /etc/nginx/nginx.conf -g 'daemon off;'"]
