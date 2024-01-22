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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatCardModule } from '@angular/material/card';
import { AppNodeUtilizationsComponent } from '@app/components/app-node-utilizations/app-node-utilizations.component';
import { VerticalBarChartComponent } from '@app/components/vertical-bar-chart/vertical-bar-chart.component';

describe('AppNodeUtilizationsComponent', () => {
  let component: AppNodeUtilizationsComponent;
  let fixture: ComponentFixture<AppNodeUtilizationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatCardModule],
      declarations: [AppNodeUtilizationsComponent, VerticalBarChartComponent]
    });

    fixture = TestBed.createComponent(AppNodeUtilizationsComponent);
    component = fixture.componentInstance;
  });

  it('test AppNodeUtilizationsComponent.calculateAvgUtilization()', () => {
    type TestCase = {
      description: string;
      nodeNumInBuckets: number[];
      expected: number;
    };
    const testCases: TestCase[] = [
      {
        description: 'Test 2 nodes, 1 node in 0~10%, 1 node in 10~20%',
        nodeNumInBuckets: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        expected: 0.1
      },
      {
        description: 'Test 10 nodes, 1 node in each bucket',
        nodeNumInBuckets: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        expected: 0.5
      },
      {
        description: 'Test zero node in buckets',
        nodeNumInBuckets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        expected: 0
      },
    ]

    testCases.forEach((testCase: TestCase) => {
      const result = component.calculateAvgUtilization(testCase.nodeNumInBuckets);
      expect(result).toEqual(testCase.expected);
    });
  });


  it('test AppNodeUtilizationsComponent.getBarDescription()', () => {
    type TestCase = {
      description: string;
      nodeNames: string[];
      expected: string;
    };
    const testCases: TestCase[] = [
      {
        description: 'Test single node',
        nodeNames: [""],
        expected: ""
      },
      {
        description: 'Test unordered multi-nodes',
        nodeNames: ["node02", "node01"],
        expected: "node01\nnode02"
      },
      {
        description: 'Test over than MAX_NODES_IN_DESCRIPTION nodes',
        nodeNames: ["node01", "node02", "node03", "node04", "node05", "node06", "node07", "node08", "node09", "node10", "node11", "node12", "node13", "node14", "node15", "node16"],
        expected: "node01\nnode02\nnode03\nnode04\nnode05\nnode06\nnode07\nnode08\nnode09\nnode10\nnode11\nnode12\nnode13\nnode14\nnode15\n...1 more"
      },
    ]

    testCases.forEach((testCase: TestCase) => {
      const result = component.getBarDescription(testCase.nodeNames);
      expect(result).toEqual(testCase.expected);
    });
  });
});
