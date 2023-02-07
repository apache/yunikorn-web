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

  static formatMemory(value: number | string): string {
    const units: readonly string[] = ['KB', 'MB', 'GB', 'TB', 'PB'];
    var unit: string = 'bytes';
    let toValue = +value
    for (var i: number = 0, unitslen = units.length; toValue / 1000 >= 1 && i < unitslen;i = i + 1) {
      toValue = toValue / 1000;
      unit = units[i];
    }
    return `${toValue.toFixed(1)} ${unit}`;
  }

  static isEmpty(arg: object | any[]): boolean {
    return Object.keys(arg).length === 0;
  }

  static formatCount(value: number | string): string {
    const unit = 'K';
    const toValue = +value;

    if (toValue >= 10000) {
      return `${(toValue / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
    }

    return toValue.toLocaleString();
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
}
