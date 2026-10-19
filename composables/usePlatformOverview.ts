import { useApi } from '~/composables/useApi'

export interface PendingInvitationsBreakdown {
  org_owners: number
  mcn_operators: number
  creators: number
}

export interface PlatformCounts {
  total_organizations: number
  active_organizations: number
  total_mcns: number
  active_mcns: number
  total_channels: number
  total_users: number
  pending_verifications: number
}

export interface ChannelDistributionItem {
  label: string
  channel_count: number
}

export interface PlatformTopChannelItem {
  channel_id: string
  channel_name: string
  thumbnail_url: string | null
  subscriber_count: number
  views_30d: number
}

export interface PlatformAnalyticsSnapshot {
  period_days: number
  total_views: number
  total_watch_time_hours: number
  subscribers_net: number
  estimated_revenue_usd: number | null
  data_as_of: string
}

export interface SyncHealthSummary {
  status: 'success' | 'partial_failure' | 'failed' | 'running' | 'unknown'
  last_run_at: string | null
  stale_channel_count: number
}

export interface PlatformOverviewData {
  pending_invitations_total: number
  pending_invitations_breakdown: PendingInvitationsBreakdown
  expiring_contracts_30d: number
  counts: PlatformCounts
  channel_distribution: ChannelDistributionItem[]
  top_channels: PlatformTopChannelItem[]
  analytics_snapshot: PlatformAnalyticsSnapshot | null
  sync_health: SyncHealthSummary | null
}

export function usePlatformOverview() {
  const { get } = useApi()
  const data = ref<PlatformOverviewData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await get<PlatformOverviewData>('/api/v1/dashboard/platform-overview')
      data.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch platform overview'
      console.error('Failed to fetch platform overview:', err)
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => fetch()

  return { data, loading, error, fetch, refresh }
}
