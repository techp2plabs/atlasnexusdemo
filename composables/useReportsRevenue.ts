import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export interface RevenueSyncRequest {
  month_from: number
  month_to?: number
}

export interface RevenueSyncResponse {
  status: 'ok' | 'partial' | 'error'
  rows_upserted: number
  report_files_processed: number
  skipped_unmapped_channels: number
  errors: string[]
}

export interface RevenueRecalculateRequest {
  month: number
}

export interface RevenueRecalculateResponse {
  status: 'ok' | 'partial' | 'error'
  channels_processed: number
  snapshots_upserted: number
  errors: string[]
}

export interface RevenueSplitAmounts {
  gross_amount_usd: number
  channel_amount_usd: number
  mcn_amount_usd: number
  organization_amount_usd: number
  platform_amount_usd: number
  channel_share_pct: number
  mcn_share_pct: number
  organization_share_pct: number
  platform_share_pct: number
  channel_contract_id?: string | null
  mcn_contract_id?: string | null
  organization_contract_id?: string | null

  channel_contract_number?: string | null
  mcn_contract_number?: string | null
  organization_contract_number?: string | null

  channel_contract_share_pct?: number | null
  mcn_contract_share_pct?: number | null
  organization_contract_share_pct?: number | null
}

export interface RevenueRow {
  freshness?: {
    last_fetch_request_id?: string | null
    last_fetch_run_completed_at?: string | null
    snapshot_calculated_at?: string | null
  } | null
  youtube_channel_id: string
  channel_title: string
  channel_youtube_id: string
  ads_usd: number
  subscriptions_usd: number
  shorts_usd: number
  taxes_withheld_usd: number
  by_subtype?: Record<string, number> | null
  split: RevenueSplitAmounts
  warnings: string[]
}

export interface RevenueSummary {
  gross_total_usd: number
  channel_total_usd: number
  mcn_total_usd: number
  organization_total_usd: number
  platform_total_usd: number
}

export interface RevenueReportResponse {
  month: number
  summary: RevenueSummary
  rows: RevenueRow[]
}

export function useReportsRevenue() {
  const { get, post } = useApi()

  const loading = ref(false)
  const syncing = ref(false)
  const error = ref<string | null>(null)

  const fetchReport = async (params: Record<string, any>) => {
    loading.value = true
    error.value = null
    try {
      const res = await get<RevenueReportResponse>('/api/v1/reports/revenue', { params })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load revenue report'
      throw e
    } finally {
      loading.value = false
    }
  }

  const syncRevenue = async (payload: RevenueSyncRequest) => {
    syncing.value = true
    error.value = null
    try {
      const res = await post<RevenueSyncResponse>('/api/v1/reports/revenue/sync', payload)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to sync revenue'
      throw e
    } finally {
      syncing.value = false
    }
  }

  const recalculateSplits = async (payload: RevenueRecalculateRequest) => {
    syncing.value = true
    error.value = null
    try {
      const res = await post<RevenueRecalculateResponse>('/api/v1/reports/revenue/recalculate', payload)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to recalculate revenue splits'
      throw e
    } finally {
      syncing.value = false
    }
  }

  return {
    loading,
    syncing,
    error,
    fetchReport,
    syncRevenue,
    recalculateSplits,
  }
}

