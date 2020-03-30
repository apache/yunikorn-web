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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { QueueInfo } from '@app/models/queue-info.model';
import { EnvconfigService } from '../envconfig/envconfig.service';
import { ClusterInfo } from '@app/models/cluster-info.model';
import { CommonUtil } from '@app/utils/common.util';
import { ResourceInfo } from '@app/models/resource-info.model';
import { JobInfo, JobAllocation } from '@app/models/job-info.model';
import { HistoryInfo } from '@app/models/history-info.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  constructor(private httpClient: HttpClient, private envConfig: EnvconfigService) {}

  public fetchClusterList(): Observable<ClusterInfo[]> {
    const clusterUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/clusters`;
    return this.httpClient.get(clusterUrl).pipe(map(data => data as ClusterInfo[]));
  }

  public fetchClusterByName(clusterName: string): Observable<ClusterInfo> {
    return this.fetchClusterList().pipe(
      map(data => {
        return data.find(obj => obj.clusterName === clusterName);
      })
    );
  }

  public fetchSchedulerQueues(): Observable<any> {
    const queuesUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/queues`;
    return this.httpClient.get(queuesUrl).pipe(
      map((data: any) => {
        let rootQueue = new QueueInfo();
        if (data && data.queues && data.queues[0]) {
          const rootQueueData = data.queues[0];
          rootQueue.queueName = rootQueueData.queuename;
          rootQueue.state = rootQueueData.status || 'RUNNING';
          rootQueue.children = null;
          rootQueue.isLeafQueue = false;
          this.fillQueueCapacities(rootQueueData, rootQueue);
          rootQueue = this.generateQueuesTree(rootQueueData, rootQueue);
        }
        const partitionName = data['partitionname'] || '';
        return {
          rootQueue,
          partitionName
        };
      })
    );
  }

  public fetchJobList(): Observable<JobInfo[]> {
    const jobsUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/apps`;
    return this.httpClient.get(jobsUrl).pipe(
      map((data: any) => {
        const result = [];
        if (data && data.length > 0) {
          data.forEach(job => {
            const jobInfo = new JobInfo(
              job['applicationID'],
              this.formatCapacity(this.splitCapacity(job['usedResource'])),
              job['partition'],
              job['queueName'],
              job['submissionTime'],
              null,
              job['applicationState']
            );
            const allocations = job['allocations'];
            if (allocations && allocations.length > 0) {
              const jobAllocations = [];
              allocations.forEach(alloc => {
                jobAllocations.push(
                  new JobAllocation(
                    alloc['allocationKey'],
                    alloc['allocationTags'],
                    alloc['uuid'],
                    this.formatCapacity(this.splitCapacity(alloc['resource'])),
                    alloc['priority'],
                    alloc['queueName'],
                    alloc['nodeId'],
                    alloc['applicationId'],
                    alloc['partition']
                  )
                );
              });
              jobInfo.setAllocations(jobAllocations);
            }
            result.push(jobInfo);
          });
        }
        return result;
      })
    );
  }

  public fetchAppHistory(): Observable<HistoryInfo[]> {
    const appHistoryUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/history/apps`;
    return this.httpClient.get(appHistoryUrl).pipe(
      map((data: any[]) => {
        const result = [];

        if (data && data.length) {
          data.forEach(history => {
            result.push(
              new HistoryInfo(Math.floor(history.timestamp / 1e6), +history.totalApplications)
            );
          });
        }

        return result;
      })
    );
  }

  public fetchContainerHistory(): Observable<HistoryInfo[]> {
    const containerHistoryUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/history/containers`;
    return this.httpClient.get(containerHistoryUrl).pipe(
      map((data: any[]) => {
        const result = [];

        if (data && data.length) {
          data.forEach(history => {
            result.push(
              new HistoryInfo(Math.floor(history.timestamp / 1e6), +history.totalContainers)
            );
          });
        }

        return result;
      })
    );
  }

  private generateQueuesTree(data: any, currentQueue: QueueInfo) {
    if (data && data.queues && data.queues.length > 0) {
      const chilrenQs = [];
      data.queues.forEach(queue => {
        const childQueue = new QueueInfo();
        childQueue.queueName = '' + queue.queuename;
        childQueue.state = queue.status || 'RUNNING';
        childQueue.parentQueue = currentQueue ? currentQueue : null;
        this.fillQueueCapacities(queue, childQueue);
        chilrenQs.push(childQueue);
        return this.generateQueuesTree(queue, childQueue);
      });
      currentQueue.children = chilrenQs;
      currentQueue.isLeafQueue = false;
    } else {
      currentQueue.isLeafQueue = true;
    }
    return currentQueue;
  }

  private fillQueueCapacities(data: any, queue: QueueInfo) {
    const configCap = data['capacities']['capacity'] as string;
    const usedCap = data['capacities']['usedcapacity'] as string;
    const maxCap = data['capacities']['maxcapacity'] as string;
    const absUsedCapacity = data['capacities']['absusedcapacity'] as string;

    const configCapResources = this.splitCapacity(configCap);
    const usedCapResources = this.splitCapacity(usedCap);
    const maxCapResources = this.splitCapacity(maxCap);

    queue.capacity = this.formatCapacity(configCapResources);
    queue.maxCapacity = this.formatCapacity(maxCapResources);
    queue.usedCapacity = this.formatCapacity(usedCapResources);
    queue.absoluteUsedCapacity = absUsedCapacity ? absUsedCapacity : '0';
  }

  private splitCapacity(capacity: string = ''): ResourceInfo {
    const splitted = capacity
      .replace('map', '')
      .replace(/[\[\]]/g, '')
      .split(' ');

    const resources: ResourceInfo = {
      memory: '0',
      vcore: '0'
    };

    for (const resource of splitted) {
      if (resource) {
        const values = resource.split(':');
        if (values[0] === 'memory') {
          resources.memory = values[1];
        }
        if (values[0] === 'vcore') {
          resources.vcore = values[1];
        }
      }
    }

    return resources;
  }

  private formatCapacity(resourceInfo: ResourceInfo) {
    const formatted = [];
    formatted.push(`[memory: ${CommonUtil.formatMemory(+resourceInfo.memory)}`);
    formatted.push(`vcore: ${resourceInfo.vcore}]`);
    return formatted.join(', ');
  }
}
