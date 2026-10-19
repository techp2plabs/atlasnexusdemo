import { useApi } from '~/composables/useApi'
import type { Organization } from '~/types/organization'

export interface OrganizationCreate {
  brand_name: string
  name: string
  logo_url?: string
  address?: string
  tax_id?: string
  city?: string
  nation?: string
  bank_account?: string
  bank_account_number?: string
  bank_account_name?: string
}

export interface OrganizationUpdate {
  brand_name?: string
  name?: string
  logo_url?: string
  address?: string
  tax_id?: string
  city?: string
  nation?: string
  bank_account?: string
  bank_account_number?: string
  bank_account_name?: string
}

export interface OrganizationFilters {
  brand_name?: string
  name?: string
  owner_email?: string
  page?: number
  page_size?: number
}

export interface PaginatedOrganizationsResponse {
  items: Organization[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useOrganizations() {
  const { get, post, put } = useApi()
  const organizations = ref<Organization[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  const fetchOrganizations = async (filters?: OrganizationFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      if (filters?.brand_name) params.brand_name = filters.brand_name
      if (filters?.name) params.name = filters.name
      if (filters?.owner_email) params.owner_email = filters.owner_email
      if (filters?.page) params.page = filters.page
      if (filters?.page_size) params.page_size = filters.page_size

      const response = await get<PaginatedOrganizationsResponse>('/api/v1/organizations', { params })
      // Axios wraps the response in .data property
      const data = response.data
      
      if (data && data.items) {
        organizations.value = data.items
        pagination.value = {
          total: data.total,
          page: data.page,
          page_size: data.page_size,
          total_pages: data.total_pages
        }
      } else if (Array.isArray(data)) {
        // Fallback for backward compatibility if API returns array
        organizations.value = data
        pagination.value = {
          total: data.length,
          page: 1,
          page_size: data.length,
          total_pages: 1
        }
      } else {
        console.warn('Unexpected response format:', typeof data, data)
        organizations.value = []
        pagination.value = {
          total: 0,
          page: 1,
          page_size: 10,
          total_pages: 0
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch organizations'
      organizations.value = []
      pagination.value = {
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0
      }
      console.error('Failed to fetch organizations:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchOrganization = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<Organization>(`/api/v1/organizations/${id}`)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Organization not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have access to this organization'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch organization'
      }
      console.error('Failed to fetch organization:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createOrganization = async (data: OrganizationCreate) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<Organization>('/api/v1/organizations', data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 403) {
        error.value = 'You don\'t have permission to create organizations'
      } else {
        error.value = err.response?.data?.detail || 'Failed to create organization'
      }
      console.error('Failed to create organization:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOrganization = async (id: string, data: OrganizationUpdate) => {
    loading.value = true
    error.value = null
    try {
      const response = await put<Organization>(`/api/v1/organizations/${id}`, data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Organization not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to update this organization'
      } else {
        error.value = err.response?.data?.detail || 'Failed to update organization'
      }
      console.error('Failed to update organization:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadOrganizationLogo = async (orgId: string, file: File) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await post<Organization>(
        `/api/v1/organizations/${orgId}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Organization not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to update this organization'
      } else if (statusCode === 400) {
        error.value = err.response?.data?.detail || 'Invalid file. Please upload an image file (JPEG, PNG, or WebP) less than 5MB.'
      } else {
        error.value = err.response?.data?.detail || 'Failed to upload logo'
      }
      console.error('Failed to upload logo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = async (filters?: OrganizationFilters) => {
    await fetchOrganizations(filters)
  }

  return {
    organizations,
    loading,
    error,
    pagination,
    fetchOrganizations,
    fetchOrganization,
    createOrganization,
    updateOrganization,
    uploadOrganizationLogo,
    refresh,
  }
}

