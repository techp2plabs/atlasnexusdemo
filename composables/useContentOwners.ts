import { useApi } from '~/composables/useApi'
import type { ContentOwner, ContentOwnerCreate, ContentOwnerUpdate } from '~/types/content-owner'

export interface ContentOwnerFilters {
  organization_id?: string
  is_active?: boolean
}

export function useContentOwners() {
  const { get, post, patch, del } = useApi()
  const contentOwners = ref<ContentOwner[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchContentOwners = async (filters?: ContentOwnerFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | boolean> = {}
      if (filters?.organization_id) params.organization_id = filters.organization_id
      if (filters?.is_active !== undefined) params.is_active = filters.is_active

      const response = await get<ContentOwner[]>('/api/v1/content-owners', { params })
      contentOwners.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch content owners'
      contentOwners.value = []
      console.error('Failed to fetch content owners:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchContentOwner = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<ContentOwner>(`/api/v1/content-owners/${id}`)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Content owner not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have access to this content owner'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch content owner'
      }
      console.error('Failed to fetch content owner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createContentOwner = async (data: ContentOwnerCreate) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<ContentOwner>('/api/v1/content-owners', data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 403) {
        error.value = 'You don\'t have permission to create content owners'
      } else if (statusCode === 400) {
        error.value = err.response?.data?.detail || 'Invalid content owner data'
      } else {
        error.value = err.response?.data?.detail || 'Failed to create content owner'
      }
      console.error('Failed to create content owner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateContentOwner = async (id: string, data: ContentOwnerUpdate) => {
    loading.value = true
    error.value = null
    try {
      const response = await patch<ContentOwner>(`/api/v1/content-owners/${id}`, data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Content owner not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to update this content owner'
      } else {
        error.value = err.response?.data?.detail || 'Failed to update content owner'
      }
      console.error('Failed to update content owner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteContentOwner = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await del(`/api/v1/content-owners/${id}`)
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Content owner not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to delete this content owner'
      } else {
        error.value = err.response?.data?.detail || 'Failed to delete content owner'
      }
      console.error('Failed to delete content owner:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    contentOwners,
    loading,
    error,
    fetchContentOwners,
    fetchContentOwner,
    createContentOwner,
    updateContentOwner,
    deleteContentOwner,
  }
}

