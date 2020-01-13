import { of } from 'rxjs';

export const noopFn = () => {};

export const MockSchedulerService = {
  fetchClusterByName: () => of({}),
  fetchClusterList: () => of([]),
  fetchSchedulerQueues: () => of({}),
  fetchJobList: () => of([])
};

export const MockNgxSpinnerService = {
  show: noopFn,
  hide: noopFn
};

export const MockActivatedRoute = {
  parent: { snapshot: { params: { clusterName: 'clusterName' } } }
};

export const MockEnvconfigService = {
  getSchedulerWebAddress: noopFn,
  getPrometheusWebAddress: noopFn
};
