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
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { AppInfo } from '@app/models/app-info.model';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { ColumnDef } from '@app/models/column-def.model';
import { CommonUtil } from '@app/utils/common.util';

@Component({
  selector: 'app-applications-view',
  templateUrl: './apps-view.component.html',
  styleUrls: ['./apps-view.component.scss']
})
export class AppsViewComponent implements OnInit {
  @ViewChild('appsViewMatPaginator', { static: true }) appPaginator: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) appSort: MatSort;
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  appDataSource = new MatTableDataSource<AppInfo>([]);
  appColumnDef: ColumnDef[] = [];
  appColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<AllocationInfo>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: AppInfo | null = null;
  initialAppData: AppInfo[] = [];
  searchText = '';

  constructor(private scheduler: SchedulerService, private spinner: NgxSpinnerService) {}

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
        colId: 'usedResource',
        colName: 'Used Resource',
        colFormatter: CommonUtil.resourceValueFormatter
      },
      { colId: 'partition', colName: 'Partition' },
      { colId: 'submissionTime', colName: 'Submission Time' }
    ];

    this.appColumnIds = this.appColumnDef.map(col => col.colId).concat('indicatorIcon');

    this.allocColumnDef = [
      { colId: 'allocationKey', colName: 'Allocation Key' },
      { colId: 'resource', colName: 'Resource', colFormatter: CommonUtil.resourceValueFormatter },
      { colId: 'queueName', colName: 'Queue Name' },
      { colId: 'priority', colName: 'Priority' },
      { colId: 'partition', colName: 'Partition' },
      { colId: 'nodeId', colName: 'Node ID' },
      { colId: 'applicationId', colName: 'Application ID' }
    ];

    this.allocColumnIds = this.allocColumnDef.map(col => col.colId);

    this.spinner.show();
    this.scheduler
      .fetchAppList()
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe(data => {
        this.initialAppData = data;
        this.appDataSource.data = data;
      });

    fromEvent(this.searchInput.nativeElement, 'keyup')
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.onSearchAppData();
      });
  }

  unselectAllRowsButOne(row: AppInfo) {
    this.appDataSource.data.map(app => {
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
      this.allocDataSource.data = row.allocations;
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
      this.appDataSource.data = this.initialAppData.filter(
        data =>
          data.applicationId.toLowerCase().includes(searchTerm) ||
          data.queueName.toLowerCase().includes(searchTerm)
      );
    } else {
      this.onClearSearch();
    }
  }
}
