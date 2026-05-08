export const AppStatus = {
  Operational: 'operational',
  Maintenance: 'maintenance',
  UpdateRequired: 'update_required',
  UpdateSuggested: 'update_suggested',
  NoNetwork: 'no_network',
  RequestFailed: 'request_failed',
} as const;

export type AppStatus = (typeof AppStatus)[keyof typeof AppStatus];
