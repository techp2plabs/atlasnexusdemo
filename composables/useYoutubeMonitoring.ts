export interface QuotaSummary {
  consumed: number
  limit: number
  remaining: number
  percent_used: number
  status: 'healthy' | 'warning' | 'critical'
}

export interface QuotaTrendBucket {
  hour: string
  units: number
}

export interface TopConsumerRow {
  module: string
  label: string
  units: number
  share_pct: number
}

export interface JobStatusRow {
  job_name: string
  last_run: string | null
  status: string | null
  duration_seconds: number | null
  fetch_request_id: string | null
}

export interface QuotaEventRow {
  timestamp: string
  service: string
  operation: string
  module: string
}

export type Granularity = 'hourly' | 'daily'

export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function useYoutubeMonitoring() {
  const { get } = useApi()
  const base = '/api/v1/admin/youtube-monitoring'

  const fetchQuotaSummary = (tz: string) =>
    get<QuotaSummary>(`${base}/quota-summary`, { params: { tz } })

  const fetchQuotaTrend = (params: {
    tz: string
    startDate?: string
    endDate?: string
    granularity: Granularity
  }) =>
    get<QuotaTrendBucket[]>(`${base}/quota-trend`, {
      params: {
        tz: params.tz,
        start_date: params.startDate,
        end_date: params.endDate,
        granularity: params.granularity,
      },
    })

  const fetchTopConsumers = (params: { tz: string; startDate?: string; endDate?: string }) =>
    get<TopConsumerRow[]>(`${base}/top-consumers`, {
      params: { tz: params.tz, start_date: params.startDate, end_date: params.endDate },
    })

  const fetchJobStatus = () => get<JobStatusRow[]>(`${base}/job-status`)
  const fetchQuotaEvents = () => get<QuotaEventRow[]>(`${base}/quota-events`)

  return { fetchQuotaSummary, fetchQuotaTrend, fetchTopConsumers, fetchJobStatus, fetchQuotaEvents }
}
