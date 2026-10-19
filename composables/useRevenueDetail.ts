import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export interface ChannelInfo {
  id: string
  title: string
  channel_id: string
  thumbnail_url: string | null
}

export interface RevenueByType {
  ads: number
  subscriptions: number
  shorts: number
  taxes: number
  audio_tier?: number
}

export interface DetailRevenueSummary {
  gross_revenue_usd: number
  by_report_type: RevenueByType
  by_subtype?: Record<string, number> | null
  /** Per report_type amounts included in split gross (owner-type splittable set) */
  gross_components?: Record<string, number> | null
}

export interface SplitLevel {
  party: string
  label: string
  share_pct: number
  amount_usd: number
  contract_number: string | null
  contract_id: string | null
  visible: boolean
}

export interface HiddenRemainder {
  label: string
  share_pct: number
  amount_usd: number
}

export interface SplitCascade {
  gross: number
  levels: SplitLevel[]
  hidden_remainder: HiddenRemainder | null
}

export interface ReportFileInfo {
  id: string
  report_type: string
  youtube_report_id: string
  row_count: number | null
}

export interface RevenueDetailResponse {
  channel: ChannelInfo
  month: number
  owner_type?: string
  summary: DetailRevenueSummary
  freshness?: {
    last_fetch_request_id?: string
    last_fetch_run_completed_at?: string
    snapshot_calculated_at?: string
  } | null
  split_cascade: SplitCascade
  report_files: ReportFileInfo[]
}

export function useRevenueDetail() {
  const { get } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDetail = async (channelId: string, month: number): Promise<RevenueDetailResponse | null> => {
    loading.value = true
    error.value = null
    console.log('[useRevenueDetail] Fetching detail for channel:', channelId, 'month:', month)
    try {
      const response = await get<RevenueDetailResponse>(
        `/api/v1/reports/revenue/channel/${channelId}/detail`,
        { params: { month } }
      )
      console.log('[useRevenueDetail] Response:', response.data)
      return response.data
    } catch (err: any) {
      console.error('[useRevenueDetail] Error:', err)
      error.value = err.response?.data?.detail || 'Failed to fetch revenue detail'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchDetail,
  }
}
