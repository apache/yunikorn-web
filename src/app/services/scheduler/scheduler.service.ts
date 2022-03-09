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

import { QueueInfo, QueuePropertyItem } from '@app/models/queue-info.model';
import { EnvconfigService } from '../envconfig/envconfig.service';
import { ClusterInfo } from '@app/models/cluster-info.model';
import { CommonUtil } from '@app/utils/common.util';
import { ResourceInfo } from '@app/models/resource-info.model';
import { AppInfo } from '@app/models/app-info.model';
import { AllocationInfo } from '@app/models/alloc-info.model';
import { HistoryInfo } from '@app/models/history-info.model';
import { NodeInfo } from '@app/models/node-info.model';
import { NOT_AVAILABLE } from '@app/utils/constants';
import { Partition } from '@app/models/partition-info.model';

@Injectable({
  providedIn: 'root',
})
export class SchedulerService {
  constructor(private httpClient: HttpClient, private envConfig: EnvconfigService) {}

  fetchClusterList(): Observable<ClusterInfo[]> {
    const clusterUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/clusters`;
    return this.httpClient.get(clusterUrl).pipe(map(data => data as ClusterInfo[]));
  }

  fetchPartitionList(): Observable<Partition[]> {
    const partitionUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/partitions`;
    return this.httpClient.get(partitionUrl).pipe(map(data => data as Partition[]));
  }

  fetchSchedulerQueues(partitionName: string): Observable<any> {
    const queuesUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/partition/${partitionName}/queues`;

    return this.httpClient.get(queuesUrl).pipe(
      map((data: any) => {
        let rootQueue = new QueueInfo();

        if (data) {
          rootQueue.queueName = data.queuename;
          rootQueue.status = data.status || NOT_AVAILABLE;
          rootQueue.isLeaf = data.isLeaf;
          rootQueue.isManaged = data.isManaged;
          rootQueue.partitionName = data.partition;
          rootQueue.children = null;
          this.fillQueueResources(data, rootQueue);
          this.fillQueuePropertiesAndTemplate(data, rootQueue);
          rootQueue = this.generateQueuesTree(data, rootQueue);
        }

        return {
          rootQueue,
        };
      })
    );
  }

  fetchAppList(): Observable<AppInfo[]> {
    const appsUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/apps`;
    return this.httpClient.get(appsUrl).pipe(
      map((data: any) => {
        const result = [];
        if (data && data.length > 0) {
          data.forEach(app => {
            const appInfo = new AppInfo(
              app['applicationID'],
              this.formatCapacity(this.splitCapacity(app['usedResource'], NOT_AVAILABLE)),
              app['partition'],
              app['queueName'],
              app['submissionTime'],
              app['applicationState'],
              []
            );
            const allocations = app['allocations'];
            if (allocations && allocations.length > 0) {
              const appAllocations = [];
              allocations.forEach(alloc => {
                if (
                  alloc.allocationTags &&
                  alloc.allocationTags['kubernetes.io/meta/namespace'] &&
                  alloc.allocationTags['kubernetes.io/meta/podName']
                ) {
                  alloc[
                    'displayName'
                  ] = `${alloc.allocationTags['kubernetes.io/meta/namespace']}/${alloc.allocationTags['kubernetes.io/meta/podName']}`;
                } else {
                  alloc['displayName'] = `<nil>`;
                }
                appAllocations.push(
                  new AllocationInfo(
                    alloc['displayName'],
                    alloc['allocationKey'],
                    alloc['allocationTags'],
                    alloc['uuid'],
                    this.formatCapacity(this.splitCapacity(alloc['resource'], NOT_AVAILABLE)),
                    alloc['priority'],
                    alloc['queueName'],
                    alloc['nodeId'],
                    alloc['applicationId'],
                    alloc['partition']
                  )
                );
              });
              appInfo.setAllocations(appAllocations);
            }
            result.push(appInfo);
          });
        }
        return result;
      })
    );
  }

