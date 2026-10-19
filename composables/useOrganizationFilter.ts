import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

export interface Organization {
  id: string
  name: string
  owner_email: string
  status: string
}

// Global state - shared across all components
const selectedOrganizationId = ref<string | null>(null)
const organizations = ref<Organization[]>([])
const loading = ref(false)

export function useOrganizationFilter() {
  const authStore = useAuthStore()

  const isSuperadmin = computed(() => authStore.user?.role === 'atlas_superadmin')

  const selectedOrganization = computed(() => {
    if (!selectedOrganizationId.value) return null
    return organizations.value.find(org => org.id === selectedOrganizationId.value) || null
  })

  const fetchOrganizations = async () => {
    if (!isSuperadmin.value) return

    loading.value = true
    try {
      const { get } = useApi()
      const response = await get('/api/v1/organizations', {
        params: {
          page: 1,
          page_size: 100
        }
      })
      // Handle paginated response
      if (response.data && response.data.items) {
        organizations.value = response.data.items
      } else if (Array.isArray(response.data)) {
        // Fallback for backward compatibility
        organizations.value = response.data
      } else {
        organizations.value = []
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
      organizations.value = []
    } finally {
      loading.value = false
    }
  }

  const setSelectedOrganization = (orgId: string | null) => {
    selectedOrganizationId.value = orgId
  }

  const clearSelection = () => {
    selectedOrganizationId.value = null
  }

  return {
    selectedOrganizationId,
    selectedOrganization,
    organizations,
    loading,
    isSuperadmin,
    fetchOrganizations,
    setSelectedOrganization,
    clearSelection,
  }
}
