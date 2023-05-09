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
  CurrentSchedulerHealth: SchedulerHealthInfo = new SchedulerHealthInfo;

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();

    this.scheduler
    .fecthHealthchecks()
    .pipe(
      finalize(() => {
        this.spinner.hide();
      })
    )
    .subscribe((healthInfos) => {
      if (healthInfos) {
        this.CurrentSchedulerHealth = healthInfos;
      } else {
        this.CurrentSchedulerHealth = new SchedulerHealthInfo;
      }
    });
  }
}
