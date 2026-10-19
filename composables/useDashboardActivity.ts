import { useApi } from '~/composables/useApi'

export interface ActivityLogItem {
  id: string
  action: string
  actor_user_id: string | null
  actor_name: string | null
  organization_id: string | null
  mcn_id: string | null
  meta: Record<string, any> | null
  created_at: string
}

export function useDashboardActivity() {
  const { get } = useApi()
  const items = ref<ActivityLogItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async (limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<{ items: ActivityLogItem[] }>('/api/v1/dashboard/activity', { params: { limit } })
      items.value = response.data.items
    } catch (err: any) {
      // Non-admin/non-scoped roles get a 403 here (creators have no activity feed) — treat as empty, not an error banner.
      if (err.response?.status !== 403) {
        error.value = err.response?.data?.detail || 'Failed to fetch activity'
        console.error('Failed to fetch dashboard activity:', err)
      }
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetch }
}
