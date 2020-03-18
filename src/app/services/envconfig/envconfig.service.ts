/**
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
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvConfig } from '@app/models/envconfig.model';
import { DEFAULT_PROTOCOL } from '@app/utils/constants';

const ENV_CONFIG_JSON_URL = './assets/config/envconfig.json';

export function envConfigFactory(envConfig: EnvconfigService) {
  return () => envConfig.loadEnvConfig();
}

@Injectable({
  providedIn: 'root'
})
export class EnvconfigService {
  private envConfig: EnvConfig;
  private uiHostname: string;

  constructor(private httpClient: HttpClient) {
    this.uiHostname = window.location.hostname;
  }

  loadEnvConfig(): Promise<void> {
    return new Promise(resolve => {
      this.httpClient.get<EnvConfig>(ENV_CONFIG_JSON_URL).subscribe(data => {
        this.envConfig = data;
        resolve();
      });
    });
  }

  getSchedulerWebAddress() {
    const protocol = this.envConfig.protocol || DEFAULT_PROTOCOL;
    const proxyWebAddress = this.envConfig.corsproxyWebAddress;
    let schedulerWebAddress = this.envConfig.shedulerWebAddress;
    const schedulerHostname = schedulerWebAddress.split(':')[0];
    const schedulerPort = schedulerWebAddress.split(':')[1];
    if (schedulerHostname === '') {
      schedulerWebAddress = `${this.uiHostname}:${schedulerPort}`;
    }
    if (proxyWebAddress) {
      return `${protocol}//${proxyWebAddress}/${schedulerWebAddress}`;
    }
    return `${protocol}//${schedulerWebAddress}`;
  }

  getPrometheusWebAddress() {
    const protocol = this.envConfig.protocol || DEFAULT_PROTOCOL;
    const proxyWebAddress = this.envConfig.corsproxyWebAddress;
    let prometheusWebAddress = this.envConfig.prometheusWebAddress;
    const prometheusHostname = prometheusWebAddress.split(':')[0];
    const prometheusPort = prometheusWebAddress.split(':')[1];
    if (prometheusHostname === '') {
      prometheusWebAddress = `${this.uiHostname}:${prometheusPort}`;
    }
    if (proxyWebAddress) {
      return `${protocol}//${proxyWebAddress}/${prometheusWebAddress}`;
    }
    return `${protocol}//${prometheusWebAddress}`;
  }
}
