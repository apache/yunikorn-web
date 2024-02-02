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
import { DEFAULT_BAR_COLOR } from '@app/utils/constants';

export class NodeUtilization {
  constructor(
    public type: string,
    public utilization: {
      bucketName: string;
      numOfNodes: number;
      nodeNames: null | string[];
    }[],
  ) { }

  // transform NodeUtilization to NodeUtilizationChartData for NodeUtilization bar chart
  toNodeUtilizationChartData() {
    const MAX_NODES_IN_DESCRIPTION = 15;
    const backgroundColor = DEFAULT_BAR_COLOR;
    let type = this.type;
    let utilization = this.utilization;
    // prepare data
    let chartDataItems = new Array<ChartDataItem>();
    utilization.forEach(({ bucketName, numOfNodes, nodeNames }) => {
      const numOfNodesValue = numOfNodes === -1 ? 0 : numOfNodes;
      let description: string | undefined;
      if (nodeNames && nodeNames.length > MAX_NODES_IN_DESCRIPTION) {
        // only put MAX_NODES_IN_DESCRIPTION nodes in description, others will be replaced by '...N more'
        description = nodeNames.slice(0, MAX_NODES_IN_DESCRIPTION).sort().join("\n") + "\n..." + (nodeNames.length - MAX_NODES_IN_DESCRIPTION) + " more";
      } else {
        description = nodeNames ? nodeNames.sort().join("\n") : undefined;
      }
      chartDataItems.push(new ChartDataItem(
        bucketName,
        numOfNodesValue,
        backgroundColor,
        description
      ));
    });
    return new NodeUtilizationChartData(type, chartDataItems)
  }
}

export class NodeUtilizationsInfo {
  constructor(
    public clusterId: string,
    public partition: string,
    public utilizations: NodeUtilization[],
  ) { }
}

export class NodeUtilizationChartData {
  type: string;
  chartDataItems: ChartDataItem[];

  constructor(type: string, chartDataItems: ChartDataItem[]) {
    this.type = type;
    this.chartDataItems = chartDataItems;
  }
}
