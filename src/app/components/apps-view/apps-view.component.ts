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

import {
  Component,
  ComponentRef,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AllocationsDrawerComponent } from '@app/components/allocations-drawer/allocations-drawer.component';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { AppInfo } from '@app/models/app-info.model';
import { ColumnDef } from '@app/models/column-def.model';
import { DropdownItem } from '@app/models/dropdown-item.model';
import { PartitionInfo } from '@app/models/partition-info.model';
import { QueueInfo } from '@app/models/queue-info.model';
import { EnvconfigService } from '@app/services/envconfig/envconfig.service';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { CommonUtil } from '@app/utils/common.util';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import {
  loadRemoteModule,
  LoadRemoteModuleEsmOptions,
} from '@angular-architects/module-federation';

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
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  @ViewChild('queueSelect', { static: false }) queueSelect!: MatSelect;

  @ViewChild('drawerContainer', { read: ViewContainerRef, static: true })
  drawerContainer!: ViewContainerRef;

  @ViewChild('mfeContainer', { read: ViewContainerRef, static: true })
  mfeContainer!: ViewContainerRef;

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

  detailToggle: boolean = false;
  allocationsDrawerComponent: ComponentRef<AllocationsDrawerComponent> | undefined = undefined;

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private envConfig: EnvconfigService
  ) {}

  ngOnInit() {
    this.appDataSource.paginator = this.appPaginator;
    this.allocDataSource.paginator = this.allocPaginator;
    this.appDataSource.sort = this.appSort;
    this.allocDataSource.sort = this.allocSort;
    this.appSort.sort({ id: 'submissionTime', start: 'desc', disableClear: false });

    this.appColumnDef = [
      { colId: 'applicationId', colName: 'Application ID', colWidth: 2 },
      { colId: 'applicationState', colName: 'Application State', colWidth: 0.5 },
      {
        colId: 'lastStateChangeTime',
        colName: 'Last State Change Time',
        colWidth: 1,
      },
      {
        colId: 'usedResource',
        colName: 'Used Resource',
        colFormatter: CommonUtil.resourceColumnFormatter,
        colWidth: 1.5,
      },
      {
        colId: 'pendingResource',
        colName: 'Pending Resource',
        colFormatter: CommonUtil.resourceColumnFormatter,
        colWidth: 1.5,
      },
      {
        colId: 'submissionTime',
        colName: 'Submission Time',
        colWidth: 1,
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
          this.partitionSelected = CommonUtil.getStoredPartition(list[0].name);
          this.fetchQueuesForPartition(this.partitionSelected);
        } else {
          this.partitionList = [new PartitionInfo('-- Select --', '')];
          this.partitionSelected = '';
          this.leafQueueList = [new DropdownItem('-- Select --', '')];
          this.leafQueueSelected = '';
          this.appDataSource.data = [];
          this.clearQueueSelection();
        }
      });

    this.initializeSidebarComponent(
      this.envConfig.getAllocationsDrawerComponentRemoteConfig()
    ).catch(console.error);
  }

  async initializeSidebarComponent(remoteComponentConfig: LoadRemoteModuleEsmOptions | null) {
    let component = AllocationsDrawerComponent;

    if (remoteComponentConfig !== null) {
      const { AllocationsDrawerComponent: allocationsDrawerComponent } =
        await loadRemoteModule(remoteComponentConfig);
      component = allocationsDrawerComponent;
    }

    this.drawerContainer.clear();
    this.allocationsDrawerComponent = this.drawerContainer.createComponent(component);

    this.allocationsDrawerComponent.setInput('selectedRow', this.selectedRow);
    this.allocationsDrawerComponent.setInput('allocDataSource', this.allocDataSource);
    this.allocationsDrawerComponent.setInput('partitionSelected', this.partitionSelected);
    this.allocationsDrawerComponent.setInput('leafQueueSelected', this.leafQueueSelected);
    this.allocationsDrawerComponent.instance.removeRowSelection.subscribe(() => {
      this.removeRowSelection();
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
          if (!this.fetchApplicationsUsingQueryParams()) this.setDefaultQueue(leafQueueList);
        } else {
          this.leafQueueList = [new DropdownItem('-- Select --', '')];
        }
      });
  }

  setDefaultQueue(queueList: DropdownItem[]): void {
    const storedPartitionAndQueue = localStorage.getItem('selectedPartitionAndQueue');

    if (!storedPartitionAndQueue || storedPartitionAndQueue.indexOf(':') < 0) {
      setTimeout(() => this.openQueueSelection(), 0);
      return;
    }

    const [storedPartition, storedQueue] = storedPartitionAndQueue.split(':');
    if (this.partitionSelected !== storedPartition) return;

    const storedQueueDropdownItem = queueList.find((queue) => queue.value === storedQueue);
    if (storedQueueDropdownItem) {
      this.leafQueueSelected = storedQueueDropdownItem.value;
      this.fetchAppListForPartitionAndQueue(this.partitionSelected, this.leafQueueSelected);
      return;
    } else {
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
      setTimeout(() => this.openQueueSelection(), 0); // Allows render to finish and then opens the queue select dropdown
    }
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
      if (row.allocations) {
        this.allocDataSource.data = row.allocations;
      }
      this.allocationsDrawerComponent?.setInput('selectedRow', this.selectedRow);
      this.allocationsDrawerComponent?.setInput('allocDataSource', this.allocDataSource);
      this.allocationsDrawerComponent?.instance.openDrawer();
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
      this.clearQueueSelection();
      this.fetchQueuesForPartition(this.partitionSelected);
    } else {
      this.searchText = '';
      this.partitionSelected = '';
      this.leafQueueSelected = '';
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.clearQueueSelection();
    }
  }

  onQueueSelectionChanged(selected: MatSelectChange) {
    if (selected.value !== '') {
      this.searchText = '';
      this.leafQueueSelected = selected.value;
      this.appDataSource.data = [];
      this.removeRowSelection();
      this.fetchAppListForPartitionAndQueue(this.partitionSelected, this.leafQueueSelected);
      CommonUtil.setStoredQueueAndPartition(this.partitionSelected, this.leafQueueSelected);
    } else {
      this.searchText = '';
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
    return cpuAndMemoryElements.concat(otherElements);
  }

  clearQueueSelection() {
    CommonUtil.setStoredQueueAndPartition('');
    this.leafQueueSelected = '';
    this.openQueueSelection();
  }

  openQueueSelection() {
    this.queueSelect.open();
  }

  toggle() {
    this.detailToggle = !this.detailToggle;
  }
}
