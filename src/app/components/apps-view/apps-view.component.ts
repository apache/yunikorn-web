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

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelectChange } from '@angular/material/select';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { AppInfo } from '@app/models/app-info.model';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { ColumnDef } from '@app/models/column-def.model';
import { CommonUtil } from '@app/utils/common.util';
import { PartitionInfo } from '@app/models/partition-info.model';
import { QueueInfo } from '@app/models/queue-info.model';
import { MatDrawer } from '@angular/material/sidenav';
import { QueueNode } from '../queue-menu-tree/queue-menu-tree.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-applications-view',
  templateUrl: './apps-view.component.html',
  styleUrls: ['./apps-view.component.scss'],
})
export class AppsViewComponent implements OnInit {
  @ViewChild('appsViewMatPaginator', { static: true }) appPaginator!: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator!: MatPaginator;
  @ViewChild('appSort', { static: true }) appSort!: MatSort;
  @ViewChild('allocSort', { static: true }) allocSort!: MatSort;
  @ViewChild('matDrawer', { static: false }) matDrawer!: MatDrawer;
  searchControl = new FormControl('',{ nonNullable: true });

  appDataSource = new MatTableDataSource<AppInfo>([]);
  appColumnDef: ColumnDef[] = [];
  appColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<AllocationInfo>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: AppInfo | null = null;
  initialAppData: AppInfo[] = [];
  partitionList: PartitionInfo[] = [];
  partitionSelected = '';
  leafQueueList: QueueNode[] = [];
  leafQueueSelected = '';

  detailToggle: boolean = false;
  allocationsToggle: boolean = false;

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
    this.allocDataSource.sort = this.allocSort;
    this.appSort.sort({ id: 'submissionTime', start: 'desc', disableClear: false });

    this.appColumnDef = [
      { colId: 'applicationId', colName: 'Application ID' },
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
      {
        colId: 'pendingResource',
        colName: 'Pending Resource',
        colFormatter: CommonUtil.resourceColumnFormatter,
      },
      {
        colId: 'submissionTime',
        colName: 'Submission Time',
        colFormatter: CommonUtil.timeColumnFormatter,
      },
    ];

    this.appColumnIds = this.appColumnDef.map((col) => col.colId);

    this.allocColumnDef = [
      { colId: 'displayName', colName: 'Display Name', colWidth: 1 },
      { colId: 'allocationKey', colName: 'Allocation Key', colWidth: 1 },
      { colId: 'nodeId', colName: 'Node ID', colWidth: 1 },
      {
        colId: 'resource',
        colName: 'Resource',
        colFormatter: CommonUtil.resourceColumnFormatter,
        colWidth: 1,
      },
      { colId: 'priority', colName: 'Priority', colWidth: 0.5 },
    ];

