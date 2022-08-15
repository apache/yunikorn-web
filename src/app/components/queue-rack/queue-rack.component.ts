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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { QueueInfo, ToggleQueueChildrenEvent } from '@app/models/queue-info.model';
import { NOT_AVAILABLE } from '@app/utils/constants';
import { queueScheduler } from 'rxjs';

@Component({
  selector: 'app-queue-rack',
  templateUrl: './queue-rack.component.html',
  styleUrls: ['./queue-rack.component.scss'],
})
export class QueueRackComponent implements OnInit {
  @Input() queueList: QueueInfo[] | null = [];
  @Input() nextLevel = '';

  @Output() toggleChildren = new EventEmitter<ToggleQueueChildrenEvent>();
  @Output() queueSelected = new EventEmitter<QueueInfo>();

  constructor() {}

  ngOnInit() {}

  toggleQueueChildren(event: Event, item: QueueInfo) {
    event.preventDefault();
    event.stopPropagation();
    this.collapseQueueList(item);
    item.isExpanded = !item.isExpanded;
    this.toggleChildren.emit({
      queueItem: item,
      nextLevel: this.nextLevel,
    });
  }

  collapseQueueList(item: QueueInfo) {
    if (this.queueList) {
      this.queueList.forEach((queue) => {
        if (queue !== item) {
          queue.isExpanded = false;
        }
      });
    }
  }

  onQueueSelected(queue: QueueInfo) {
    queue.isSelected = !queue.isSelected;
    this.queueSelected.emit(queue);
  }

  getQueueCapacityColor(queue: QueueInfo) {
    const value = queue.absoluteUsedPercent;
    if (value > 60 && value <= 75) {
      return '#60cea5';
    } else if (value > 75 && value < 90) {
      return '#ffbc0b';
    } else if (value >= 90) {
      return '#ef6162';
    }
    return '#fff';
  }

  getProgressBarValue(queue: QueueInfo) {
    return queue.absoluteUsedPercent;
  }
}
