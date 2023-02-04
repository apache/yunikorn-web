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

import { CommonUtil } from './common.util';

describe('CommonUtil', () => {
  it('should have createUniqId method', () => {
    expect(CommonUtil.createUniqId).toBeTruthy();
  });

  it('should have formatMemory method', () => {
    expect(CommonUtil.formatMemory).toBeTruthy();
  });

  it('checking formatMemory method result', () => {
    var inputs: number[] = [100, 1100, 1200000, 1300000000, 1400000000000, 1500000000000000];
    var expected: string[] = ['100.0 bytes', '1.1 KB', '1.2 MB', '1.3 GB', '1.4 TB', '1.5 PB'];
    for (var index: number = 0, len = inputs.length; index < len; index = index + 1) {
      expect(CommonUtil.formatMemory(inputs[index])).toEqual(expected[index]);
      expect(CommonUtil.formatMemory(inputs[index].toString())).toEqual(expected[index]);
    }
  });
});
