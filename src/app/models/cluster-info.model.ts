export interface ClusterInfo {
  clusterName: string;
  activeNodes: string;
  failedNodes: string;
  totalNodes: string;
  completedApplications: string;
  failedApplications: string;
  pendingApplications: string;
  runningApplications: string;
  totalApplications: string;
  failedContainers: string;
  pendingContainers: string;
  runningContainers: string;
  totalContainers: string;
}
