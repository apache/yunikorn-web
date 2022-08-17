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

export class QueueInfo {
  queueName: string = '';
  status: string = '';
  partitionName: string = '';
  maxResource: string = '';
  guaranteedResource: string = '';
  allocatedResource: string = '';
  absoluteUsedCapacity: string = '';
  absoluteUsedPercent: number = 0;
  parentQueue: null | QueueInfo = null;
  children: null | QueueInfo[] = null;
  properties: QueuePropertyItem[] = [];
  template: null | QueueTemplate = null;
  isLeaf: boolean = false;
  isManaged: boolean = false;
  isExpanded: boolean = false;
  isSelected: boolean = false;
}

export interface QueuePropertyItem {
  name: string;
  value: string;
}

export interface QueueTemplate {
  maxResource: string;
  guaranteedResource: string;
  properties: { [key: string]: string };
}

export interface SchedulerInfo {
  rootQueue: QueueInfo;
}

export interface ToggleQueueChildrenEvent {
  queueItem: QueueInfo;
  nextLevel: string;
}
