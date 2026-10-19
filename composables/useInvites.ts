import { useApi } from '~/composables/useApi'
import type { Invite, InviteAdmin, InviteCreate, InviteFilters, PaginatedInvitesResponse } from '~/types/invite'

export function useInvites() {
  const { get, post } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const invites = ref<InviteAdmin[]>([])
  const inviteDetail = ref<InviteAdmin | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  })

  const createInvite = async (data: InviteCreate) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<Invite>('/api/v1/invites', data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 400) {
        error.value = err.response?.data?.detail || 'Invalid invitation data'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to send this invitation'
      } else if (statusCode === 404) {
        error.value = 'Organization or MCN not found'
      } else {
        error.value = err.response?.data?.detail || 'Failed to send invitation'
      }
      console.error('Failed to create invitation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchInvites = async (filters?: InviteFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      if (filters?.organization_id && filters.organization_id !== 'all') {
        params.organization_id = filters.organization_id
      }
      if (filters?.mcn_id && filters.mcn_id !== 'all') {
        params.mcn_id = filters.mcn_id
      }
      if (filters?.email?.trim()) {
        params.email = filters.email.trim()
      }
      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status
      }
      params.page = filters?.page ?? 1
      params.page_size = filters?.page_size ?? 10

      const response = await get<PaginatedInvitesResponse>('/api/v1/invites', { params })
      const data = response.data
      invites.value = data.items ?? []
      pagination.value = {
        total: data.total,
        page: data.page,
        page_size: data.page_size,
        total_pages: data.total_pages,
      }
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load invitations'
      console.error('Failed to fetch invitations:', err)
      invites.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchInviteById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<InviteAdmin>(`/api/v1/invites/admin/${id}`)
      inviteDetail.value = response.data
      return response.data
    } catch (err: any) {
      inviteDetail.value = null
      error.value = err.response?.data?.detail || 'Failed to load invitation'
      console.error('Failed to fetch invitation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resendInvite = async (id: string) => {
    error.value = null
    try {
      const response = await post<InviteAdmin>(`/api/v1/invites/admin/${id}/resend`, {})
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 400) {
        error.value = err.response?.data?.detail || 'Cannot resend this invitation'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to resend this invitation'
      } else {
        error.value = err.response?.data?.detail || 'Failed to resend invitation'
      }
      console.error('Failed to resend invitation:', err)
      throw err
    }
  }

  return {
    loading,
    error,
    invites,
    inviteDetail,
    pagination,
    createInvite,
    fetchInvites,
    fetchInviteById,
    resendInvite,
  }
}
