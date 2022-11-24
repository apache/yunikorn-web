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

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelectChange } from '@angular/material/select';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { AppInfo } from '@app/models/app-info.model';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { ColumnDef } from '@app/models/column-def.model';
import { CommonUtil } from '@app/utils/common.util';
import { PartitionInfo } from '@app/models/partition-info.model';
import { DropdownItem } from '@app/models/dropdown-item.model';
import { QueueInfo } from '@app/models/queue-info.model';

@Component({
  selector: 'app-applications-view',
  templateUrl: './apps-view.component.html',
  styleUrls: ['./apps-view.component.scss'],
})
export class AppsViewComponent implements OnInit {
  @ViewChild('appsViewMatPaginator', { static: true }) appPaginator!: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) appSort!: MatSort;
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;

  appDataSource = new MatTableDataSource<AppInfo>([]);
  appColumnDef: ColumnDef[] = [];
  appColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<AllocationInfo>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: AppInfo | null = null;
  initialAppData: AppInfo[] = [];
  searchText = '';
  partitionList: PartitionInfo[] = [];
  partitionSelected = '';
  leafQueueList: DropdownItem[] = [];
  leafQueueSelected = '';

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.appDataSource.paginator = this.appPaginator;
    this.allocDataSource.paginator = this.allocPaginator;
    this.appDataSource.sort = this.appSort;
    this.appSort.sort({ id: 'submissionTime', start: 'desc', disableClear: false });

    this.appColumnDef = [
      { colId: 'applicationId', colName: 'Application ID' },
      { colId: 'queueName', colName: 'Queue Name' },
      { colId: 'applicationState', colName: 'Application State' },
      {
        colId: 'lastStateChangeTime',
        colName: 'Last State Change Time',
        colFormatter: CommonUtil.timeColumnFormatter,
      },
      {
        colId: 'usedResource',
        colName: 'Used Resource',
        colFormatter: CommonUtil.resourceColumnFormatter,
      },
      { colId: 'partition', colName: 'Partition' },
      {
        colId: 'submissionTime',
        colName: 'Submission Time',
        colFormatter: CommonUtil.timeColumnFormatter,
      },
    ];

    this.appColumnIds = this.appColumnDef.map((col) => col.colId).concat('indicatorIcon');

    this.allocColumnDef = [
      { colId: 'displayName', colName: 'Display Name' },
      { colId: 'allocationKey', colName: 'Allocation Key' },
      { colId: 'nodeId', colName: 'Node ID' },
      { colId: 'resource', colName: 'Resource', colFormatter: CommonUtil.resourceColumnFormatter },
      { colId: 'priority', colName: 'Priority' },
    ];

    this.allocColumnIds = this.allocColumnDef.map((col) => col.colId);

    fromEvent(this.searchInput.nativeElement, 'keyup')
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.onSearchAppData();
      });

    this.scheduler
      .fetchPartitionList()
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe((list) => {
        if (list && list.length > 0) {
          list.forEach((part) => {
            this.partitionList.push(new PartitionInfo(part.name, part.name));
          });

          this.partitionSelected = list[0].name;
          this.fetchQueuesForPartition(this.partitionSelected);
        } else {
          this.partitionList = [new PartitionInfo('-- Select --', '')];
          this.partitionSelected = '';
          this.leafQueueList = [new DropdownItem('-- Select --', '')];
          this.leafQueueSelected = '';
          this.appDataSource.data = [];
        }
      });
  }

  fetchQueuesForPartition(partitionName: string) {
    this.spinner.show();

    this.scheduler
      .fetchSchedulerQueues(partitionName)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe((data) => {
        if (data && data.rootQueue) {
          const leafQueueList = this.generateLeafQueueList(data.rootQueue);
          this.leafQueueList = [new DropdownItem('-- Select --', ''), ...leafQueueList];
          this.leafQueueSelected = '';
          this.fetchApplicationsUsingQueryParams();
        } else {
          this.leafQueueList = [new DropdownItem('-- Select --', '')];
        }
      });
  }

  generateLeafQueueList(rootQueue: QueueInfo, list: DropdownItem[] = []): DropdownItem[] {
    if (rootQueue && rootQueue.isLeaf) {
      list.push(new DropdownItem(rootQueue.queueName, rootQueue.queueName));
    }

    if (rootQueue && rootQueue.children) {
      rootQueue.children.forEach((child) => this.generateLeafQueueList(child, list));
    }

    return list;
  }

  fetchAppListForPartitionAndQueue(partitionName: string, queueName: string) {
    this.spinner.show();

    this.scheduler
      .fetchAppList(partitionName, queueName)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe((data) => {
        this.initialAppData = data;
        this.appDataSource.data = data;
      });
  }

  fetchApplicationsUsingQueryParams() {
    const partitionName = this.activatedRoute.snapshot.queryParams['partition'];
    const queueName = this.activatedRoute.snapshot.queryParams['queue'];

    if (partitionName && queueName) {
      this.partitionSelected = partitionName;
      this.leafQueueSelected = queueName;
      this.fetchAppListForPartitionAndQueue(partitionName, queueName);
    }

    this.router.navigate([], {
      queryParams: {
        partition: null,
        queue: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  unselectAllRowsButOne(row: AppInfo) {
    this.appDataSource.data.map((app) => {
      if (app !== row) {
        app.isSelected = false;
      }
    });
  }

  toggleRowSelection(row: AppInfo) {
    this.unselectAllRowsButOne(row);
    if (row.isSelected) {
      this.selectedRow = null;
      row.isSelected = false;
      this.allocDataSource.data = [];
    } else {
      this.selectedRow = row;
      row.isSelected = true;
      if (row.allocations) {
        this.allocDataSource.data = row.allocations;
      }
    }
  }

  removeRowSelection() {
    if (this.selectedRow) {
      this.selectedRow.isSelected = false;
      this.selectedRow = null;
      this.allocDataSource.data = [];
    }
  }

  onPaginatorChanged() {
    this.removeRowSelection();
  }

  isAppDataSourceEmpty() {
    return this.appDataSource.data && this.appDataSource.data.length === 0;
  }

  isAllocDataSourceEmpty() {
    return this.allocDataSource.data && this.allocDataSource.data.length === 0;
  }

  onClearSearch() {
    this.searchText = '';
    this.removeRowSelection();
    this.appDataSource.data = this.initialAppData;
  }

  onSearchAppData() {
    const searchTerm = this.searchText.trim().toLowerCase();

    if (searchTerm) {
      this.removeRowSelection();
      this.appDataSource.data = this.initialAppData.filter((data) =>
        data.applicationId.toLowerCase().includes(searchTerm)
      );
    } else {
      this.onClearSearch();
    }
  }

  onPartitionSelectionChanged(selected: MatSelectChange) {
    if (selected.value !== '') {
      this.searchText = '';
      this.partitionSelected = selected.value;
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.fetchQueuesForPartition(this.partitionSelected);
    } else {
      this.searchText = '';
      this.partitionSelected = '';
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
      this.removeRowSelection();
    }
  }

  onQueueSelectionChanged(selected: MatSelectChange) {
    if (selected.value !== '') {
      this.searchText = '';
      this.leafQueueSelected = selected.value;
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.fetchAppListForPartitionAndQueue(this.partitionSelected, this.leafQueueSelected);
    } else {
      this.searchText = '';
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
      this.removeRowSelection();
    }
  }
}
