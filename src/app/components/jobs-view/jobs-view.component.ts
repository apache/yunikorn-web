import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource, PageEvent, MatSort } from '@angular/material';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { JobInfo, JobAllocation } from '@app/models/job-info.model';

interface ColumnDef {
  colId: string;
  colName: string;
}

@Component({
  selector: 'app-jobs-view',
  templateUrl: './jobs-view.component.html',
  styleUrls: ['./jobs-view.component.scss']
})
export class JobsViewComponent implements OnInit {
  @ViewChild('jobsViewMatPaginator') jobsPaginator: MatPaginator;
  @ViewChild('allocationMatPaginator') allocPaginator: MatPaginator;
  @ViewChild(MatSort) jobsSort: MatSort;

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
