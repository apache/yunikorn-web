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

@Injectable({
    providedIn: 'root'
})
export class SchedulerService {
    constructor(private httpClient: HttpClient, private envConfig: EnvconfigService) {}

    public fetchClusterList(): Observable<ClusterInfo[]> {
        const clusterUrl = `${this.envConfig.getUschedulerWebAddress()}/ws/v1/clusters`;
        return this.httpClient.get(clusterUrl).pipe(map(data => data as ClusterInfo[]));
    }

    public fetchClusterByName(clusterName: string): Observable<ClusterInfo> {
        return this.fetchClusterList().pipe(
            map(data => {
                return data.find(obj => obj.clustername === clusterName);
            })
        );
    }

    public fetchSchedulerQueues(): Observable<any> {
        const queuesUrl = `${this.envConfig.getUschedulerWebAddress()}/ws/v1/queues`;
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
        const jobsUrl = `${this.envConfig.getUschedulerWebAddress()}/ws/v1/apps`;
        return this.httpClient.get(jobsUrl).pipe(
            map((data: any) => {
                const result = [];
                if (data && data.length > 0) {
                    data.forEach(job => {
                        const jobInfo = new JobInfo(
                            job['jobID'],
                            this.formatCapacity(this.splitCapacity(job['usedResource'])),
                            job['partition'],
                            job['queueName'],
                            job['submissionTime'],
                            null
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
                                        alloc['jobId'],
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
        const configCap = data['capacities']['capacity'];
        const usedCap = data['capacities']['usedcapacity'];
        const maxCap = data['capacities']['maxcapacity'];

        const configCapResources = this.splitCapacity(configCap);
        const usedCapResources = this.splitCapacity(usedCap);
        const maxCapResources = this.splitCapacity(maxCap);

        const absoluteUsedCapPercent = Math.max(
            Math.round((+usedCapResources.memory / +configCapResources.memory) * 100),
            Math.round((+usedCapResources.vcore / +configCapResources.vcore) * 100)
        );

        queue.capacity = this.formatCapacity(configCapResources) as any;
        queue.maxCapacity = this.formatCapacity(maxCapResources) as any;
        queue.usedCapacity = this.formatCapacity(usedCapResources) as any;
        queue.absoluteUsedCapacity = Math.min(absoluteUsedCapPercent, 100);
    }

    private splitCapacity(capacity: string): ResourceInfo {
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
                } else {
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
