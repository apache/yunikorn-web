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

import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BarChartDataSet } from '@app/models/chart-data.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';
import { CommonUtil } from '@app/utils/common.util';
import { Chart, BarController, CategoryScale, BarElement, Tooltip } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

Chart.register(BarElement, CategoryScale, BarController, Tooltip);

@Component({
  selector: 'app-vertical-bar-chart',
  templateUrl: './vertical-bar-chart.component.html',
  styleUrls: ['./vertical-bar-chart.component.scss']
})
export class VerticalBarChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  destroy$ = new Subject<boolean>();
  chartContainerId = '';
  barChart: Chart<'bar' | 'line', number[], string> | undefined;

  @Input() bucketList: string[] = [];                                           // one bucket list for all resource types, length should be exactly 10
  @Input() barChartDataSets: BarChartDataSet[] = new Array<BarChartDataSet>();  // one dataset for each type

  constructor(private eventBus: EventBusService) { }

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('vertical_bar_chart_');

    this.eventBus
      .getEvent(EventMap.WindowResizedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.renderChart(this.bucketList, this.barChartDataSets));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    if (this.barChartDataSets) {
      this.renderChart(this.bucketList, this.barChartDataSets);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['barChartDataSets'] &&
      changes['barChartDataSets'].currentValue
    ) {
      this.barChartDataSets = changes['barChartDataSets'].currentValue;
      this.renderChart(this.bucketList, this.barChartDataSets);
    }
  }

  renderChart(bucketList: string[], barChartDataSets: BarChartDataSet[]) {
    if (!this.chartContainerId) {
      return;
    }
    const ctx = (document.getElementById(this.chartContainerId) as HTMLCanvasElement).getContext(
      '2d'
    );

    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(ctx!, {
      type: 'bar',
      data: {
        labels: this.bucketList,
        datasets: barChartDataSets.map((item, index) => {
          return {
            label: item.label,
            data: item.data,
            backgroundColor: item.backgroundColor,
            borderWidth: item.borderWidth,
            // By default, only display the domaint resource type.
            hidden: index === 0 ? false : true
          }
        })
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: false,
          },
          tooltip: {
            enabled: true,
            position: 'nearest',
            callbacks: {
              label: function (context) {
                return barChartDataSets[context.datasetIndex].label;
              },
              footer: function (context) {
                // show bar description on tooltip footer
                let datasetIndex = context[0].datasetIndex;
                let dataIndex = context[0].dataIndex;
                let nodeCount = context[0].parsed.y
                let unit = nodeCount > 1 ? 'nodes' : 'node';
                return "Total: " + nodeCount + " " + unit + "\n\n" + barChartDataSets[datasetIndex].description[dataIndex];
              }
            }
          },
        },
      },
    });

    this.barChart.update();
  }
}
