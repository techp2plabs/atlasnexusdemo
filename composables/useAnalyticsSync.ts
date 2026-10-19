export interface AnalyticsSyncRunItem {
  id: string
  trigger_source: 'scheduled' | 'manual' | 'retry'
  triggered_by_user_id: string | null
  retry_of_run_id: string | null
  status: 'running' | 'success' | 'partial_failure' | 'failed'
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  channels_total: number
  channels_ok: number
  channels_failed: number
  persisted_rows: number
  failure_details: Record<string, string>
  error_message: string | null
  has_retry: boolean
}

export interface StaleChannelItem {
  channel_id: string
  last_fetched_at: string
  hours_stale: number
}

export interface AnalyticsSyncStatus {
  last_run: AnalyticsSyncRunItem | null
  total_channels_tracked: number
  stale_channels: StaleChannelItem[]
}

export interface TriggerSyncResponse {
  status: string
  message: string
  run: AnalyticsSyncRunItem | null
}

export function useAnalyticsSync() {
  const { get, post } = useApi()
  const base = '/api/v1/admin/analytics-sync'

  const fetchRuns = (params?: { limit?: number; status?: string }) =>
    get<{ runs: AnalyticsSyncRunItem[] }>(`${base}/runs`, { params })

  const fetchStatus = () => get<AnalyticsSyncStatus>(`${base}/status`)

  const triggerSync = (channelId?: string) =>
    post<TriggerSyncResponse>(`${base}/trigger`, { channel_id: channelId ?? null })

  const retryRun = (runId: string) =>
    post<TriggerSyncResponse>(`${base}/runs/${runId}/retry`)

  return { fetchRuns, fetchStatus, triggerSync, retryRun }
}
