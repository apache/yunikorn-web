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
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, PageEvent, MatSort } from '@angular/material';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { JobInfo, JobAllocation } from '@app/models/job-info.model';

export interface ColumnDef {
  colId: string;
  colName: string;
}

@Component({
  selector: 'app-jobs-view',
  templateUrl: './jobs-view.component.html',
  styleUrls: ['./jobs-view.component.scss']
})
export class JobsViewComponent implements OnInit {
  @ViewChild('jobsViewMatPaginator', { static: true }) jobsPaginator: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) jobsSort: MatSort;

  jobsDataSource = new MatTableDataSource<JobInfo>([]);
  jobsColumnDef: ColumnDef[] = [];
  jobsColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<JobAllocation>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: JobInfo | null = null;

  constructor(private scheduler: SchedulerService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.jobsDataSource.paginator = this.jobsPaginator;
    this.allocDataSource.paginator = this.allocPaginator;
    this.jobsDataSource.sort = this.jobsSort;
    this.jobsSort.sort({ id: 'submissionTime', start: 'desc', disableClear: false });

    this.jobsColumnDef = [
      { colId: 'applicationId', colName: 'Application ID' },
      { colId: 'applicationState', colName: 'Application State' },
      { colId: 'usedResource', colName: 'Used Resource' },
      { colId: 'queueName', colName: 'Queue Name' },
      { colId: 'partition', colName: 'Partition' },
      { colId: 'submissionTime', colName: 'Submission Time' }
    ];

    this.jobsColumnIds = this.jobsColumnDef.map(col => col.colId).concat('indicatorIcon');

    this.allocColumnDef = [
      { colId: 'allocationKey', colName: 'Allocation Key' },
      { colId: 'resource', colName: 'Resource' },
      { colId: 'queueName', colName: 'Queue Name' },
      { colId: 'priority', colName: 'Priority' },
      { colId: 'partition', colName: 'Partition' },
      { colId: 'nodeId', colName: 'Node ID' },
      { colId: 'applicationId', colName: 'Application ID' }
    ];

    this.allocColumnIds = this.allocColumnDef.map(col => col.colId);

    this.spinner.show();
    this.scheduler
      .fetchJobList()
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe(data => {
        this.jobsDataSource.data = data;
      });
  }

  unselectAllRowsButOne(row: JobInfo) {
    this.jobsDataSource.data.map(job => {
      if (job !== row) {
        job.isSelected = false;
      }
    });
  }

  toggleRowSelection(row: JobInfo) {
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

  onPaginatorChanged(page: PageEvent) {
    if (this.selectedRow) {
      this.selectedRow.isSelected = false;
      this.selectedRow = null;
      this.allocDataSource.data = [];
    }
  }

  isJobsDataSourceEmpty() {
    return this.jobsDataSource.data && this.jobsDataSource.data.length === 0;
  }

  isAllocDataSourceEmpty() {
    return this.allocDataSource.data && this.allocDataSource.data.length === 0;
  }
}
