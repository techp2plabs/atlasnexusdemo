import type { PaginatedContractsResponse } from '~/composables/useContracts'

/**
 * Lightweight count of contracts expiring within 60 days (server-side filter).
 * Uses page_size=1 and reads `total` from the paginated contracts response.
 */
export function useExpiringContractsCount() {
    const { get } = useApi()
    const total = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchExpiringCount = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await get<PaginatedContractsResponse>('/api/v1/contracts', {
                params: {
                    expiring_soon: true,
                    page: 1,
                    page_size: 1,
                },
            })
            const data = response.data
            if (data && typeof data.total === 'number') {
                total.value = data.total
            } else {
                total.value = 0
            }
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { detail?: string } } }
            if (e.response?.status === 403 || e.response?.status === 404) {
                total.value = 0
            } else {
                console.warn('Failed to fetch expiring contracts count:', err)
                error.value = e.response?.data?.detail || 'Failed to load expiring contracts count'
                total.value = 0
            }
        } finally {
            loading.value = false
        }
    }

    return {
        total,
        loading,
        error,
        fetchExpiringCount,
    }
}
