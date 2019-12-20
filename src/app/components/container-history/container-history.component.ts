import { Component, OnInit, Input } from '@angular/core';

import { AreaDataItem } from '@app/models/area-data.model';

@Component({
  selector: 'app-container-history',
  templateUrl: './container-history.component.html',
  styleUrls: ['./container-history.component.scss']
})
export class ContainerHistoryComponent implements OnInit {
  @Input()
  chartData: AreaDataItem[];

  constructor() {}

  ngOnInit() {}
}
