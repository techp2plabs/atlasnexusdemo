import { useApi } from '~/composables/useApi'
import type { Organization } from '~/types/organization'
import type { MCN } from '~/types/mcn'

export interface RecentItem {
  id: string
  name: string
  type: 'organization' | 'mcn' | 'channel'
  lastAccessed?: string
  metadata?: {
    mcnCount?: number
    channelCount?: number
    organizationName?: string
    mcnName?: string
  }
}

// NOTE: platform-wide metrics (org/MCN/channel/user counts) and the activity feed
// used to be fetched/synthesized here. They now come from the single
// GET /dashboard/platform-overview call (usePlatformOverview) and
// GET /dashboard/activity call (useDashboardActivity) respectively — both computed
// server-side in one query pass instead of 4 client-side list-endpoint round trips
// and a fake "activity" built from recently-created orgs/MCNs.
export function useControlTower() {
  const { get } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const recentOrganizations = ref<Organization[]>([])
  const recentMcns = ref<MCN[]>([])
  const recentChannels = ref<any[]>([])

  // Helper function to extract data from paginated or non-paginated responses
  const extractData = (responseData: any): any[] => {
    if (Array.isArray(responseData)) {
      return responseData
    }
    if (responseData && responseData.items && Array.isArray(responseData.items)) {
      return responseData.items
    }
    return []
  }

  const fetchRecentItems = async () => {
    try {
      // Fetch recent organizations (last 5, sorted by updated_at)
      const orgsResponse = await get('/api/v1/organizations?page_size=100').catch(() => ({ data: { items: [] } }))
      const orgs = extractData(orgsResponse.data)
      recentOrganizations.value = orgs
        .sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime()
          const dateB = new Date(b.updated_at || b.created_at).getTime()
          return dateB - dateA
        })
        .slice(0, 5)

      // Fetch recent MCNs (last 5, sorted by updated_at)
      const mcnsResponse = await get('/api/v1/mcns?page_size=100').catch(() => ({ data: { items: [] } }))
      const mcns = extractData(mcnsResponse.data)
      recentMcns.value = mcns
        .sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime()
          const dateB = new Date(b.updated_at || b.created_at).getTime()
          return dateB - dateA
        })
        .slice(0, 5)

      // Fetch recent channels (last 5, sorted by updated_at) - Phase 2
      const channelsResponse = await get('/api/v1/channels?page_size=100').catch(() => ({ data: { items: [] } }))
      const channels = extractData(channelsResponse.data)
      recentChannels.value = channels
        .sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime()
          const dateB = new Date(b.updated_at || b.created_at).getTime()
          return dateB - dateA
        })
        .slice(0, 5)
    } catch (err: any) {
      console.error('Failed to fetch recent items:', err)
    }
  }

  const fetchControlTowerData = async () => {
    loading.value = true
    error.value = null
    try {
      await fetchRecentItems()
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch control tower data'
      console.error('Failed to fetch control tower data:', err)
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => {
    await fetchControlTowerData()
  }

  return {
    recentOrganizations,
    recentMcns,
    recentChannels,
    loading,
    error,
    fetchControlTowerData,
    refresh,
  }
}

