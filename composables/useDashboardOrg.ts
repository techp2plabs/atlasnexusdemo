import { useApi } from '~/composables/useApi'

export interface AnalyticsSnapshot {
  period_days: number
  total_views: number
  total_watch_time_hours: number
  subscribers_net: number
  estimated_revenue_usd: number | null
  data_as_of: string
}

export interface McnBreakdownItem {
  mcn_id: string
  mcn_name: string
  channel_count: number
  creator_count: number
  active_contracts: number
  estimated_monthly_revenue_usd: number | null
}

export interface OrgOverviewData {
  org: { id: string; name: string; created_at: string }
  counts: {
    mcns: number
    channels: number
    creator_users: number
    active_contracts: number
    expiring_contracts_30d: number
    expired_contracts: number
  }
  mcn_breakdown: McnBreakdownItem[]
  analytics_snapshot: AnalyticsSnapshot | null
}

export function useDashboardOrg() {
  const { get } = useApi()
  const data = ref<OrgOverviewData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async (orgId?: string) => {
    loading.value = true
    error.value = null
    try {
      const url = orgId
        ? `/api/v1/dashboard/org-overview?org_id=${orgId}`
        : '/api/v1/dashboard/org-overview'
      const response = await get<OrgOverviewData>(url)
      data.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch org overview'
      console.error('Failed to fetch org overview:', err)
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => fetch()

  return { data, loading, error, fetch, refresh }
}
