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
