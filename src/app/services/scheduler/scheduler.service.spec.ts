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

import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {EnvconfigService} from '@app/services/envconfig/envconfig.service';
import {MockEnvconfigService} from '@app/testing/mocks';

import {SchedulerService} from './scheduler.service';
import {SchedulerResourceInfo} from '@app/models/resource-info.model';
import {NOT_AVAILABLE} from '@app/utils/constants';

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SchedulerService, { provide: EnvconfigService, useValue: MockEnvconfigService }],
    });
    service = TestBed.inject(SchedulerService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
    
  });

  it('should format SchedulerResourceInfo correctly', () => {
    type TestCase = {
      description: string;
      schedulerResourceInfo: SchedulerResourceInfo;
      expected: string;
    };
  
    const testCases: TestCase[] = [
      {
        description: 'test simple resourceInfo',
        schedulerResourceInfo: {
          memory: 1024,
          vcore: 2,
        },
        expected: 'Memory: 1 KiB, CPU: 2m'
      },
      {
        description: 'test undefined resourceInfo',
        schedulerResourceInfo : undefined as any,
        expected: `${NOT_AVAILABLE}`
      },
      {
        description: 'test empty resourceInfo',
        schedulerResourceInfo : {} as any,
        expected: `${NOT_AVAILABLE}`
      },
      {
        description: 'Test zero values',
        schedulerResourceInfo: {
          memory: 0,
          vcore: 0,
          'ephemeral-storage': 0,
          'hugepages-2Mi': 0,
          'hugepages-1Gi': 0,
          'pods': 0
        },
        expected: 'Memory: 0 bytes, CPU: 0, ephemeral-storage: n/a, hugepages-1Gi: n/a, hugepages-2Mi: n/a, pods: n/a'
      },
      {
        description: 'Test resource ordering',
        schedulerResourceInfo: {
          'ephemeral-storage': 2048,
          memory: 1024,
          vcore: 2,
          'TPU': 30000,
          'GPU': 40000,
          'hugepages-2Mi':2097152,
          'hugepages-1Gi':1073741824,
          'pods': 10000
        },
        expected: 'Memory: 1 KiB, CPU: 2m, ephemeral-storage: 2.05 KB, GPU: 40k, hugepages-1Gi: 1 GiB, hugepages-2Mi: 2 MiB, pods: 10k, TPU: 30k'
      }
    ];

    testCases.forEach((testCase: TestCase) => {
      const result = (service as any).formatResource(testCase.schedulerResourceInfo); // ignore type typecheck to access private method
      expect(result).toEqual(testCase.expected);
    });
  });
});
