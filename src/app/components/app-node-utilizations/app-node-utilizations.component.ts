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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BarChartDataSet } from '@app/models/chart-data.model';
import { CHART_COLORS } from '@app/utils/constants';
import { CommonUtil } from '@app/utils/common.util';
import { NodeUtilization, NodeUtilizationsInfo } from '@app/models/node-utilization.model';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';


@Component({
  selector: 'app-node-utilizations',
  templateUrl: './app-node-utilizations.component.html',
  styleUrls: ['./app-node-utilizations.component.scss']
})
export class AppNodeUtilizationsComponent implements OnInit, OnChanges {
  nodeUtilizations: NodeUtilization[] = [];

  // input data for vertical bar chart, key is resource type
  bucketList: string[] = [];                                          // one bucket list for all resource types, length should be exactly 10
  barChartDataSets: BarChartDataSet[] = new Array<BarChartDataSet>(); // one dataset for each type

  @Input() partitionSelected: string = "";

  constructor(
    private scheduler: SchedulerService
  ) { }

  ngOnInit() {
    this.reloadBarChartData()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['partitionSelected']
    ) {
      this.reloadBarChartData()
    }
  }

  reloadBarChartData() {
    this.scheduler.fetchNodeUtilizationsInfo().subscribe((data) => {
      let nodeUtilizationsInfo: NodeUtilizationsInfo[] = data
      for (let i = 0; i < nodeUtilizationsInfo.length; i++) {
        if (nodeUtilizationsInfo[i].partition === this.partitionSelected) {
          let nodeUtilizations = nodeUtilizationsInfo[i].utilizations
          this.fetchBarChartData(nodeUtilizations)
          break;
        }
      }
    });
  }

  fetchBarChartData(nodeUtilizations: NodeUtilization[]) {
    let barChartDataSets = new Array<BarChartDataSet>();
    if (nodeUtilizations.length === 0) {
      // clean bar chart data
      this.barChartDataSets = barChartDataSets;
      return;
    }

    for (let i = 0; i < nodeUtilizations.length; i++) {
      let type = nodeUtilizations[i].type;
      let utilization = nodeUtilizations[i].utilization
      let backgroundColor = CHART_COLORS[i % 10]
      let borderWidth = 1

      if (i === 0) {
        // get bucketList only from the first type of node utilization
        // should always be 10 buckets. (ranging from 0% to 100%).
        this.bucketList = utilization.map((item) => item.bucketName);
      }
      let bucketValues = utilization.map((item) => item.numOfNodes);
      barChartDataSets.push(new BarChartDataSet(
        type,
        bucketValues,
        this.calculateAvgUtilization(bucketValues),
        backgroundColor,
        borderWidth,
        utilization.map((item) => this.getBarDescription(item.nodeNames))
      ))
    }

    // sort by resource type first, then sort by avg utilization rate
    barChartDataSets.sort((a, b) => CommonUtil.resourcesCompareFn(a.label, b.label));
    barChartDataSets.sort((a, b) => b.avgUtilizationRate - a.avgUtilizationRate);
    barChartDataSets = barChartDataSets.slice(0, 5); // only show top 5 resources

    // refresh bar chart data
    this.barChartDataSets = barChartDataSets;
  }

  calculateAvgUtilization(nodeNumInBuckets: number[]): number {
    // Calculates the average utilization of nodes based on a distribution of node utilizations.
    // Note: It not a precise average.
    // value of nodeCounts[0] means node count of 0%~10%, take 5% as the utilization of node in bucket
    // value of nodeCounts[1] means node count of 10%~20, take 15% as the utilization of node in bucket
    // value of nodeCounts[9] means node count of 90%~100%, take 95% as the utilization of node in bucket
    let totalNodes = 0;
    let weightedSum = 0;
    for (let i = 0; i < 10; i++) { //buckets have fixed length 10
      if (nodeNumInBuckets[i] != undefined) {
        totalNodes += nodeNumInBuckets[i];
        weightedSum += nodeNumInBuckets[i] * (5 + 10 * i);
      }
    }
    return totalNodes ? weightedSum / totalNodes / 100 : 0;
  }

  getBarDescription(nodeNames: string[] | null): string {
    let MAX_NODES_IN_DESCRIPTION = 15;
    let description: string | undefined;
    if (nodeNames && nodeNames.length > MAX_NODES_IN_DESCRIPTION) {
      // only put MAX_NODES_IN_DESCRIPTION nodes in description, others will be replaced by '...N more'
      description = nodeNames.slice(0, MAX_NODES_IN_DESCRIPTION).sort().join("\n") + "\n..." + (nodeNames.length - MAX_NODES_IN_DESCRIPTION) + " more";
    } else {
      description = nodeNames ? nodeNames.sort().join("\n") : undefined;
    }
    return description || ""
  }
}
