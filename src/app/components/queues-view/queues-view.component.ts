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
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSelectChange } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

import { QueueInfo, ToggleQueueChildrenEvent } from '@app/models/queue-info.model';
import { PartitionInfo } from '@app/models/partition-info.model';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { CommonUtil } from '@app/utils/common.util';

export interface QueueList {
  [level: string]: QueueInfo[] | null;
}

export interface QueueLevel {
  level: string;
  next: string;
}

export const MAX_QUEUE_LEVELS = 5;

@Component({
  selector: 'app-queues-view',
  templateUrl: './queues-view.component.html',
  styleUrls: ['./queues-view.component.scss'],
})
export class QueuesViewComponent implements OnInit {
  @ViewChild('matDrawer', { static: false }) matDrawer!: MatDrawer;

  isDrawerContainerOpen = false;
  partitionSelected = '';
  partitionList: PartitionInfo[] = [];
  rootQueue: QueueInfo | null = null;
  selectedQueue: QueueInfo | null = null;
  queueList: QueueList = {};
  queueLevels: QueueLevel[] = [
    { level: 'level_00', next: 'level_01' },
    { level: 'level_01', next: 'level_02' },
    { level: 'level_02', next: 'level_03' },
    { level: 'level_03', next: 'level_04' },
    { level: 'level_04', next: 'level_05' },
    { level: 'level_05', next: 'level_06' },
    { level: 'level_06', next: 'level_07' },
    { level: 'level_07', next: 'level_08' },
    { level: 'level_08', next: 'level_09' },
  ];
  resourceValueFormatter = CommonUtil.resourceColumnFormatter;

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.queueLevels.forEach((obj) => {
      this.queueList[obj.level] = null;
    });

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
          this.fetchSchedulerQueuesForPartition(this.partitionSelected);
        } else {
          this.partitionList = [new PartitionInfo('-- Select --', '')];
          this.partitionSelected = '';
          this.queueList = {};
        }
      });
  }

  fetchSchedulerQueuesForPartition(partitionName: string) {
    this.spinner.show();

    this.scheduler
      .fetchSchedulerQueues(partitionName)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe((data) => {
        this.queueList = {};

        if (data && data.rootQueue) {
          this.rootQueue = data.rootQueue;
          this.queueList['level_00'] = [this.rootQueue!];
        }
      });
  }

  toggleQueueChildrenView(data: ToggleQueueChildrenEvent) {
    const isExpanded = data.queueItem.isExpanded;
    const children = data.queueItem.children;
    if (isExpanded && data.nextLevel && children) {
      this.queueList[data.nextLevel] = this.sortQueueListByName(children);
    } else {
      this.queueList[data.nextLevel] = null;
      this.closeQueueRacks(data.nextLevel);
      this.collapseChildrenQueues(data.queueItem);
      this.closeQueueDrawer();
    }
  }

  sortQueueListByName(queueList: QueueInfo[]) {
    return queueList.sort((queue1, queue2) => {
      const queueName1 = queue1.queueName.toLowerCase();
      const queueName2 = queue2.queueName.toLowerCase();
      if (queueName1 > queueName2) {
        return 1;
      }
      if (queueName1 < queueName2) {
        return -1;
      }
      return 0;
    });
  }

  closeQueueRacks(currentLevel: string) {
    const level = +currentLevel.split('_')[1];
    for (let index = MAX_QUEUE_LEVELS; index >= level; index--) {
      this.queueList[`level_0${index}`] = null;
    }
  }

  collapseChildrenQueues(queue: QueueInfo) {
    if (queue && queue.children) {
      queue.children.forEach((child) => {
        child.isExpanded = false;
        return this.collapseChildrenQueues(child);
      });
    }
  }

  unselectChildrenQueues(queue: QueueInfo, selected: QueueInfo) {
    if (queue !== selected) {
      queue.isSelected = false;
    }
    if (queue && queue.children) {
      queue.children.forEach((child) => {
        return this.unselectChildrenQueues(child, selected);
      });
    }
  }

  closeQueueDrawer() {
    if (this.selectedQueue) {
      this.selectedQueue.isSelected = false;
    }
    this.selectedQueue = null;
    this.closeMatDrawer();
  }

  closeMatDrawer() {
    this.matDrawer.close();
    setTimeout(() => {
      this.isDrawerContainerOpen = false;
    }, 100);
  }

  onQueueItemSelected(selected: QueueInfo) {
    this.unselectChildrenQueues(this.rootQueue!, selected);
    if (selected.isSelected) {
      this.selectedQueue = selected;
      this.isDrawerContainerOpen = true;
      this.matDrawer.open();
    } else {
      this.selectedQueue = null;
      this.closeMatDrawer();
    }
  }

  onPartitionSelectionChanged(selected: MatSelectChange) {
    if (selected.value !== '') {
      this.partitionSelected = selected.value;
      this.closeQueueDrawer();
      this.fetchSchedulerQueuesForPartition(this.partitionSelected);
    } else {
      this.partitionSelected = '';
      this.queueList = {};
    }
  }

  gotoApplicationsForPartitionAndQueue(event: MouseEvent, queueName: string) {
    event.preventDefault();

    if (this.partitionSelected && queueName) {
      this.router.navigate(['/applications'], {
        queryParams: {
          partition: this.partitionSelected,
          queue: queueName,
        },
      });
    }
  }
}
