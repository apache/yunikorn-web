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

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AllocationInfo} from '@app/models/alloc-info.model';
import {AppInfo} from '@app/models/app-info.model';
import {ClusterInfo} from '@app/models/cluster-info.model';
import {HistoryInfo} from '@app/models/history-info.model';
import {NodeInfo} from '@app/models/node-info.model';
import {NodeUtilization} from '@app/models/node-utilization.model';
import {Partition} from '@app/models/partition-info.model';

import {QueueInfo, QueuePropertyItem} from '@app/models/queue-info.model';
import {SchedulerResourceInfo} from '@app/models/resource-info.model';
import {SchedulerHealthInfo} from "@app/models/scheduler-health-info.model";
import {CommonUtil} from '@app/utils/common.util';
import {NOT_AVAILABLE} from '@app/utils/constants';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {EnvconfigService} from '../envconfig/envconfig.service';

@Injectable({
  providedIn: 'root',
})
export class SchedulerService {
  constructor(private httpClient: HttpClient, private envConfig: EnvconfigService) {}

  fetchClusterList(): Observable<ClusterInfo[]> {
    const clusterUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/clusters`;
    return this.httpClient.get(clusterUrl).pipe(map((data) => data as ClusterInfo[]));
  }

  fetchPartitionList(): Observable<Partition[]> {
    const partitionUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/partitions`;
    return this.httpClient.get(partitionUrl).pipe(map((data) => data as Partition[]));
  }

