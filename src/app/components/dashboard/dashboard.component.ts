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

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { ClusterInfo } from '@app/models/cluster-info.model';
import { DonutDataItem } from '@app/models/donut-data.model';
import { AreaDataItem } from '@app/models/area-data.model';
import { HistoryInfo } from '@app/models/history-info.model';
import { EventbusService, EventMap } from '@app/services/eventbus/eventbus.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  clusterList: ClusterInfo[] = [];
  appStatusData: DonutDataItem[] = [];
  containerStatusData: DonutDataItem[] = [];
  appHistoryData: AreaDataItem[] = [];
  containerHistoryData: AreaDataItem[] = [];
  clusterInfo: ClusterInfo = this.getEmptyClusterInfo();
  initialAppHistory: HistoryInfo[];
  initialContainerHistory: HistoryInfo[];

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private eventbus: EventbusService
  ) {}

  ngOnInit() {
    this.spinner.show();

    this.scheduler
      .fetchClusterList()
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe(list => {
        this.clusterList = list;

        if (list && list[0]) {
          this.clusterInfo = list[0];
          this.clusterInfo.clusterStatus = 'Active';
          this.updateAppStatusData(this.clusterInfo);
          this.updateContainerStatusData(this.clusterInfo);
        }
      });

    this.scheduler.fetchAppHistory().subscribe(data => {
      this.initialAppHistory = data;
      this.appHistoryData = this.getAreaChartData(data);
    });

    this.scheduler.fetchContainerHistory().subscribe(data => {
      this.initialContainerHistory = data;
      this.containerHistoryData = this.getAreaChartData(data);
    });

    this.eventbus.getEvent(EventMap.LayoutChangedEvent).subscribe(() => {
      this.appHistoryData = this.getAreaChartData(this.initialAppHistory);
      this.containerHistoryData = this.getAreaChartData(this.initialContainerHistory);
    });
  }

  updateAppStatusData(info: ClusterInfo) {
    this.appStatusData = [
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

  getEmptyClusterInfo(): ClusterInfo {
    return {
      clusterName: 'n/a',
      clusterStatus: 'n/a',
      totalApplications: 'n/a',
      failedApplications: 'n/a',
      pendingApplications: 'n/a',
      runningApplications: 'n/a',
      completedApplications: 'n/a',
      totalContainers: 'n/a',
      failedContainers: 'n/a',
      pendingContainers: 'n/a',
      runningContainers: 'n/a',
      activeNodes: 'n/a',
      totalNodes: 'n/a',
      failedNodes: 'n/a'
    };
  }
}
