import { useApi } from '~/composables/useApi'
import type { AnalyticsSnapshot } from '~/composables/useDashboardOrg'

export interface CreatorContractInfo {
  contract_id: string
  status: 'active' | 'expiring_soon' | 'expired' | string
  revenue_share_pct: number
  expiry_date: string | null
}

export interface CreatorChannelItem {
  channel_id: string
  channel_name: string
  thumbnail_url: string | null
  youtube_channel_id: string
  subscriber_count: number
  contract: CreatorContractInfo | null
}

export interface CreatorOverviewData {
  channels: CreatorChannelItem[]
  analytics_snapshot: AnalyticsSnapshot | null
}

export function useDashboardCreator() {
  const { get } = useApi()
  const data = ref<CreatorOverviewData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await get<CreatorOverviewData>('/api/v1/dashboard/creator-overview')
      data.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch creator overview'
      console.error('Failed to fetch creator overview:', err)
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => fetch()

  return { data, loading, error, fetch, refresh }
}
