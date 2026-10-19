import { useApi } from '~/composables/useApi'
import type { DashboardStats } from '~/types/dashboard'

export function useDashboard() {
    const { get } = useApi()
    const stats = ref<DashboardStats | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchStats = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await get<DashboardStats>('/api/v1/dashboard/stats')
            stats.value = response.data
        } catch (err: any) {
            error.value = err.response?.data?.detail || 'Failed to fetch dashboard stats'
            console.error('Failed to fetch dashboard stats:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        stats,
        loading,
        error,
        fetchStats,
    }
}
