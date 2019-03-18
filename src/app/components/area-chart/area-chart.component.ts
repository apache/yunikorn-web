import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js';

import { CommonUtils } from '@app/util/common.util';

import { AreaDataItem } from '@app/models/area-data.model';

@Component({
    selector: 'app-area-chart',
    templateUrl: './area-chart.component.html',
    styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent implements OnInit, AfterViewInit, OnChanges {
    chartContainerId: string;

    @Input() data: AreaDataItem[] = [];
    @Input() color = '#72bdd7';
    @Input() tooltipLabel = 'Value';

    constructor() {}

    ngOnInit() {
        this.chartContainerId = CommonUtils.createUniqId('area_chart_');
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

    renderChart(chartData: AreaDataItem[] = []) {
        if (!this.chartContainerId) {
            return;
        }

        const ctx = (document.getElementById(
            this.chartContainerId
        ) as HTMLCanvasElement).getContext('2d');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        data: chartData,
                        backgroundColor: 'rgba(114, 189, 215, 0.5)',
                        borderColor: 'rgb(114, 189, 215)',
                        label: this.tooltipLabel,
                        fill: 'start'
                    }
                ]
            },
            options: {
                responsive: true,
                spanGaps: false,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                },
                plugins: {
                    filler: {
                        propagate: false
                    }
                },
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            }
                        }
                    ]
                }
            }
        });

        chart.update();
    }
}
