import { useApi } from '~/composables/useApi'

export interface RevenueSplit {
  platform_share: number
  organization_share: number
  mcn_share: number
  channel_share: number
}

export interface TopChannel {
  channel_id: string
  channel_name: string
  revenue: number
}

export interface RevenuePreview {
  estimated_monthly_revenue: number
  revenue_splits: RevenueSplit
  top_channels: TopChannel[]
  last_updated: string
}

export function useRevenue() {
  const { get } = useApi()
  const revenueData = ref<RevenuePreview | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRevenuePreview = async () => {
    loading.value = true
    error.value = null
    try {
      // Try to fetch from API endpoint
      try {
        const response = await get<RevenuePreview>('/api/v1/revenue/preview')
        revenueData.value = response.data
      } catch (apiError: any) {
        // If API doesn't exist (404), use placeholder/mock data
        if (apiError.response?.status === 404) {
          // Revenue preview API not available, using placeholder data
          revenueData.value = getPlaceholderRevenueData()
        } else {
          throw apiError
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch revenue preview'
      console.error('Failed to fetch revenue preview:', err)
      // Fallback to placeholder data on error
      revenueData.value = getPlaceholderRevenueData()
    } finally {
      loading.value = false
    }
  }

  const getPlaceholderRevenueData = (): RevenuePreview => {
    return {
      estimated_monthly_revenue: 0,
      revenue_splits: {
        platform_share: 0,
        organization_share: 0,
        mcn_share: 0,
        channel_share: 0,
      },
      top_channels: [],
      last_updated: new Date().toISOString(),
    }
  }

  const refreshRevenue = async () => {
    await fetchRevenuePreview()
  }

  return {
    revenueData,
    loading,
    error,
    fetchRevenuePreview,
    refreshRevenue,
  }
}

