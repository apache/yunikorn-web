export type AppStatus =
  | 'New'
  | 'Accepted'
  | 'Starting'
  | 'Running'
  | 'Rejected'
  | 'Completing'
  | 'Completed'
  | 'Failing'
  | 'Failed'
  | 'Expired'
  | 'Resuming';

export type AppStatusColors = {
  [K in AppStatus]: string;
};
