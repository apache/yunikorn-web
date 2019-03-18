import { Component, OnInit } from '@angular/core';

import { AreaDataItem } from '@app/models/area-data.model';

@Component({
    selector: 'app-job-history',
    templateUrl: './job-history.component.html',
    styleUrls: ['./job-history.component.scss']
})
export class JobHistoryComponent implements OnInit {
    chartData: AreaDataItem[] = [];

    constructor() {}

    ngOnInit() {
        const sampleData: AreaDataItem[] = [];
        let nowSecs = Math.round(Date.now() / 1000);
        for (let index = 0; index < 24; index++) {
            nowSecs = nowSecs - 3600;
            sampleData.push(
                new AreaDataItem(Math.round(Math.random() * 100), new Date(nowSecs * 1000))
            );
        }
        this.chartData = sampleData;
    }
}
