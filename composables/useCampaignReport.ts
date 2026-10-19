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

export interface CampaignReportCreate {
  brand_name: string
  campaign_name: string
  video_urls: string[]
  period_start: string
  period_end: string
}

export interface CampaignReportListItem {
  id: string
  brand_name: string | null
  campaign_name: string
  status: string
  video_count: number
  period_start: string | null
  period_end: string | null
  period_in_progress: boolean
  created_at: string
  owner_email: string | null
  deleted_at: string | null
}

export interface PaginatedReports {
  items: CampaignReportListItem[]
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

export interface CampaignReport {
  id: string
  brand_name: string | null
  campaign_name: string
  video_urls: string[]
  channel_urls: string[]
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

export function useCampaignReport() {
  const { get, post, patch, delete: del } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const createReport = async (input: CampaignReportCreate): Promise<CampaignReport> => {
    loading.value = true
    error.value = null
    try {
      const res = await post<CampaignReport>('/api/v1/tools/youtube-brand-deal-report', input)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to create report'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateReport = async (id: string, input: CampaignReportCreate): Promise<CampaignReport> => {
    loading.value = true
    error.value = null
    try {
      const res = await patch<CampaignReport>(`/api/v1/tools/youtube-brand-deal-report/${id}`, input)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to update report'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchReport = async (id: string): Promise<CampaignReport> => {
    const res = await get<CampaignReport>(`/api/v1/tools/youtube-brand-deal-report/${id}`)
    return res.data
  }

  const refreshReport = async (id: string): Promise<CampaignReport> => {
    const res = await post<CampaignReport>(`/api/v1/tools/youtube-brand-deal-report/${id}/refresh`)
    return res.data
  }

  const fetchReports = async (
    page = 1,
    pageSize = 20,
    status: 'active' | 'archived' = 'active',
    q?: string
  ): Promise<PaginatedReports> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<PaginatedReports>('/api/v1/tools/youtube-brand-deal-report', {
        params: { page, page_size: pageSize, status, ...(q ? { q } : {}) },
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
    await del(`/api/v1/tools/youtube-brand-deal-report/${id}`)
  }

  const restoreReport = async (id: string): Promise<CampaignReport> => {
    const res = await post<CampaignReport>(`/api/v1/tools/youtube-brand-deal-report/${id}/restore`)
    return res.data
  }

  const downloadExcel = async (id: string, campaignName: string): Promise<void> => {
    const { get } = useApi()
    const response = await get<Blob>(`/api/v1/tools/youtube-brand-deal-report/${id}/download`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-report-${campaignName.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportSheets = async (id: string): Promise<string> => {
    const { get } = useApi()
    const res = await get<{ url: string }>(`/api/v1/tools/youtube-brand-deal-report/${id}/export/sheets`)
    return res.data.url
  }

  const downloadPdf = async (id: string, campaignName: string): Promise<void> => {
    const { get } = useApi()
    const response = await get<Blob>(`/api/v1/tools/youtube-brand-deal-report/${id}/download/pdf`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brand-deal-report-${campaignName.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getShareStatus = async (id: string): Promise<ShareStatus> => {
    const res = await get<ShareStatus>(`/api/v1/tools/youtube-brand-deal-report/${id}/share`)
    return res.data
  }

  const generateShare = async (id: string): Promise<ShareGenerateResult> => {
    const res = await post<ShareGenerateResult>(`/api/v1/tools/youtube-brand-deal-report/${id}/share`)
    return res.data
  }

  const disableShare = async (id: string): Promise<ShareStatus> => {
    const res = await del<ShareStatus>(`/api/v1/tools/youtube-brand-deal-report/${id}/share`)
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
  }
}
