const URL_TOKEN_RE = /https?:\/\/[^\s"'<>]+/g
const TRAILING_PUNCT_RE = /[)\].,;:!?"'‘’“”]+$/

/**
 * Auto-correct pasted URL artifacts (bullet markers, wrapping quotes,
 * multiple URLs on one line) into clean URLs, one per resulting entry.
 * Lines with no recognizable http(s) URL are kept as-is so they still
 * surface as an invalid-URL error, matching the backend's behavior.
 */
export function parseVideoUrls(text: string): string[] {
  const urls: string[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const matches = trimmed.match(URL_TOKEN_RE)
    if (matches) {
      urls.push(...matches.map((m) => m.replace(TRAILING_PUNCT_RE, '')).filter(Boolean))
    } else {
      urls.push(trimmed)
    }
  }
  return urls
}

/** First day of the given month (1-12) / year as an ISO date string (YYYY-MM-DD). */
export function firstDayOfMonth(year: number, month: number): string {
  const y = year
  const m = String(month).padStart(2, '0')
  return `${y}-${m}-01`
}

/** Last calendar day of the given month (1-12) / year as an ISO date string (YYYY-MM-DD). */
export function lastDayOfMonth(year: number, month: number): string {
  // Day 0 of the *next* month is the last day of the target month.
  const d = new Date(year, month, 0)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const MONTH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export type ChannelReportSelectionMode = 'mcn' | 'channel'

export interface ChannelReportCreate {
  report_name: string
  selection_mode: ChannelReportSelectionMode
  mcn_id?: string | null
  channel_ids: string[]
  period_start: string
  period_end: string
  /**
   * By default (include_manual_video_urls=false), used by the backend only as
   * a fallback if channel/period auto-resolution finds zero videos. When
   * include_manual_video_urls=true, merged with the auto-resolved list
   * (deduped by video ID) instead.
   */
  video_urls?: string[]
  include_manual_video_urls?: boolean
}

export type ChannelReportUpdate = ChannelReportCreate

export interface ChannelReportListMetrics {
  total_views: number | null
  total_subscribers: number | null
  total_videos: number | null
  avg_engagement_rate: number | null
}

export interface ChannelReportListItem {
  id: string
  report_name: string
  status: string
  video_count: number
  selection_mode: ChannelReportSelectionMode
  selected_mcn_id: string | null
  selected_mcn_name: string | null
  selected_channel_count: number
  period_start: string | null
  period_end: string | null
  period_in_progress: boolean
  created_at: string
  updated_at: string
  owner_email: string | null
  deleted_at: string | null
  primary_channel_thumbnail_url: string | null
  metrics: ChannelReportListMetrics | null
}

export interface PaginatedReports {
  items: ChannelReportListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface VideoSnippet {
  title: string
  description: string
  channel_id: string
  channel_title: string
  published_at: string
  tags: string[]
  category_id: string
  category_label: string
  default_language: string | null
  thumbnail_url: string
}

export interface VideoStatistics {
  view_count: number
  like_count: number
  comment_count: number
  engagement_rate: number | null
}

export interface VideoContent {
  duration_iso: string
  duration_seconds: number
  duration_formatted: string
  definition: string
  dimension: string
  has_captions: boolean
  licensed_content: boolean
  is_made_for_kids: boolean
  embeddable: boolean
  license: string
  privacy_status: string
}

export interface VideoEntry {
  url: string
  video_id: string
  snippet: VideoSnippet
  statistics: VideoStatistics
  content: VideoContent
  topics: string[]
  live_streaming: Record<string, string> | null
}

export interface ReportAggregates {
  video_count: number
  total_views: number
  total_likes: number
  total_comments: number
  total_duration_seconds: number
  avg_views: number
  avg_likes: number
  avg_comments: number
  avg_engagement_rate: number | null
  hd_count: number
  captioned_count: number
  live_count: number
}

export interface ChannelSnippet {
  title: string
  description: string
  custom_url: string
  published_at: string
  thumbnail_url: string
  country: string
  default_language: string | null
}

export interface ChannelStatistics {
  view_count: number
  subscriber_count: number
  video_count: number
  hidden_subscriber_count: boolean
}

export interface ChannelEntry {
  url: string
  channel_id: string
  snippet: ChannelSnippet
  statistics: ChannelStatistics
  topics: string[]
  keywords: string[]
}

export interface ChannelAggregates {
  channel_count: number
  total_views: number
  total_subscribers: number
  total_videos: number
  avg_views: number
  avg_subscribers: number
  avg_videos: number
}

export interface ReportData {
  fetched_at: string
  videos: VideoEntry[]
  failed_urls: { url: string; reason: string }[]
  aggregates: ReportAggregates
  channels: ChannelEntry[]
  failed_channel_urls: { url: string; reason: string }[]
  channel_aggregates: ChannelAggregates
}

export interface ChannelReport {
  id: string
  report_name: string
  brand_name: string | null
  campaign_name: string
  video_urls: string[]
  channel_urls: string[]
  selection_mode: ChannelReportSelectionMode
  selected_mcn_id: string | null
  selected_channel_ids: string[]
  manual_video_urls: string[]
  include_manual_video_urls: boolean
  auto_resolved_video_count: number | null
  additional_data_file_url: string | null
  additional_data_file_name: string | null
  youtube_shopping_data_file_url: string | null
  youtube_shopping_data_file_name: string | null
  period_start: string | null
  period_end: string | null
  status: string
  error_message: string | null
  report_data: ReportData | null
  created_at: string
  updated_at: string
  owner_email: string | null
  deleted_at: string | null
}

export interface ShareStatus {
  is_shared: boolean
  public_url: string | null
}

export interface ShareGenerateResult {
  is_shared: boolean
  public_url: string
  code: string
}

export interface UploadFileResult {
  file_url: string
  file_name: string
}

export function useChannelReport() {
  const { get, post, patch, delete: del } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const createReport = async (input: ChannelReportCreate): Promise<ChannelReport> => {
    loading.value = true
    error.value = null
    try {
      const res = await post<ChannelReport>('/api/v1/tools/youtube-channel-report', input)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to create report'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateReport = async (id: string, input: ChannelReportUpdate): Promise<ChannelReport> => {
    loading.value = true
    error.value = null
    try {
      const res = await patch<ChannelReport>(`/api/v1/tools/youtube-channel-report/${id}`, input)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to update report'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchReport = async (id: string): Promise<ChannelReport> => {
    const res = await get<ChannelReport>(`/api/v1/tools/youtube-channel-report/${id}`)
    return res.data
  }

  const refreshReport = async (id: string): Promise<ChannelReport> => {
    const res = await post<ChannelReport>(`/api/v1/tools/youtube-channel-report/${id}/refresh`)
    return res.data
  }

  const fetchReports = async (
    page = 1,
    pageSize = 20,
    status: 'active' | 'archived' = 'active',
    filters: { q?: string; periodStart?: string; periodEnd?: string; reportStatus?: string; sort?: 'recent' | 'name' } = {}
  ): Promise<PaginatedReports> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<PaginatedReports>('/api/v1/tools/youtube-channel-report', {
        params: { page, page_size: pageSize, status, ...(filters.q ? { q: filters.q } : {}), ...(filters.periodStart ? { period_start: filters.periodStart } : {}), ...(filters.periodEnd ? { period_end: filters.periodEnd } : {}), ...(filters.reportStatus ? { report_status: filters.reportStatus } : {}), sort: filters.sort || 'recent' },
      })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to load reports'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteReport = async (id: string): Promise<void> => {
    await del(`/api/v1/tools/youtube-channel-report/${id}`)
  }

  const restoreReport = async (id: string): Promise<ChannelReport> => {
    const res = await post<ChannelReport>(`/api/v1/tools/youtube-channel-report/${id}/restore`)
    return res.data
  }

  const downloadExcel = async (id: string, reportName: string): Promise<void> => {
    const { get } = useApi()
    const response = await get<Blob>(`/api/v1/tools/youtube-channel-report/${id}/download`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `channel-report-${reportName.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportSheets = async (id: string): Promise<string> => {
    const { get } = useApi()
    const res = await get<{ url: string }>(`/api/v1/tools/youtube-channel-report/${id}/export/sheets`)
    return res.data.url
  }

  const downloadPdf = async (id: string, reportName: string): Promise<void> => {
    const { get } = useApi()
    const response = await get<Blob>(`/api/v1/tools/youtube-channel-report/${id}/download/pdf`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `channel-report-${reportName.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getShareStatus = async (id: string): Promise<ShareStatus> => {
    const res = await get<ShareStatus>(`/api/v1/tools/youtube-channel-report/${id}/share`)
    return res.data
  }

  const generateShare = async (id: string): Promise<ShareGenerateResult> => {
    const res = await post<ShareGenerateResult>(`/api/v1/tools/youtube-channel-report/${id}/share`)
    return res.data
  }

  const disableShare = async (id: string): Promise<ShareStatus> => {
    const res = await del<ShareStatus>(`/api/v1/tools/youtube-channel-report/${id}/share`)
    return res.data
  }

  const uploadAdditionalData = async (id: string, file: File): Promise<UploadFileResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await post<UploadFileResult>(
      `/api/v1/tools/youtube-channel-report/${id}/upload/additional-data`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return res.data
  }

  const uploadShoppingData = async (id: string, file: File): Promise<UploadFileResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await post<UploadFileResult>(
      `/api/v1/tools/youtube-channel-report/${id}/upload/shopping-data`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return res.data
  }

  return {
    loading,
    error,
    createReport,
    updateReport,
    fetchReport,
    refreshReport,
    fetchReports,
    deleteReport,
    restoreReport,
    downloadExcel,
    exportSheets,
    downloadPdf,
    getShareStatus,
    generateShare,
    disableShare,
    uploadAdditionalData,
    uploadShoppingData,
  }
}
