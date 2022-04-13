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

import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ArcElement, DoughnutController } from 'chart.js';

import { CommonUtil } from '@app/utils/common.util';
import { DonutDataItem } from '@app/models/donut-data.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';

Chart.register(ArcElement, DoughnutController);

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss'],
})
export class DonutChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  destroy$ = new Subject<boolean>();
  chartContainerId = '';
  donutChartData: DonutDataItem[] = [];
  donutChart: Chart<'doughnut', number[], string> | undefined;

  @Input() data: DonutDataItem[] = [];

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('donut_chart_');

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

  renderChart(chartData: DonutDataItem[] = []) {
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
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          animateScale: true,
          animateRotate: true,
        },
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