    this.allocColumnIds = this.allocColumnDef.map((col) => col.colId);

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
          this.partitionSelected = CommonUtil.getStoredPartition(list[0].name);
          this.fetchQueuesForPartition(this.partitionSelected);
        } else {
          this.partitionList = [new PartitionInfo('-- Select --', '')];
          this.partitionSelected = '';
          this.leafQueueList = [];
          this.leafQueueSelected = '';
          this.appDataSource.data = [];
          this.clearQueueSelection();
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
          this.leafQueueList = leafQueueList;
          if (!this.fetchApplicationsUsingQueryParams()) this.setDefaultQueue(leafQueueList);
        } else {
          this.leafQueueList = [];
        }
      });
  }

  setDefaultQueue(queueList: QueueNode[]): void {
    const storedPartitionAndQueue = localStorage.getItem('selectedPartitionAndQueue');

    if (!storedPartitionAndQueue || storedPartitionAndQueue.indexOf(':') < 0) {
      return;
    }
    const [storedPartition, storedQueue] = storedPartitionAndQueue.split(':');
    if (this.partitionSelected !== storedPartition) return;

    const storedQueueNode = this.findQueueNodeByValue(queueList, storedQueue);
    if (storedQueueNode) {
      this.leafQueueSelected = storedQueueNode.value;
      this.fetchAppListForPartitionAndQueue(this.partitionSelected, this.leafQueueSelected);
      return;
    } else {
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
    }
  }

  findQueueNodeByValue(queueList: QueueNode[] = [], value:string): QueueNode | null {
    for (const node of queueList) {
      if (node.value === value) return node;
  
      const result = this.findQueueNodeByValue(node.children, value);
      if (result) return result;
    }
  
    return null;
  }

  generateLeafQueueList(rootQueue: QueueInfo, list: QueueNode[] = []): QueueNode[] {
    if (rootQueue) {
      list.push({
        name: rootQueue.queueName.split(".").at(-1) || rootQueue.queueName,
        value: rootQueue.queueName,
        children: rootQueue.children 
        ? rootQueue.children.flatMap(node=> this.generateLeafQueueList(node, []))
        : []
      })
    }

    return list;
  }

  fetchAppListForPartitionAndQueue(
    partitionName: string,
    queueName: string,
    applicationId?: string
  ) {
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

        const row = this.initialAppData.find((app) => app.applicationId === applicationId);
        if (row) {
          this.toggleRowSelection(row);
        }
      });
  }

  fetchApplicationsUsingQueryParams(): boolean {
    const partitionName = this.activatedRoute.snapshot.queryParams['partition'];
    const queueName = this.activatedRoute.snapshot.queryParams['queue'];
    const applicationId = this.activatedRoute.snapshot.queryParams['applicationId'];

    if (partitionName && queueName) {
      this.partitionSelected = partitionName;
      this.leafQueueSelected = queueName;
      this.fetchAppListForPartitionAndQueue(partitionName, queueName, applicationId);
      CommonUtil.setStoredQueueAndPartition(partitionName, queueName);

      this.router.navigate([], {
        queryParams: {
          partition: null,
          queue: null,
          applicationId: null,
        },
        queryParamsHandling: 'merge',
      });

      return true;
    }
    return false;
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
      this.removeRowSelection();
    } else {
      this.selectedRow = row;
      row.isSelected = true;
      this.matDrawer.open();
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
    this.searchControl.setValue('');
    this.removeRowSelection();
    this.appDataSource.data = this.initialAppData;
  }

  onSearchAppData() {
    const searchTerm = this.searchControl.value?.trim().toLowerCase();

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
      this.searchControl.setValue('');
      this.partitionSelected = selected.value;
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.clearQueueSelection();
      this.fetchQueuesForPartition(this.partitionSelected);
    } else {
      this.searchControl.setValue('');
      this.partitionSelected = '';
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.clearQueueSelection();
    }
  }

  onQueueSelectionChanged(selected: string) {
    if (selected !== '') {
      this.searchControl.setValue('');
      this.leafQueueSelected = selected;
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.fetchAppListForPartitionAndQueue(this.partitionSelected, this.leafQueueSelected);
      CommonUtil.setStoredQueueAndPartition(this.partitionSelected, this.leafQueueSelected);
    } else {
      this.searchControl.setValue('');
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.clearQueueSelection();
    }
  }

  formatResources(colValue: string): string[] {
    const arr: string[] = colValue.split('<br/>');
    // Check if there are "cpu" or "Memory" elements in the array
    const hasCpu = arr.some((item) => item.toLowerCase().includes('cpu'));
    const hasMemory = arr.some((item) => item.toLowerCase().includes('memory'));
    if (!hasCpu) {
      arr.unshift('CPU: n/a');
    }
    if (!hasMemory) {
      arr.unshift('Memory: n/a');
    }

    // Concatenate the two arrays, with "cpu" and "Memory" elements first
    const cpuAndMemoryElements = arr.filter(
      (item) => item.toLowerCase().includes('CPU') || item.toLowerCase().includes('Memory')
    );
    const otherElements = arr.filter(
      (item) => !item.toLowerCase().includes('CPU') && !item.toLowerCase().includes('Memory')
    );
    const result = cpuAndMemoryElements.concat(otherElements);

    return result;
  }

  clearQueueSelection() {
    CommonUtil.setStoredQueueAndPartition('');
    this.leafQueueSelected = '';
  }

  toggle() {
    this.detailToggle = !this.detailToggle;
  }

  allocationsDetailToggle() {
    this.allocationsToggle = !this.allocationsToggle;
  }

  closeDrawer() {
    this.matDrawer.close();
    this.removeRowSelection();
  }

  copyLinkToClipboard() {
    const url = window.location.href.split('?')[0];
    const copyString = `${url}?partition=${this.partitionSelected}&queue=${this.leafQueueSelected}&applicationId=${this?.selectedRow?.applicationId}`;
    navigator.clipboard
      .writeText(copyString)
      .catch((error) => console.error('Writing to the clipboard is not allowed. ', error));
  }

  onChangeSearchText(newSearchText: string) {
    this.searchControl.setValue(newSearchText);
    this.onSearchAppData();
  }
}
