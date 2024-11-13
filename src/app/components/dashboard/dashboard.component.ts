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
import { BuildInfo, ClusterInfo } from '@app/models/cluster-info.model';
import { ChartDataItem } from '@app/models/chart-data.model';
import { AreaDataItem } from '@app/models/area-data.model';
import { HistoryInfo } from '@app/models/history-info.model';
import { Applications, Partition } from '@app/models/partition-info.model';
import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';
import { APP_STATUS_COLOR_MAP, APP_STATUSES, NOT_AVAILABLE } from '@app/utils/constants';

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
  appStatusData: ChartDataItem[] = [];
  containerStatusData: ChartDataItem[] = [];
  appHistoryData: AreaDataItem[] = [];
  containerHistoryData: AreaDataItem[] = [];
  clusterInfo: ClusterInfo = this.getEmptyClusterInfo();
  buildInfo: BuildInfo = this.getEmptyBuildInfo();
  initialAppHistory: HistoryInfo[] = [];
  initialContainerHistory: HistoryInfo[] = [];

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private eventBus: EventBusService
  ) { }

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
          if (list[0].rmBuildInformation && list[0].rmBuildInformation[0]) {
            this.buildInfo = list[0].rmBuildInformation[0];
          }
        }
      });

    this.scheduler.fetchPartitionList().subscribe((list) => {
      this.partitionList = list;

      if (list && list[0]) {
        this.nodeSortPolicy = list[0].nodeSortingPolicy
          ? list[0].nodeSortingPolicy.type
          : NOT_AVAILABLE;

        list[0].totalContainers = list[0].totalContainers || 0;
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
    this.appStatusData = [];
    APP_STATUSES.forEach(appStatus => {
      if (applications[appStatus]) this.appStatusData.push(
        new ChartDataItem(
          appStatus,
          applications[appStatus],
          APP_STATUS_COLOR_MAP[appStatus]
        )
      );
    })
  }

  updateContainerStatusData(info: Partition) {
    this.containerStatusData = [
      new ChartDataItem('Running', +info.totalContainers, APP_STATUS_COLOR_MAP['Running']),
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

  getEmptyBuildInfo(): BuildInfo {
    return {
      buildDate: NOT_AVAILABLE,
      buildVersion: NOT_AVAILABLE,
      isPluginVersion: NOT_AVAILABLE,
      rmId: NOT_AVAILABLE,
    };
  }
}
