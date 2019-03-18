import { Component, OnInit } from '@angular/core';

import { AreaDataItem } from '@app/models/area-data.model';

@Component({
    selector: 'app-container-history',
    templateUrl: './container-history.component.html',
    styleUrls: ['./container-history.component.scss']
})
export class ContainerHistoryComponent implements OnInit {
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
