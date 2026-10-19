import { useApi } from '~/composables/useApi'
import type { MCN, MCNPartnerType } from '~/types/mcn'

export interface MCNCreate {
  organization_id: string
  name: string
  partner_type: MCNPartnerType
  alias?: string
  description?: string
  website_url?: string
  pic_contact_name?: string
  pic_contact_email?: string
  pic_contact_phone?: string
  address?: string
  city?: string
  country?: string
  tax_id?: string
  director?: string
  director_id_file_url?: string
  international_company_name?: string
  tax_id_file_url?: string
  bank_name?: string
  bank_account_name?: string
  bank_swift_code?: string
  bank_address?: string
  bank_country?: string
  bank_branch?: string
  bank_account_number?: string
  pic_partner_name?: string
  pic_partner_phone?: string
  pic_partner_email?: string
  pic_legal_name?: string
  pic_legal_phone?: string
  pic_legal_email?: string
}

export interface MCNUpdate {
  name?: string
  partner_type?: MCNPartnerType
  alias?: string
  description?: string
  website_url?: string
  pic_contact_name?: string
  pic_contact_email?: string
  pic_contact_phone?: string
  address?: string
  city?: string
  country?: string
  tax_id?: string
  director?: string
  director_id_file_url?: string
  international_company_name?: string
  tax_id_file_url?: string
  bank_name?: string
  bank_account_name?: string
  bank_swift_code?: string
  bank_address?: string
  bank_country?: string
  bank_branch?: string
  bank_account_number?: string
  pic_partner_name?: string
  pic_partner_phone?: string
  pic_partner_email?: string
  pic_legal_name?: string
  pic_legal_phone?: string
  pic_legal_email?: string
}

export const getPartnerTypeLabel = (type: MCNPartnerType): string => {
  const labels = {
    inhouse: 'InHouse',
    agency: 'Agency',
    talent_management: 'Talent Management'
  }
  return labels[type] || type
}

export interface MCNFilters {
  organization_id?: string
  name?: string
  alias?: string
  page?: number
  page_size?: number
}

export interface PaginatedMCNsResponse {
  items: MCN[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useMcns() {
  const { get, post, put } = useApi()
  const mcns = ref<MCN[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  const fetchMcns = async (filters?: MCNFilters | string | null) => {
    loading.value = true
    error.value = null
    try {
      // Handle backward compatibility: if filters is a string, treat it as organizationId
      let params: Record<string, string | number> = {}

      if (typeof filters === 'string' || filters === null || filters === undefined) {
        // Legacy mode: filters is organizationId
        const organizationId = filters
        const invalidValues: (string | null | undefined)[] = [null, undefined, '', 'null', 'None', 'All Organizations']
        const orgId = organizationId &&
          typeof organizationId === 'string' &&
          organizationId.trim() &&
          !invalidValues.includes(organizationId.trim())
          ? organizationId.trim()
          : undefined
        if (orgId) {
          params.organization_id = orgId
        }
        params.page = 1
        params.page_size = 10
      } else {
        // New mode: filters is an object
        const invalidValues: (string | null | undefined)[] = [null, undefined, '', 'null', 'None', 'All Organizations']
        const orgId = filters.organization_id &&
          typeof filters.organization_id === 'string' &&
          filters.organization_id.trim() &&
          !invalidValues.includes(filters.organization_id.trim())
          ? filters.organization_id.trim()
          : undefined
        if (orgId) {
          params.organization_id = orgId
        }
        if (filters.name) params.name = filters.name
        if (filters.alias) params.alias = filters.alias
        params.page = filters.page || 1
        params.page_size = filters.page_size || 10
      }

      const response = await get<PaginatedMCNsResponse>('/api/v1/mcns', { params })

      // Axios wraps the response in .data property
      let data = (response as any).data

      // Handle case where response might be the data directly
      if (!data && (response as any).items) {
        data = response
      }

      if (data && data.items && Array.isArray(data.items)) {
        mcns.value = data.items
        pagination.value = {
          total: data.total,
          page: data.page,
          page_size: data.page_size,
          total_pages: data.total_pages
        }
      } else if (Array.isArray(data)) {
        // Fallback for backward compatibility if API returns array
        mcns.value = data
        pagination.value = {
          total: data.length,
          page: 1,
          page_size: data.length,
          total_pages: 1
        }
      } else {
        console.warn('Unexpected response format:', typeof data, data)
        mcns.value = []
        pagination.value = {
          total: 0,
          page: 1,
          page_size: 10,
          total_pages: 0
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch MCNs'
      mcns.value = []
      pagination.value = {
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0
      }
      console.error('Failed to fetch MCNs:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchMcn = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<MCN>(`/api/v1/mcns/${id}`)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'MCN not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have access to this MCN'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch MCN'
      }
      console.error('Failed to fetch MCN:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMcn = async (data: MCNCreate) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<MCN>('/api/v1/mcns', data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      const errorDetail = err.response?.data?.detail || ''

      // Provide more specific error messages
      if (statusCode === 400) {
        // Bad request - validation errors
        if (typeof errorDetail === 'string') {
          if (errorDetail.toLowerCase().includes('content owner id')) {
            error.value = 'Content Owner ID validation failed. Please check the field.'
          } else if (errorDetail.toLowerCase().includes('partner type')) {
            error.value = 'Invalid partner type selected.'
          } else if (errorDetail.toLowerCase().includes('organization')) {
            error.value = 'Invalid organization selected.'
          } else {
            error.value = errorDetail
          }
        } else {
          error.value = 'Validation failed. Please check all fields.'
        }
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to create MCN Partners'
      } else if (statusCode === 404) {
        error.value = 'Organization not found'
      } else if (statusCode === 422) {
        error.value = 'Invalid data provided. Please check all fields.'
      } else {
        error.value = typeof errorDetail === 'string' ? errorDetail : 'Failed to create MCN Partner'
      }

      console.error('Failed to create MCN:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMcn = async (id: string, data: MCNUpdate) => {
    loading.value = true
    error.value = null
    try {
      const response = await put<MCN>(`/api/v1/mcns/${id}`, data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      const errorDetail = err.response?.data?.detail || ''

      // Provide more specific error messages
      if (statusCode === 400) {
        // Bad request - validation errors
        if (typeof errorDetail === 'string') {
          if (errorDetail.toLowerCase().includes('content owner id')) {
            error.value = 'Content Owner ID validation failed. Please check the field.'
          } else if (errorDetail.toLowerCase().includes('partner type')) {
            error.value = 'Invalid partner type selected.'
          } else {
            error.value = errorDetail
          }
        } else {
          error.value = 'Validation failed. Please check all fields.'
        }
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to update this MCN Partner'
      } else if (statusCode === 404) {
        error.value = 'MCN Partner not found'
      } else if (statusCode === 422) {
        error.value = 'Invalid data provided. Please check all fields.'
      } else {
        error.value = typeof errorDetail === 'string' ? errorDetail : 'Failed to update MCN Partner'
      }

      console.error('Failed to update MCN:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadMcnDocument = async (id: string, type: 'director_id' | 'tax_id', file: File) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await post<MCN>(
        `/api/v1/mcns/${id}/documents/${type}`,
        formData,
        {
          headers: {
            // Let the browser set the correct multipart boundary
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to upload document'
      console.error('Failed to upload MCN document:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = async (filters?: MCNFilters | string) => {
    await fetchMcns(filters)
  }

  return {
    mcns,
    loading,
    error,
    pagination,
    fetchMcns,
    fetchMcn,
    createMcn,
    updateMcn,
    uploadMcnDocument,
    refresh,
  }
}

