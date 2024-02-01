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

import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { BarChartDataSet } from '@app/models/chart-data.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';
import { CommonUtil } from '@app/utils/common.util';
import { Chart, BarController, CategoryScale, BarElement, Tooltip } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

Chart.register(BarElement, CategoryScale, BarController, Tooltip);

@Component({
  selector: 'app-vertical-bar-chart',
  templateUrl: './vertical-bar-chart.component.html',
  styleUrls: ['./vertical-bar-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerticalBarChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  destroy$ = new Subject<boolean>();
  chartContainerId = '';
  barChart: Chart<'bar' | 'line', number[], string> | undefined;
  hiddenDatasets: boolean[] = [];  // Record the hidden state of each dataset

  @Input() bucketList: string[] = [];                                           // one bucket list for all resource types, length should be exactly 10
  @Input() barChartDataSets: BarChartDataSet[] = new Array<BarChartDataSet>();  // one dataset for each type

  constructor(private eventBus: EventBusService) { }

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('vertical_bar_chart_');
    this.eventBus
      .getEvent(EventMap.WindowResizedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.renderChart(this.bucketList, this.barChartDataSets);
      });
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
      this.cleanLegendCheckBox();
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

    this.handleLegendCheckBox()
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
            hidden: this.hiddenDatasets[index],
          }
        })
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
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
        scales: {
          y: {
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      },
    });

    this.barChart.update();
  }

  handleLegendCheckBox() {
    // create checkbox if no HTMLElement in legend div
    let chartLegendDiv = document.getElementById('chart-legend-div');
    if (chartLegendDiv) {
      if (chartLegendDiv.children.length === 0 && this.barChartDataSets.length > 0) {
        // Record the hidden state of each dataset, by default, the first dataset is visible
        this.barChartDataSets.forEach((dataset, i) => {
          this.hiddenDatasets.push(i === 0 ? false : true);
        });

        chartLegendDiv.appendChild(document.createTextNode('Top 10 resources sorted by load:'));
        chartLegendDiv.appendChild(document.createElement('br'));
        chartLegendDiv.appendChild(document.createTextNode('(high to low)'));
        chartLegendDiv.appendChild(document.createElement('br'));
        chartLegendDiv.appendChild(document.createElement('br'));
        this.barChartDataSets.forEach((dataset, i) => {
          if (chartLegendDiv) {
            let checkbox = document.createElement('input');
            checkbox.id = 'checkbox' + i;
            checkbox.type = 'checkbox';
            checkbox.value = dataset.label;
            checkbox.checked = !this.hiddenDatasets[i];
            chartLegendDiv.appendChild(checkbox);

            let colorBox = document.createElement('div');
            colorBox.style.backgroundColor = dataset.backgroundColor;
            colorBox.className = 'color-box';
            chartLegendDiv.appendChild(colorBox);

            let label = document.createElement('label');
            label.htmlFor = 'checkbox' + i;
            label.appendChild(document.createTextNode(dataset.label));
            chartLegendDiv.appendChild(label);
            chartLegendDiv.appendChild(document.createElement('br'));
            checkbox.onchange = (e) => {
              const datasetMeta = this.barChart?.getDatasetMeta(i);
              if (datasetMeta) {
                this.hiddenDatasets[i] = !checkbox.checked;
                datasetMeta.hidden = !checkbox.checked
                this.barChart?.update();
              }
            };
          }
        });
      }
    }
  }

  cleanLegendCheckBox() {
    this.hiddenDatasets = [];
    let chartLegendDiv = document.getElementById('chart-legend-div');
    if (chartLegendDiv) {
      while (chartLegendDiv.firstChild) {
        chartLegendDiv.removeChild(chartLegendDiv.firstChild);
      }
    }
  }

}
