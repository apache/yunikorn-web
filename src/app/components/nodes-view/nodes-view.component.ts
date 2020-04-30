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
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { NodeInfo } from '@app/models/node-info.model';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { ColumnDef } from '@app/models/column-def.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-nodes-view',
  templateUrl: './nodes-view.component.html',
  styleUrls: ['./nodes-view.component.scss']
})
export class NodesViewComponent implements OnInit {
  @ViewChild('nodesViewMatPaginator', { static: true }) nodePaginator: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) nodeSort: MatSort;

  nodeDataSource = new MatTableDataSource<NodeInfo>([]);
  nodeColumnDef: ColumnDef[] = [];
  nodeColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<AllocationInfo>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: NodeInfo | null = null;

  constructor(private scheduler: SchedulerService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.nodeDataSource.paginator = this.nodePaginator;
    this.allocDataSource.paginator = this.allocPaginator;
    this.nodeDataSource.sort = this.nodeSort;

    this.nodeColumnDef = [
      { colId: 'nodeId', colName: 'Node ID' },
      { colId: 'hostName', colName: 'Host Name' },
      { colId: 'rackName', colName: 'Rack Name' },
      { colId: 'capacity', colName: 'Capacity' },
      { colId: 'allocated', colName: 'Allocated' },
      { colId: 'available', colName: 'Available' }
    ];

    this.nodeColumnIds = this.nodeColumnDef.map(col => col.colId).concat('indicatorIcon');

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
      .fetchNodeList()
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe(data => {
        this.nodeDataSource.data = data;
      });
  }

  unselectAllRowsButOne(row: NodeInfo) {
    this.nodeDataSource.data.map(node => {
      if (node !== row) {
        node.isSelected = false;
      }
    });
  }

  toggleRowSelection(row: NodeInfo) {
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

  isNodeDataSourceEmpty() {
    return this.nodeDataSource.data && this.nodeDataSource.data.length === 0;
  }

  isAllocDataSourceEmpty() {
    return this.allocDataSource.data && this.allocDataSource.data.length === 0;
  }
}
