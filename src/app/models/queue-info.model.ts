export class QueueInfo {
  queueName: string;
  state: 'RUNNING' | 'STOPPED';
  capacity: string;
  maxCapacity: string;
  usedCapacity: string;
  absoluteCapacity: string;
  absoluteMaxCapacity: string;
  absoluteUsedCapacity: string;
  queuePath: string;
  parentQueue: null | QueueInfo;
  children: null | QueueInfo[];
  isLeafQueue: boolean;
  isExpanded = false;
  isSelected = false;
}

export interface SchedulerInfo {
  rootQueue: QueueInfo;
}

export interface ToggleQueueChildrenEvent {
  queueItem: QueueInfo;
  nextLevel: string;
}
