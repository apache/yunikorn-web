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
import { ChartDataItem } from '@app/models/chart-data.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';
import { CommonUtil } from '@app/utils/common.util';
import { Chart, BarController, CategoryScale, BarElement } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

Chart.register(BarElement, CategoryScale, BarController);

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  destroy$ = new Subject<boolean>();
  chartContainerId = '';
  donutChartData: ChartDataItem[] = [];
  donutChart: Chart<'bar', number[], string> | undefined;

  @Input() data: ChartDataItem[] = [];
  constructor(private eventBus: EventBusService) { }

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('bar_chart_');

    this.eventBus
      .getEvent(EventMap.WindowResizedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.renderChart(this.donutChartData));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    if (this.data) {
      this.renderChart(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['data'] &&
      changes['data'].currentValue &&
      changes['data'].currentValue.length > 0
    ) {
      this.donutChartData = changes['data'].currentValue;
      this.renderChart(this.donutChartData);
    }
  }

  renderChart(chartData: ChartDataItem[] = []) {
    if (!this.chartContainerId) {
      return;
    }
    const ctx = (document.getElementById(this.chartContainerId) as HTMLCanvasElement).getContext(
      '2d'
    );

    const dataValues = chartData.map((d) => d.value);
    const chartLabels = chartData.map((d) => d.name);
    const colors = chartData.map((d) => d.color);

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    this.donutChart = new Chart(ctx!, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'My First Dataset',
            data: dataValues,
            backgroundColor: colors,
            borderWidth: 1
          }
        ],
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
            position: 'nearest',
          },
        },
      },
    });

    this.donutChart.update();
  }
}
