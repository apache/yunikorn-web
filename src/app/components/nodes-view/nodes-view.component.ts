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
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { NodeInfo } from '@app/models/node-info.model';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { ColumnDef } from '@app/models/column-def.model';
import { CommonUtil } from '@app/utils/common.util';
import { PartitionInfo } from '@app/models/partition-info.model';

@Component({
  selector: 'app-nodes-view',
  templateUrl: './nodes-view.component.html',
  styleUrls: ['./nodes-view.component.scss'],
})
export class NodesViewComponent implements OnInit {
  @ViewChild('nodesViewMatPaginator', { static: true }) nodePaginator!: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) nodeSort!: MatSort;

  nodeDataSource = new MatTableDataSource<NodeInfo>([]);
  nodeColumnDef: ColumnDef[] = [];
  nodeColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<AllocationInfo>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: NodeInfo | null = null;
  partitionList: PartitionInfo[] = [];
  partitionSelected = '';

  constructor(private scheduler: SchedulerService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.nodeDataSource.paginator = this.nodePaginator;
    this.allocDataSource.paginator = this.allocPaginator;
    this.nodeDataSource.sort = this.nodeSort;

    this.nodeColumnDef = [
      { colId: 'nodeId', colName: 'Node ID' },
      { colId: 'rackName', colName: 'Rack Name' },
      { colId: 'hostName', colName: 'Host Name' },
      { colId: 'partitionName', colName: 'Partition' },
      { colId: 'capacity', colName: 'Capacity', colFormatter: CommonUtil.resourceColumnFormatter },
      { colId: 'occupied', colName: 'Used', colFormatter: CommonUtil.resourceColumnFormatter },
      {
        colId: 'allocated',
        colName: 'Allocated',
        colFormatter: CommonUtil.resourceColumnFormatter,
      },
      {
        colId: 'available',
        colName: 'Available',
        colFormatter: CommonUtil.resourceColumnFormatter,
      },
      {
        colId: 'utilized',
        colName: 'Utilized',
        colFormatter: CommonUtil.resourceColumnFormatter,
      },
    ];

    this.nodeColumnIds = this.nodeColumnDef.map((col) => col.colId).concat('indicatorIcon');

    this.allocColumnDef = [
      { colId: 'displayName', colName: 'Display Name' },
      { colId: 'allocationKey', colName: 'Allocation Key' },
      { colId: 'resource', colName: 'Resource', colFormatter: CommonUtil.resourceColumnFormatter },
      { colId: 'queueName', colName: 'Queue Name' },
      { colId: 'priority', colName: 'Priority' },
      { colId: 'applicationId', colName: 'Application ID' },
    ];

    this.allocColumnIds = this.allocColumnDef.map((col) => col.colId);

    this.spinner.show();

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
          this.fetchNodeListForPartition(this.partitionSelected);
        } else {
          this.partitionList = [new PartitionInfo('-- Select --', '')];
          this.partitionSelected = '';
          this.nodeDataSource.data = [];
        }
      });
  }

  fetchNodeListForPartition(partitionName: string) {
    this.spinner.show();
    this.nodeDataSource.data = [];

    this.scheduler
      .fetchNodeList(partitionName)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe((data) => {
        this.nodeDataSource.data = data;
      });
  }

  unselectAllRowsButOne(row: NodeInfo) {
    this.nodeDataSource.data.map((node) => {
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
      if (row.allocations) {
        this.allocDataSource.data = row.allocations;
      }
    }
  }

  clearRowSelection() {
    if (this.selectedRow) {
      this.selectedRow.isSelected = false;
    }
    this.selectedRow = null;
    this.allocDataSource.data = [];
  }

  onPaginatorChanged() {
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

  onPartitionSelectionChanged(selected: MatSelectChange) {
    this.partitionSelected = selected.value;
    this.clearRowSelection();
    this.fetchNodeListForPartition(this.partitionSelected);
  }
}