  fetchAppHistory(): Observable<HistoryInfo[]> {
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

  fetchContainerHistory(): Observable<HistoryInfo[]> {
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

  fetchNodeList(partitionName: string): Observable<NodeInfo[]> {
    const nodesUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/partition/${partitionName}/nodes`;

    return this.httpClient.get(nodesUrl).pipe(
      map((data: any) => {
        const result = [];

        if (data && data.length > 0) {
          data.forEach(node => {
            const nodeInfo = new NodeInfo(
              node['nodeID'],
              node['hostName'],
              node['rackName'],
              node['partition'] || NOT_AVAILABLE,
              this.formatCapacity(this.splitCapacity(node['capacity'], NOT_AVAILABLE)),
              this.formatCapacity(this.splitCapacity(node['allocated'], NOT_AVAILABLE)),
              this.formatCapacity(this.splitCapacity(node['occupied'], NOT_AVAILABLE)),
              this.formatCapacity(this.splitCapacity(node['available'], NOT_AVAILABLE)),
              this.formatCapacity(this.splitCapacity(node['utilized'], NOT_AVAILABLE)),
              []
            );

            const allocations = node['allocations'];

            if (allocations && allocations.length > 0) {
              const appAllocations = [];

              allocations.forEach(alloc => {
                if (
                  alloc.allocationTags &&
                  alloc.allocationTags['kubernetes.io/meta/namespace'] &&
                  alloc.allocationTags['kubernetes.io/meta/podName']
                ) {
                  alloc[
                    'displayName'
                  ] = `${alloc.allocationTags['kubernetes.io/meta/namespace']}/${alloc.allocationTags['kubernetes.io/meta/podName']}`;
                } else {
                  alloc['displayName'] = '<nil>';
                }
                appAllocations.push(
                  new AllocationInfo(
                    alloc['displayName'],
                    alloc['allocationKey'],
                    alloc['allocationTags'],
                    alloc['uuid'],
                    this.formatCapacity(this.splitCapacity(alloc['resource'], NOT_AVAILABLE)),
                    alloc['priority'],
                    alloc['queueName'],
                    alloc['nodeId'],
                    alloc['applicationId'],
                    alloc['partition']
                  )
                );
              });

              nodeInfo.setAllocations(appAllocations);
            }

            result.push(nodeInfo);
          });
        }

        return result;
      })
    );
  }

  private generateQueuesTree(data: any, currentQueue: QueueInfo) {
    if (data && data.children && data.children.length > 0) {
      const chilrenQs = [];

      data.children.forEach(queueData => {
        const childQueue = new QueueInfo();

        childQueue.queueName = queueData.queuename as string;
        childQueue.status = queueData.status || 'n/a';
        childQueue.parentQueue = currentQueue ? currentQueue : null;
        childQueue.isLeaf = queueData.isLeaf;

        this.fillQueueResources(queueData, childQueue);
        this.fillQueuePropertiesAndTemplate(queueData, childQueue);
        chilrenQs.push(childQueue);

        return this.generateQueuesTree(queueData, childQueue);
      });

      currentQueue.children = chilrenQs;
    }

    return currentQueue;
  }

  private fillQueueResources(data: any, queue: QueueInfo) {
    const maxResource = data['maxResource'] as string;
    const guaranteedResource = data['guaranteedResource'] as string;
    const allocatedResource = data['allocatedResource'] as string;
    queue.maxResource = this.formatCapacity(this.splitCapacity(maxResource, NOT_AVAILABLE));
    queue.guaranteedResource = this.formatCapacity(
      this.splitCapacity(guaranteedResource, NOT_AVAILABLE)
    );
    queue.allocatedResource = this.formatCapacity(
      this.splitCapacity(allocatedResource, NOT_AVAILABLE)
    );
  }

  private fillQueuePropertiesAndTemplate(data: any, queue: QueueInfo) {
    if (data.properties && !CommonUtil.isEmpty(data.properties)) {
      const dataProps = Object.entries<string>(data.properties);

      queue.properties = dataProps.map(prop => {
        return {
          name: prop[0],
          value: prop[1],
        } as QueuePropertyItem;
      });
    } else {
      queue.properties = [];
    }

    if (data.template) {
      queue.template = data.template;
    } else {
      queue.template = null;
    }
  }

  private splitCapacity(capacity: string = '', defaultValue: string): ResourceInfo {
    const splitted = capacity
      .replace('map', '')
      .replace(/[\[\]]/g, '')
      .split(' ');

    const resources: ResourceInfo = {
      memory: defaultValue,
      vcore: defaultValue,
    };

    for (const resource of splitted) {
      if (resource) {
        const values = resource.split(':');
        if (values[0] === 'memory' && values[1] !== '') {
          resources.memory = values[1];
        }
        if (values[0] === 'vcore' && values[1] !== '') {
          resources.vcore = values[1];
        }
      }
    }

    return resources;
  }

  private formatCapacity(resourceInfo: ResourceInfo) {
    const formatted = [];
    if (resourceInfo.memory !== NOT_AVAILABLE) {
      formatted.push(`Memory: ${CommonUtil.formatMemory(resourceInfo.memory)}`);
    } else {
      formatted.push(`Memory: ${resourceInfo.memory}`);
    }
    if (resourceInfo.vcore !== NOT_AVAILABLE) {
      formatted.push(`CPU: ${CommonUtil.formatCount(resourceInfo.vcore)}`);
    } else {
      formatted.push(`CPU: ${resourceInfo.vcore}`);
    }
    return formatted.join(', ');
  }

  private formatAbsCapacity(resourceInfo: ResourceInfo) {
    const formatted = [];
    if (resourceInfo.memory !== NOT_AVAILABLE) {
      formatted.push(`Memory: ${resourceInfo.memory}%`);
    } else {
      formatted.push(`Memory: ${resourceInfo.memory}`);
    }
    if (resourceInfo.vcore !== NOT_AVAILABLE) {
      formatted.push(`CPU: ${resourceInfo.vcore}%`);
    } else {
      formatted.push(`CPU: ${resourceInfo.vcore}`);
    }
    return formatted.join(', ');
  }
}