  fetchSchedulerQueues(partitionName: string): Observable<any> {
    const queuesUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/partition/${partitionName}/queues`;

    return this.httpClient.get(queuesUrl).pipe(
      map((data: any) => {
        if (data && !CommonUtil.isEmpty(data)) {
          let rootQueue = new QueueInfo();
          rootQueue.queueName = data.queuename;
          rootQueue.status = data.status || NOT_AVAILABLE;
          rootQueue.isLeaf = data.isLeaf;
          rootQueue.isManaged = data.isManaged;
          rootQueue.partitionName = data.partition;
          rootQueue.children = null;
          this.fillQueueResources(data, rootQueue);
          this.fillQueuePropertiesAndTemplate(data, rootQueue);
          rootQueue = this.generateQueuesTree(data, rootQueue);

          return {
            rootQueue,
          };
        }

        return {
          rootQueue: null,
        };
      })
    );
  }

  fetchAppList(partitionName: string, queueName: string): Observable<AppInfo[]> {
    const appsUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/partition/${partitionName}/queue/${queueName}/applications`;

    return this.httpClient.get(appsUrl).pipe(
      map((data: any) => {
        const result: AppInfo[] = [];

        if (data && data.length > 0) {
          data.forEach((app: any) => {
            const appInfo = new AppInfo(
              app['applicationID'],
              this.formatResource(app['usedResource'] as SchedulerResourceInfo),
              this.formatResource(app['pendingResource'] as SchedulerResourceInfo),
              this.formatResource(app['maxUsedResource'] as SchedulerResourceInfo),
              app['submissionTime'],
              app['lastStateChangeTime'],
              app['stateLog'],
              app['finishedTime'],
              app['applicationState'],
              []
            );
            appInfo.setLastStateChangeTime()
            
            const allocations = app['allocations'];
            if (allocations && allocations.length > 0) {
              const appAllocations: AllocationInfo[] = [];

              allocations.forEach((alloc: any) => {
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
                    this.formatResource(alloc['resource'] as SchedulerResourceInfo),
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
      map((data: any) => {
        const result: HistoryInfo[] = [];

        if (data && data.length) {
          data.forEach((history: any) => {
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
      map((data: any) => {
        const result: HistoryInfo[] = [];

        if (data && data.length) {
          data.forEach((history: any) => {
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
        const result: NodeInfo[] = [];

        if (data && data.length > 0) {
          data.forEach((node: any) => {
            const nodeInfo = new NodeInfo(
              node['nodeID'],
              node['hostName'],
              node['rackName'],
              node['partition'] || NOT_AVAILABLE,
              this.formatResource(node['capacity'] as SchedulerResourceInfo),
              this.formatResource(node['allocated'] as SchedulerResourceInfo),
              this.formatResource(node['occupied'] as SchedulerResourceInfo),
              this.formatResource(node['available'] as SchedulerResourceInfo),
              this.formatPercent(node['utilized'] as SchedulerResourceInfo),
              []
            );

            const allocations = node['allocations'];

            if (allocations && allocations.length > 0) {
              const appAllocations: AllocationInfo[] = [];

              allocations.forEach((alloc: any) => {
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
                    this.formatResource(alloc['resource'] as SchedulerResourceInfo),
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

  fetchNodeUtilization(): Observable<NodeUtilization>{
    const nodeUtilizationUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/scheduler/node-utilization`;
    return this.httpClient.get(nodeUtilizationUrl).pipe(map((data: any) => data as NodeUtilization));
  }

  fecthHealthchecks(): Observable<SchedulerHealthInfo> {
    const healthCheckUrl = `${this.envConfig.getSchedulerWebAddress()}/ws/v1/scheduler/healthcheck`;
    return this.httpClient.get(healthCheckUrl).pipe(map((data: any) => data as SchedulerHealthInfo));
  }

  private generateQueuesTree(data: any, currentQueue: QueueInfo) {
    if (data && data.children && data.children.length > 0) {
      const chilrenQs: QueueInfo[] = [];

      data.children.forEach((queueData: any) => {
        const childQueue = new QueueInfo();

        childQueue.queueName = queueData.queuename as string;
        childQueue.status = queueData.status || NOT_AVAILABLE;
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
    const maxResource = data['maxResource'] as SchedulerResourceInfo;
    const guaranteedResource = data['guaranteedResource'] as SchedulerResourceInfo;
    const allocatedResource = data['allocatedResource'] as SchedulerResourceInfo;
    const pendingResource = data['pendingResource'] as SchedulerResourceInfo;
    const absUsedCapacity = data['absUsedCapacity'] as SchedulerResourceInfo;
    queue.maxResource = this.formatResource(maxResource);
    queue.guaranteedResource = this.formatResource(guaranteedResource);
    queue.allocatedResource = this.formatResource(allocatedResource);
    queue.pendingResource = this.formatResource(pendingResource);
    queue.absoluteUsedCapacity = this.formatPercent(absUsedCapacity);
    queue.absoluteUsedPercent = this.absUsagePercent(absUsedCapacity);
  }

  private fillQueuePropertiesAndTemplate(data: any, queue: QueueInfo) {
    if (data.properties && !CommonUtil.isEmpty(data.properties)) {
      const dataProps = Object.entries<string>(data.properties);

      queue.properties = dataProps.map((prop) => {
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

  private formatResource(resource: SchedulerResourceInfo): string {
    const formatted = [];

    if (resource && resource.memory !== undefined) {
      formatted.push(`Memory: ${CommonUtil.formatBytes(resource.memory)}`);
    } else {
      formatted.push(`Memory: ${NOT_AVAILABLE}`);
    }

    if (resource && resource.vcore !== undefined) {
      formatted.push(`CPU: ${CommonUtil.formatCount(resource.vcore)}`);
    } else {
      formatted.push(`CPU: ${NOT_AVAILABLE}`);
    }

    if (resource){
      Object.keys(resource).forEach((key) => {
        switch(key){
          case "memory":
          case "vcore":{
            break;
          }
          case "ephemeral-storage":{
            if (resource[`ephemeral-storage`] == 0) {
              formatted.push(`ephemeral-storage: ${NOT_AVAILABLE}`);
            }else{
              formatted.push(`ephemeral-storage: ${CommonUtil.formatBytes(resource[key])}`);
            }
            break;
          }
          default:{
            if (resource[key] == 0) {
              formatted.push(`${key}: ${NOT_AVAILABLE}`);
            }else{
              formatted.push(`${key}: ${CommonUtil.formatOtherResource(resource[key])}`);
            }
            break;
          }
        }
      });
    }
    
    return formatted.join(', ');
  }

  private formatPercent(resource: SchedulerResourceInfo): string {
    const formatted = [];

    if (resource && resource.memory !== undefined) {
      formatted.push(`Memory: ${CommonUtil.formatPercent(resource.memory)}`);
    } else {
      formatted.push(`Memory: ${NOT_AVAILABLE}`);
    }

    if (resource && resource.vcore !== undefined) {
      formatted.push(`CPU: ${CommonUtil.formatPercent(resource.vcore)}`);
    } else {
      formatted.push(`CPU: ${NOT_AVAILABLE}`);
    }

    return formatted.join(', ');
  }

  private absUsagePercent(resource: SchedulerResourceInfo): number {
    let result = 0;

    if (resource && resource.memory !== undefined) {
      result = Math.max(result, resource.memory);
    }

    if (resource && resource.vcore !== undefined) {
      result = Math.max(result, resource.vcore);
    }

    return Math.max(0, Math.min(result, 100));
  }
}
