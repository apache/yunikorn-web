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

export class CommonUtil {
  static createUniqId(prefix?: string): string {
    const uniqid = Math.random()
      .toString(36)
      .substr(2);

    if (prefix) {
      return prefix + uniqid;
    }

    return uniqid;
  }

  static formatMemory(value: number | string): string {
    let unit = 'bytes';
    let toValue = +value;

    if (toValue / 1000 >= 1) {
      toValue = toValue / 1000;
      unit = 'KB';
    }

    if (toValue / 1000 >= 1) {
      toValue = toValue / 1000;
      unit = 'MB';
    }

    if (toValue / 1000 >= 1) {
      toValue = toValue / 1000;
      unit = 'GB';
    }

    if (toValue / 1000 >= 1) {
      toValue = toValue / 1000;
      unit = 'TB';
    }

    if (toValue / 1000 >= 1) {
      toValue = toValue / 1000;
      unit = 'PB';
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
      return `${(toValue / 1000).toFixed(1)} ${unit}`;
    }

    return toValue.toString();
  }

  static resourceColumnFormatter(value: string): string {
    return value.split(', ').join('<br/>');
  }
}
