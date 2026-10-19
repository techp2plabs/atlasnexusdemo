import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DateRange {
  start: string
  end: string
}

export interface AnalyticsSummary {
  total_views: number
  total_watch_time_minutes: number
  subscribers_gained: number
  subscribers_lost: number
  estimated_revenue_usd: number | null
  channel_count: number
}

export interface DailyDataPoint {
  date: string
  views: number
  watch_time_minutes: number
  subscribers_gained: number
  subscribers_lost: number
}

export interface TopChannelItem {
  channel_id: string
  title: string
  mcn_id: string | null
  mcn_name: string | null
  creator_user_id: string | null
  creator_name: string | null
  views: number
  watch_time_minutes: number
  subscribers: number
  estimated_revenue_usd: number | null
  thumbnail_url: string | null
  synced_at: string | null
}

export interface McnRevenueItem {
  mcn_id: string
  mcn_name: string
  estimated_revenue_usd: number
}

export interface ExcludedChannel {
  channel_id: string
  reason: 'no_content_owner_or_oauth' | 'permission_denied' | 'fetch_error'
}

export interface AnalyticsSummaryResponse {
  fetched_at: string
  date_range: DateRange
  summary: AnalyticsSummary
  mcn_revenue_breakdown: McnRevenueItem[]
  excluded_channel_ids: string[]
  excluded_channels: ExcludedChannel[]
}

export interface AnalyticsTimeseriesResponse {
  fetched_at: string
  date_range: DateRange
  daily_timeseries: DailyDataPoint[]
}

export interface TopChannelsResponse {
  fetched_at: string
  date_range: DateRange
  top_channels: TopChannelItem[]
}

export interface ChannelAnalyticsResponse {
  fetched_at: string
  date_range: DateRange
  channel_id: string
  channel_title: string
  thumbnail_url: string | null
  mcn_id: string | null
  mcn_name: string | null
  creator_user_id: string | null
  creator_name: string | null
  summary: AnalyticsSummary
  daily_timeseries: DailyDataPoint[]
}

export interface TopVideoItem {
  video_id: string
  title: string
  views: number
  watch_time_minutes: number
  published_at: string | null
}

export interface TopVideosResponse {
  fetched_at: string
  date_range: DateRange
  channel_id: string
  top_videos: TopVideoItem[]
}

export interface AnalyticsParams {
  date_range?: number
  org_id?: string | null
  mcn_id?: string | null
  channel_id?: string | null
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useAnalytics() {
  const { get, post } = useApi()

  const loading = ref(false)
  const refreshing = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<string | null>(null)

  const _params = (p: AnalyticsParams): Record<string, any> => {
    const out: Record<string, any> = { date_range: p.date_range ?? 30 }
    if (p.org_id) out.org_id = p.org_id
    if (p.mcn_id) out.mcn_id = p.mcn_id
    if (p.channel_id) out.channel_id = p.channel_id
    return out
  }

  const fetchSummary = async (params: AnalyticsParams): Promise<AnalyticsSummaryResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<AnalyticsSummaryResponse>('/api/v1/analytics/summary', { params: _params(params) })
      lastFetchedAt.value = res.data.fetched_at
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load analytics summary'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTimeseries = async (params: AnalyticsParams): Promise<AnalyticsTimeseriesResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<AnalyticsTimeseriesResponse>('/api/v1/analytics/timeseries', { params: _params(params) })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load timeseries'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTopChannels = async (
    params: AnalyticsParams,
    sortBy: 'views' | 'revenue' = 'views',
  ): Promise<TopChannelsResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const p = { ..._params(params), sort_by: sortBy }
      const res = await get<TopChannelsResponse>('/api/v1/analytics/top-channels', { params: p })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load top channels'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchChannelDetail = async (
    channelId: string,
    dateRange: number = 30,
  ): Promise<ChannelAnalyticsResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<ChannelAnalyticsResponse>(
        `/api/v1/analytics/channels/${channelId}`,
        { params: { date_range: dateRange } },
      )
      lastFetchedAt.value = res.data.fetched_at
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load channel analytics'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchChannelTopVideos = async (
    channelId: string,
    dateRange: number = 30,
  ): Promise<TopVideosResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<TopVideosResponse>(
        `/api/v1/analytics/channels/${channelId}/top-videos`,
        { params: { date_range: dateRange } },
      )
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load top videos'
      return null
    } finally {
      loading.value = false
    }
  }

  const refreshData = async (params?: {
    org_id?: string | null
    mcn_id?: string | null
    channel_id?: string | null
    date_range?: number
  }): Promise<boolean> => {
    refreshing.value = true
    error.value = null
    try {
      const p: Record<string, any> = {}
      if (params?.org_id) p.org_id = params.org_id
      if (params?.mcn_id) p.mcn_id = params.mcn_id
      if (params?.channel_id) p.channel_id = params.channel_id
      if (params?.date_range) p.date_range = params.date_range
      await post('/api/v1/analytics/refresh', null, { params: p })
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to refresh analytics'
      return false
    } finally {
      refreshing.value = false
    }
  }

  return {
    loading,
    refreshing,
    error,
    lastFetchedAt,
    fetchSummary,
    fetchTimeseries,
    fetchTopChannels,
    fetchChannelDetail,
    fetchChannelTopVideos,
    refreshData,
  }
}
