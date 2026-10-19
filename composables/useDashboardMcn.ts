import { useApi } from '~/composables/useApi'
import type { AnalyticsSnapshot } from '~/composables/useDashboardOrg'

export interface TopChannelItem {
  channel_id: string
  channel_name: string
  thumbnail_url: string | null
  subscriber_count: number
  views_30d: number
}

export interface McnItem {
  mcn_id: string
  mcn_name: string
  channel_count: number
  creator_count: number
  pending_invitations: number
  active_contracts: number
  expiring_contracts_30d: number
  top_channels: TopChannelItem[]
}

export interface McnOverviewData {
  mcns: McnItem[]
  totals: {
    channels: number
    creators: number
    pending_invitations: number
    active_contracts: number
  }
  analytics_snapshot: AnalyticsSnapshot | null
}

export function useDashboardMcn() {
  const { get } = useApi()
  const data = ref<McnOverviewData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async (mcnId?: string) => {
    loading.value = true
    error.value = null
    try {
      const url = mcnId
        ? `/api/v1/dashboard/mcn-overview?mcn_id=${mcnId}`
        : '/api/v1/dashboard/mcn-overview'
      const response = await get<McnOverviewData>(url)
      data.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch MCN overview'
      console.error('Failed to fetch MCN overview:', err)
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => fetch()

  return { data, loading, error, fetch, refresh }
}
