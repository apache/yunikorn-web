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
  HostListener,
} from '@angular/core';
import Chart from 'chart.js';

import { CommonUtil } from '@app/utils/common.util';

import { AreaDataItem } from '@app/models/area-data.model';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss'],
})
export class AreaChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  chartContainerId: string;

  @Input() data: AreaDataItem[] = [];
  @Input() color = '#72bdd7';
  @Input() tooltipLabel = 'Value';

  private changeSize = new Subject();

  dataShowing: AreaDataItem[];

  constructor() {
    this.changeSize
      .asObservable()
      .pipe()
      .subscribe((event) => this.renderChart(this.dataShowing));
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.changeSize.next(event);
  }

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('area_chart_');
  }

  ngAfterViewInit() {
    if (this.data) {
      this.renderChart(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue && changes.data.currentValue.length > 0) {
      this.dataShowing = changes.data.currentValue;
      this.renderChart(this.dataShowing);
    }
  }

  renderChart(chartData: AreaDataItem[] = []) {
    if (!this.chartContainerId) {
      return;
    }

    const ctx = (document.getElementById(this.chartContainerId) as HTMLCanvasElement).getContext(
      '2d'
    );

    const chart = new Chart(ctx, {
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
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        legend: {
          display: true,
        },
        title: {
          display: false,
        },
        elements: {
          line: {
            tension: 0.4,
          },
        },
        plugins: {
          filler: {
            propagate: false,
          },
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'minute',
              },
            },
          ],
        },
      },
    });

    chart.update();
  }

  ngOnDestroy() {
    this.changeSize.unsubscribe();
  }
}
