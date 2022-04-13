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
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeSeriesScale,
  Filler,
  Legend,
  Title,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import { CommonUtil } from '@app/utils/common.util';
import { AreaDataItem } from '@app/models/area-data.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';

Chart.register(
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeSeriesScale,
  Filler,
  Legend,
  Title
);

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss'],
})
export class AreaChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  destroy$ = new Subject<boolean>();

  chartContainerId = '';
  areaChartData: AreaDataItem[] = [];
  areaChart: Chart<'line', AreaDataItem[], unknown> | undefined;

  @Input() data: AreaDataItem[] = [];
  @Input() color = '#72bdd7';
  @Input() tooltipLabel = 'Value';

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('area_chart_');

    this.eventBus
      .getEvent(EventMap.WindowResizedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.renderChart(this.areaChartData));
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
      this.areaChartData = changes['data'].currentValue;
      this.renderChart(this.areaChartData);
    }
  }

  renderChart(chartData: AreaDataItem[] = []) {
    if (!this.chartContainerId) {
      return;
    }

    const ctx = (document.getElementById(this.chartContainerId) as HTMLCanvasElement).getContext(
      '2d'
    );

    if (this.areaChart) {
      this.areaChart.destroy();
    }

    this.areaChart = new Chart(ctx!, {
      type: 'line',
      data: {
        datasets: [
          {
            data: chartData,
            backgroundColor: 'rgba(114, 189, 215, 0.5)',
            borderColor: 'rgb(114, 189, 215)',
            label: this.tooltipLabel,
            fill: 'start',
            pointBackgroundColor: 'rgb(114, 189, 215)',
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        spanGaps: false,
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.4,
          },
        },
        plugins: {
          filler: {
            propagate: false,
          },
          legend: {
            display: true,
          },
          title: {
            display: false,
          },
          tooltip: {
            position: 'nearest',
          },
        },
        scales: {
          x: {
            type: 'timeseries',
            time: {
              unit: 'minute',
            },
          },
          y: {
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });

    this.areaChart.update();
  }
}
