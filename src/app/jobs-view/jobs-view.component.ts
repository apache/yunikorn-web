import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

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
    jobsDataSource: JobInfo[] = [];
    jobsColumnDef: ColumnDef[] = [];
    jobsColumnIds: string[] = [];

    allocDataSource: JobAllocation[] = [];
    allocColumnDef: ColumnDef[] = [];
    allocColumnIds: string[] = [];

    selectedRow: JobInfo | null = null;

    constructor(private scheduler: SchedulerService, private spinner: NgxSpinnerService) {}

    ngOnInit() {
        this.jobsColumnDef = [
            { colId: 'jobId', colName: 'Job ID' },
            { colId: 'usedResource', colName: 'Used Resource' },
            { colId: 'queueName', colName: 'Queue Name' },
            { colId: 'partition', colName: 'Partition' },
            { colId: 'submissionTime', colName: 'Submission Time' }
        ];

        this.jobsColumnIds = this.jobsColumnDef.map(col => col.colId).concat('indicatorIcon');

        this.allocColumnDef = [
            { colId: 'allocationKey', colName: 'Allocation Key' },
            { colId: 'resource', colName: 'Resource' },
            { colId: 'queueName', colName: 'QueueName' },
            { colId: 'priority', colName: 'Priority' },
            { colId: 'partition', colName: 'Partition' },
            { colId: 'nodeId', colName: 'Node ID' },
            { colId: 'jobId', colName: 'Job ID' }
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
                this.jobsDataSource = data;
            });
    }

    unselectAllRows(row) {
        this.jobsDataSource.map(job => {
            if (job !== row) {
                job.isSelected = false;
            }
        });
    }

    toggleRowSelection(row: JobInfo) {
        this.unselectAllRows(row);
        if (row.isSelected) {
            this.selectedRow = null;
            row.isSelected = false;
            this.allocDataSource = [];
        } else {
            this.selectedRow = row;
            row.isSelected = true;
            this.allocDataSource = row.allocations;
        }
    }

    isJobsDataSourceEmpty() {
        return this.jobsDataSource && this.jobsDataSource.length > 0;
    }

    isAllocDataSourceEmpty() {
        return this.allocDataSource && this.allocDataSource.length > 0;
    }
}
