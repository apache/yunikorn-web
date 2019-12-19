import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js';

import { CommonUtil } from '@app/utils/common.util';
import { DonutDataItem } from '@app/models/donut-data.model';

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit, AfterViewInit, OnChanges {
  chartContainerId: string;

  @Input() data: DonutDataItem[] = [];
  @Input() width = '360px';
  @Input() height = '180px';

  constructor() {}

  ngOnInit() {
    this.chartContainerId = CommonUtil.createUniqId('donut_chart_');
  }

  ngAfterViewInit() {
    if (this.data) {
      this.renderChart(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue && changes.data.currentValue.length > 0) {
      this.renderChart(changes.data.currentValue);
    }
  }

  renderChart(chartData: DonutDataItem[] = []) {
    if (!this.chartContainerId) {
      return;
    }
    const ctx = (document.getElementById(this.chartContainerId) as HTMLCanvasElement).getContext(
      '2d'
    );

    const dataValues = chartData.map(d => d.value);
    const chartLabels = chartData.map(d => d.name);
    const colors = chartData.map(d => d.color);

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        animation: {
          animateScale: true,
          animateRotate: true
        },
        legend: {
          display: false
        },
        title: {
          display: false
        }
      }
    });

    chart.update();
  }
}
