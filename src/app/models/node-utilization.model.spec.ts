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

import { ChartDataItem } from '@app/models/chart-data.model';
import { CHART_COLORS } from '@app/utils/constants';
import { NodeUtilization, NodeUtilizationChartData } from '@app/models/node-utilization.model';

describe('NodeUtilization', () => {

  it('test NodeUtilization.toNodeUtilizationChartData()', () => {
    const nodeUtilization = new NodeUtilization('vcores', [
      { bucketName: '0-10%', numOfNodes: 2, nodeNames: ['node1', 'node2'] },
      { bucketName: '10-20%', numOfNodes: 3, nodeNames: ['node3', 'node4', 'node5'] },
      { bucketName: '20-30%', numOfNodes: 16, nodeNames: ['node6', 'node7', 'node8','node9', 'node10', 'node11','node12', 'node13', 'node14','node15', 'node16', 'node17','node18', 'node19', 'node20', 'node21'] },
    ]);

    const result = nodeUtilization.toNodeUtilizationChartData();

    expect(result).toBeInstanceOf(NodeUtilizationChartData);
    expect(result.type).toBe('vcores');
    expect(result.chartDataItems).toEqual([
      new ChartDataItem('0-10%', 2, CHART_COLORS[0], 'node1\nnode2'),
      new ChartDataItem('10-20%', 3, CHART_COLORS[0], 'node3\nnode4\nnode5'),
      new ChartDataItem('20-30%', 16, CHART_COLORS[0], 'node10\nnode11\nnode12\nnode13\nnode14\nnode15\nnode16\nnode17\nnode18\nnode19\nnode20\nnode6\nnode7\nnode8\nnode9\n...1 more'),
    ]);
  });
});
