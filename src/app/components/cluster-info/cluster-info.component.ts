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
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { ClusterInfo } from '@app/models/cluster-info.model';
import { DonutDataItem } from '@app/models/donut-data.model';
import { AreaDataItem } from '@app/models/area-data.model';
import { HistoryInfo } from '@app/models/history-info.model';

@Component({
  selector: 'app-cluster-info',
  templateUrl: './cluster-info.component.html',
  styleUrls: ['./cluster-info.component.scss']
})
export class ClusterInfoComponent implements OnInit {
  clusterInfo: ClusterInfo = null;
  jobStatusData: DonutDataItem[] = [];
  containerStatusData: DonutDataItem[] = [];
  jobHistoryData: AreaDataItem[] = [];
  containerHistoryData: AreaDataItem[] = [];

  constructor(
    private scheduler: SchedulerService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    const clusterName = this.route.parent.snapshot.params['clusterName'];
    this.spinner.show();

    this.scheduler
      .fetchClusterByName(clusterName)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe(data => {
        this.updateJobStatusData(data);
        this.updateContainerStatusData(data);
      });

    this.scheduler.fetchAppHistory().subscribe(data => {
      this.jobHistoryData = this.getAreaChartData(data);
    });

    this.scheduler.fetchContainerHistory().subscribe(data => {
      this.containerHistoryData = this.getAreaChartData(data);
    });
  }

  updateJobStatusData(info: ClusterInfo) {
    this.jobStatusData = [
      new DonutDataItem('Failed', +info.failedApplications, '#cc6164'),
      new DonutDataItem('Pending', +info.pendingApplications, '#facc54'),
      new DonutDataItem('Running', +info.runningApplications, '#26bbf0'),
      new DonutDataItem('Completed', +info.completedApplications, '#60cea5')
    ];
  }

  updateContainerStatusData(info: ClusterInfo) {
    this.containerStatusData = [
      new DonutDataItem('Failed', +info.failedContainers, '#cc6164'),
      new DonutDataItem('Pending', +info.pendingContainers, '#facc54'),
      new DonutDataItem('Running', +info.runningContainers, '#26bbf0')
    ];
  }

  getAreaChartData(data: HistoryInfo[]): AreaDataItem[] {
    return data.map(d => new AreaDataItem(d.value, new Date(d.timestamp)));
  }
}
