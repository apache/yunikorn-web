import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

import { SchedulerHealthInfo } from "@app/models/scheduler-health-info.model";
import { SchedulerService } from '@app/services/scheduler/scheduler.service';

@Component({
  selector: 'app-status-view',
  templateUrl: './status-view.component.html',
  styleUrls: ['./status-view.component.scss']
})

export class StatusViewComponent implements OnInit {
  CurrentSchedulerHealth: SchedulerHealthInfo | null = null;

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();

    this.scheduler.fetchSchedlerHealth()
    .pipe(
      finalize(() => {
        this.spinner.hide();
      })
    )
    .subscribe((healthInfos) => {
      if (healthInfos) {
        this.CurrentSchedulerHealth = healthInfos;
      } else {
        this.CurrentSchedulerHealth = null;
      }
    });
  }
}
