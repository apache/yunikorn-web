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
import { Applications, Partition } from '@app/models/partition-info.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';
import { NOT_AVAILABLE } from '@app/utils/constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  clusterList: ClusterInfo[] = [];
  partitionList: Partition[] = [];
  nodeSortPolicy = '';
  partitionName = '';
  totalNodes = '';
  totalApplications = '';
  totalContainers = '';
  appStatusData: DonutDataItem[] = [];
  containerStatusData: DonutDataItem[] = [];
  appHistoryData: AreaDataItem[] = [];
  containerHistoryData: AreaDataItem[] = [];
  clusterInfo: ClusterInfo = this.getEmptyClusterInfo();
  initialAppHistory: HistoryInfo[] = [];
  initialContainerHistory: HistoryInfo[] = [];

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private eventBus: EventBusService
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
      .subscribe((list) => {
        this.clusterList = list;

        if (list && list[0]) {
          this.clusterInfo = list[0];
          this.clusterInfo.clusterStatus = 'Active';
        }
      });

    this.scheduler.fetchPartitionList().subscribe((list) => {
      this.partitionList = list;

      if (list && list[0]) {
        this.nodeSortPolicy = list[0].nodeSortingPolicy
          ? list[0].nodeSortingPolicy.type
          : NOT_AVAILABLE;

        this.partitionName = list[0].name || NOT_AVAILABLE;
        this.totalNodes = String(list[0].totalNodes);
        this.totalApplications = String(list[0].applications.total);
        this.totalContainers = String(list[0].totalContainers);
        this.updateAppStatusData(list[0].applications);
        this.updateContainerStatusData(list[0]);
      } else {
        this.nodeSortPolicy = NOT_AVAILABLE;
        this.partitionName = NOT_AVAILABLE;
        this.totalNodes = NOT_AVAILABLE;
        this.totalApplications = NOT_AVAILABLE;
        this.totalContainers = NOT_AVAILABLE;
      }
    });

    this.scheduler.fetchAppHistory().subscribe((data) => {
      this.initialAppHistory = data;
      this.appHistoryData = this.getAreaChartData(data);
    });

    this.scheduler.fetchContainerHistory().subscribe((data) => {
      this.initialContainerHistory = data;
      this.containerHistoryData = this.getAreaChartData(data);
    });

    this.eventBus.getEvent(EventMap.LayoutChangedEvent).subscribe(() => {
      this.updateAppStatusData(this.partitionList[0].applications);
      this.updateContainerStatusData(this.partitionList[0]);
      this.appHistoryData = this.getAreaChartData(this.initialAppHistory);
      this.containerHistoryData = this.getAreaChartData(this.initialContainerHistory);
    });
  }

  updateAppStatusData(applications: Applications) {
    this.appStatusData = []
    if (applications.New) this.appStatusData.push(new DonutDataItem('New', applications.New, '#facc54'))
    if (applications.Accepted) this.appStatusData.push(new DonutDataItem('Accepted', applications.Accepted, '#facc54'))
    if (applications.Starting) this.appStatusData.push(new DonutDataItem('Starting', applications.Starting, '#26bbf0'))
    if (applications.Running) this.appStatusData.push(new DonutDataItem('Running', applications.Running, '#26bbf0'))
    if (applications.Rejected) this.appStatusData.push(new DonutDataItem('Rejected', applications.Rejected, '#cc6164'))
    if (applications.Completing) this.appStatusData.push(new DonutDataItem('Completing', applications.Completing, '#60cea5'))
    if (applications.Completed) this.appStatusData.push(new DonutDataItem('Completed', applications.Completed, '#60cea5'))
    if (applications.Failing) this.appStatusData.push(new DonutDataItem('Failing', applications.Failing, '#cc6164'))
    if (applications.Failed) this.appStatusData.push(new DonutDataItem('Failed', applications.Failed, '#cc6164'))
    if (applications.Expired) this.appStatusData.push(new DonutDataItem('Expired', applications.Expired, '#cc6164'))
    if (applications.Resuming) this.appStatusData.push(new DonutDataItem('Resuming', applications.Resuming, '#facc54'))
  }

  updateContainerStatusData(info: Partition) {
    this.containerStatusData = [
      new DonutDataItem('Running', +info.totalContainers, '#26bbf0'),
    ];
  }

  getAreaChartData(data: HistoryInfo[]): AreaDataItem[] {
    return data ? data.map((d) => new AreaDataItem(d.value, new Date(d.timestamp))) : [];
  }

  getEmptyClusterInfo(): ClusterInfo {
    return {
      startTime: 0,
      rmBuildInformation: [],
      partition: NOT_AVAILABLE,
      clusterName: NOT_AVAILABLE,
      clusterStatus: NOT_AVAILABLE,
    };
  }
}
