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

import { NOT_AVAILABLE } from '@app/utils/constants';
import * as moment from 'moment';

export class CommonUtil {
  static createUniqId(prefix?: string): string {
    const uniqid = Math.random().toString(36).substr(2);

    if (prefix) {
      return prefix + uniqid;
    }

    return uniqid;
  }

  static formatMemoryBytes(value: number | string): string {
    const units: readonly string[] = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
    let unit: string = 'B';
    let toValue = +value;
    for (let i = 0, unitslen = units.length; toValue / 1024 >= 1 && i < unitslen; i = i + 1) {
      toValue = toValue / 1024;
      unit = units[i];
    }
    return `${toValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
  }

  static formatEphemeralStorageBytes(value: number | string): string {
    const units: readonly string[] = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    let unit: string = 'B';
    let toValue = +value;
    for (let i = 0, unitslen = units.length; toValue / 1000 >= 1 && i < unitslen; i = i + 1) {
      toValue = toValue / 1000;
      unit = units[i];
    }
    return `${toValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
  }

  static isEmpty(arg: object | any[]): boolean {
    return Object.keys(arg).length === 0;
  }

  static formatCpuCore(value: number | string): string {
    const units: readonly string[] = ['m', '', 'k', 'M', 'G', 'T', 'P', 'E'];
    let unit: string = '';
    let toValue = +value;
    if (toValue > 0) {
      unit = units[0];
    }
    for (let i = 1, unitslen = units.length; toValue / 1000 >= 1 && i < unitslen; i = i + 1) {
      toValue = toValue / 1000;
      unit = units[i];
    }
    return `${toValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`;
  }

  static formatOtherResource(value: number | string): string {
    const units: readonly string[] = ['k', 'M', 'G', 'T', 'P', 'E'];
    let unit: string = '';
    let toValue = +value;
    for (let i = 0, unitslen = units.length; toValue / 1000 >= 1 && i < unitslen; i = i + 1) {
      toValue = toValue / 1000;
      unit = units[i];
    }
    return `${toValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`;
  }

  static resourceColumnFormatter(value: string): string {
    return value.split(', ').join('<br/>');
  }

  static formatPercent(value: number | string): string {
    const toValue = +value;
    return `${toValue.toFixed(0)}%`;
  }

  static timeColumnFormatter(value: null | number) {
    if (value) {
      const millisecs = Math.round(value / (1000 * 1000));
      return moment(millisecs).format('YYYY/MM/DD HH:mm:ss');
    }
    return NOT_AVAILABLE;
  }

  static objFormatter(value: object | null): string {
    console.log('>>>', value);
    if (!value) return NOT_AVAILABLE;
    return JSON.stringify(value, null, 2);
  }

  static resourcesCompareFn(a: string, b: string): number {
    // define the order of resources
    const resourceOrder: { [key: string]: number } = {
      memory: 1,
      vcore: 2,
      pods: 3,
      'ephemeral-storage': 4,
    };
    const orderA = a in resourceOrder ? resourceOrder[a] : Number.MAX_SAFE_INTEGER;
    const orderB = b in resourceOrder ? resourceOrder[b] : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB; // Resources in the order defined above
    } else {
      return a.localeCompare(b); // Other resources will be in lexicographic order
    }
  }

  static getStoredPartition(defaultValue = ''): string {
    const storedPartition = localStorage.getItem('selectedPartitionAndQueue');

    if (storedPartition && storedPartition.indexOf(':') > 0) return storedPartition.split(':')[0];

    return defaultValue;
  }

  static setStoredQueueAndPartition(partition: string, queue = '') {
    if (partition) localStorage.setItem('selectedPartitionAndQueue', `${partition}:${queue}`);
    else localStorage.removeItem('selectedPartitionAndQueue');
  }
}
