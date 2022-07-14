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

ARG ARCH=
ARG NODE_VERSION=
# Buildstage: use the local architecture
FROM node:${NODE_VERSION}-alpine as buildstage

WORKDIR /work
# Only copy what is needed for the build
COPY *.json *.js yarn.lock .browserslistrc /work/
COPY src /work/src/

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 yarn install
RUN yarn build:prod

# Imagestage: use the requested architecture
FROM ${ARCH}nginx:1.22-alpine

# Home location for all data and configs
ENV HOME=/opt/yunikorn
EXPOSE 9889

# Always run everything as yunikorn
RUN addgroup -S -g 4444 yunikorn && \
    adduser -S -h $HOME -G yunikorn -u 4444 yunikorn -s /bin/sh && \
    mkdir -p $HOME && \
    chown -R 4444:0 $HOME && \
    chmod -R g=u $HOME

COPY --chown=4444:0 ./nginx/nginx.conf $HOME/
COPY --chown=4444:0 --from=buildstage /work/dist/yunikorn-web $HOME/html/

WORKDIR $HOME
USER yunikorn
ENTRYPOINT nginx -c $HOME/nginx.conf
