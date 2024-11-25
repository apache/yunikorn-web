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
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-nodes-view',
  templateUrl: './nodes-view.component.html',
  styleUrls: ['./nodes-view.component.scss'],
})
export class NodesViewComponent implements OnInit {
  @ViewChild('nodesViewMatPaginator', { static: true }) nodePaginator!: MatPaginator;
  @ViewChild('allocationMatPaginator', { static: true }) allocPaginator!: MatPaginator;
  @ViewChild('nodeSort', { static: true }) nodeSort!: MatSort;
  @ViewChild('allocSort', { static: true }) allocSort!: MatSort;
  
  nodeDataSource = new MatTableDataSource<NodeInfo>([]);
  nodeColumnDef: ColumnDef[] = [];
  nodeColumnIds: string[] = [];

  allocDataSource = new MatTableDataSource<AllocationInfo>([]);
  allocColumnDef: ColumnDef[] = [];
  allocColumnIds: string[] = [];

  selectedRow: NodeInfo | null = null;
  partitionList: PartitionInfo[] = [];
  partitionSelected = '';

  detailToggle: boolean = false;
  searchControl = new FormControl('',{ nonNullable: true });

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.nodeDataSource.paginator = this.nodePaginator;
    this.allocDataSource.paginator = this.allocPaginator;
    this.nodeDataSource.sort = this.nodeSort;
    this.allocDataSource.sort = this.allocSort;

    this.nodeColumnDef = [
      { colId: 'nodeId', colName: 'Node ID' },
      { colId: 'attributes', colName: 'Attributes' },
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

    this.nodeColumnIds = this.nodeColumnDef
      .filter(col=> !['attributes'].includes(col.colId))
      .map((col) => col.colId)
      .concat('indicatorIcon');

    this.allocColumnDef = [
      { colId: 'displayName', colName: 'Display Name' },
      { colId: 'allocationKey', colName: 'Allocation Key' },
      { colId: 'resource', colName: 'Resource', colFormatter: CommonUtil.resourceColumnFormatter },
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

          this.partitionSelected = CommonUtil.getStoredPartition(list[0].name);
          this.fetchNodeListForPartition(this.partitionSelected);
        } else {
          this.partitionList = [new PartitionInfo('-- Select --', '')];
          this.partitionSelected = '';
          this.nodeDataSource.data = [];
          CommonUtil.setStoredQueueAndPartition('');
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
        this.formatColumn();
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

  formatColumn() {
    if (this.nodeDataSource.data.length === 0) {
      return;
    }
    this.nodeColumnIds.forEach((colId) => {
      if (colId === 'indicatorIcon') {
        return;
      }

      // Verify whether all cells in the column are empty.
      let isEmpty: boolean = true;
      Object.values(this.nodeDataSource.data).forEach((node) => {
        Object.entries(node).forEach((entry) => {
          const [key, value] = entry;
          if (key === colId && !(value === '' || value === 'n/a')) {
            isEmpty = false;
          }
        });
      });

      if (isEmpty) {
        this.nodeColumnIds = this.nodeColumnIds.filter((el) => el !== colId);
        this.nodeColumnIds = this.nodeColumnIds.filter((colId) => colId !== 'attributes');
      }
    });
  }

  onPartitionSelectionChanged(selected: MatSelectChange) {
    this.partitionSelected = selected.value;
    this.clearRowSelection();
    this.fetchNodeListForPartition(this.partitionSelected);
    CommonUtil.setStoredQueueAndPartition(this.partitionSelected);
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

  formatAttribute(attributes: any): string[] {
    let result: string[] = [];
    Object.entries(attributes).forEach((entry) => {
      const [key, value] = entry;
      if (value === '' || key.includes('si')) {
        return;
      }
      result.push(key + ':' + value);
    });
    return result;
  }

  toggle() {
    this.detailToggle = !this.detailToggle;
    this.displayAttribute(this.detailToggle);
  }

  displayAttribute(toggle: boolean) {
    if (toggle) {
      this.nodeColumnIds = [
        ...this.nodeColumnIds.slice(0, 1),
        'attributes',
        ...this.nodeColumnIds.slice(1),
      ];
    } else {
      this.nodeColumnIds = this.nodeColumnIds.filter((colId) => colId !== 'attributes');
    }
  }

  filterPredicate: (data: NodeInfo, filter: string) => boolean = (
    data: NodeInfo,
    filter: string
  ): boolean => {
    // a deep copy of the NodeInfo with formatted attributes for filtering
    const deepCopy = JSON.parse(JSON.stringify(data));
    Object.entries(deepCopy.attributes).forEach((entry) => {
      const [key, value] = entry;
      deepCopy.attributes[key] = `${key}:${value}`;
    });
    const objectString = JSON.stringify(deepCopy).toLowerCase();
    return objectString.includes(filter);
  };

  onChangeSearchText(newSearchText: string) {
    this.searchControl.setValue(newSearchText.trim().toLowerCase());
    this.nodeDataSource.filter = this.searchControl.value;
    this.nodeDataSource.filterPredicate = this.filterPredicate;
  }
}
