import { Component, OnInit, Input } from '@angular/core';

import { AreaDataItem } from '@app/models/area-data.model';

@Component({
  selector: 'app-job-history',
  templateUrl: './job-history.component.html',
  styleUrls: ['./job-history.component.scss']
})
export class JobHistoryComponent implements OnInit {
  @Input()
  chartData: AreaDataItem[];

  constructor() {}

  ngOnInit() {}
}
