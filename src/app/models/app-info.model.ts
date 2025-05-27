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

import { NOT_AVAILABLE } from '@app/utils/constants';
import * as moment from 'moment';
import { AllocationInfo } from './alloc-info.model';

export class AppInfo {
  isSelected = false;

  constructor(
    public applicationId: string,
    public usedResource: string,
    public pendingResource: string,
    public maxUsedResource: string,
    public submissionTime: number,
    public finishedTime: null | number,
    public stateLog: Array<StateLog> = [], // Default to empty array
    public lastStateChangeTime: null | number,
    public applicationState: string,
    public allocations: AllocationInfo[] | null
  ) {
    // Ensure stateLog is always an array
    if (!Array.isArray(this.stateLog)) {
      this.stateLog = [];
    }
  }

  get formattedSubmissionTime() {
    const millisecs = Math.round(this.submissionTime / (1000 * 1000));
    return moment(millisecs).format('YYYY/MM/DD HH:mm:ss');
  }

  get formattedlastStateChangeTime() {
    if(this.lastStateChangeTime==null){
      return 'n/a'
    }
    const millisecs = Math.round(this.lastStateChangeTime! / (1000 * 1000));
    return moment(millisecs).format('YYYY/MM/DD HH:mm:ss');
  }

  get formattedFinishedTime() {
    if (this.finishedTime) {
      const millisecs = Math.round(this.finishedTime / (1000 * 1000));
      return moment(millisecs).format('YYYY/MM/DD HH:mm:ss');
    }

    return NOT_AVAILABLE;
  }

  setAllocations(allocs: AllocationInfo[]) {
    this.allocations = allocs;
  }

  setLastStateChangeTime() {
    let time=0
    this.stateLog.forEach(log => {
      if (log.time>time){
        time=log.time
      }
    });
    this.lastStateChangeTime=time
  }
}

export class StateLog{
  constructor(
    public time: number,
    public applicationState: string
  ) {}
}
