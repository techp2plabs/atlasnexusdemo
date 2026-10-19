import { useApi } from '~/composables/useApi'
import type { User, UserVerifyRequest, UserUpdate, UserCreate, UserCreateResult } from '~/types/user'

export interface UserFilters {
  role?: string
  organization_id?: string
  mcn_id?: string
  status?: string
  creator_channel_state?: 'linked' | 'unlinked'
  name?: string
  email?: string
  page?: number
  page_size?: number
}

export interface PaginatedUsersResponse {
  items: User[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useUsers() {
  const { get, post, put, patch } = useApi()
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  const fetchUsers = async (filters?: UserFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      
      // Add search parameters
      if (filters?.name) params.name = filters.name
      if (filters?.email) params.email = filters.email
      
      // Add filter parameters
      if (filters?.organization_id && filters.organization_id !== 'all') {
        params.organization_id = filters.organization_id
      }
      if (filters?.mcn_id && filters.mcn_id !== 'all') {
        params.mcn_id = filters.mcn_id
      }
      
      if (filters?.status && filters.status !== 'all') params.status = filters.status
      if (filters?.role && filters.role !== 'all') params.role = filters.role
      if (filters?.creator_channel_state) params.creator_channel_state = filters.creator_channel_state

      // Add pagination
      params.page = filters?.page || 1
      params.page_size = filters?.page_size || 10

      const response = await get<PaginatedUsersResponse>('/api/v1/users', { params })
      const data = response.data

      if (data && data.items) {
        const lastPage = Math.max(1, data.total_pages)
        if (params.page > lastPage) {
          await fetchUsers({ ...filters, page: lastPage })
          return
        }
        users.value = data.items
        pagination.value = {
          total: data.total,
          page: data.page,
          page_size: data.page_size,
          total_pages: data.total_pages
        }
      } else if (Array.isArray(data)) {
        // Fallback for backward compatibility
        let filteredUsers = data

        // Client-side filtering
        if (filters) {
          if (filters.role && filters.role !== 'all') {
            filteredUsers = filteredUsers.filter((u) => u.role === filters.role)
          }
          if (filters.organization_id && filters.organization_id !== 'all') {
            filteredUsers = filteredUsers.filter((u) => u.organization_id === filters.organization_id)
          }
          if (filters.mcn_id && filters.mcn_id !== 'all') {
            filteredUsers = filteredUsers.filter((u) => u.mcn_id === filters.mcn_id)
          }
          if (filters.status && filters.status !== 'all') {
            filteredUsers = filteredUsers.filter((u) => u.status === filters.status)
          }
        }

        users.value = filteredUsers
        pagination.value = {
          total: filteredUsers.length,
          page: 1,
          page_size: filteredUsers.length,
          total_pages: 1
        }
      } else {
        console.warn('Unexpected response format:', typeof data, data)
        users.value = []
        pagination.value = {
          total: 0,
          page: 1,
          page_size: 10,
          total_pages: 0
        }
      }
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 403) {
        error.value = 'You don\'t have permission to view users'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch users'
      }
      users.value = []
      pagination.value = {
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0
      }
      console.error('Failed to fetch users:', err)
    } finally {
      loading.value = false
    }
  }

  const verifyUser = async (userId: string, status: UserVerifyRequest['status']) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<{ id: string; status: string; message: string }>(
        `/api/v1/users/${userId}/verify`,
        { status }
      )
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'User not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to verify this user'
      } else {
        error.value = err.response?.data?.detail || 'Failed to verify user'
      }
      console.error('Failed to verify user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUserById = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<User>(`/api/v1/users/${userId}`)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'User not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to view this user'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch user detail'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetUserPassword = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<{ message: string }>(`/api/v1/users/${userId}/reset-password`)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'User not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to reset this user password'
      } else {
        error.value = err.response?.data?.detail || 'Failed to send reset email'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await patch<User>(`/api/v1/users/${userId}/role`, { role })
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 403) {
        error.value = err.response?.data?.detail || "You don't have permission to change this user's role"
      } else if (statusCode === 400) {
        error.value = err.response?.data?.detail || 'Invalid role'
      } else {
        error.value = err.response?.data?.detail || 'Failed to update user role'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data: UserCreate) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<UserCreateResult>('/api/v1/users', data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 400) {
        error.value = err.response?.data?.detail || 'Invalid user data'
      } else if (statusCode === 403) {
        error.value = "You don't have permission to create a user with this role or scope"
      } else if (statusCode === 404) {
        error.value = 'Organization or MCN not found'
      } else {
        error.value = err.response?.data?.detail || 'Failed to create user'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAssignableRoles = async (): Promise<string[]> => {
    try {
      const response = await get<{ roles: string[] }>('/api/v1/users/assignable-roles')
      return response.data?.roles ?? []
    } catch {
      return []
    }
  }

  const updateUser = async (userId: string, data: UserUpdate) => {
    loading.value = true
    error.value = null
    try {
      if (data.status) {
        const response = await post<{ id: string; status: string; message: string }>(
          `/api/v1/users/${userId}/verify`,
          { status: data.status }
        )
        await fetchUsers()
        return response.data
      }
      if (data.role) {
        return await updateUserRole(userId, data.role)
      }
      throw new Error('No supported update field provided')
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'User not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to update this user'
      } else {
        error.value = err.response?.data?.detail || 'Failed to update user'
      }
      console.error('Failed to update user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId: string) => {
    // Soft delete by setting status to inactive
    return await updateUser(userId, { status: 'inactive' })
  }

  const refresh = async (filters?: UserFilters) => {
    await fetchUsers(filters)
  }

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    verifyUser,
    fetchUserById,
    resetUserPassword,
    updateUser,
    updateUserRole,
    fetchAssignableRoles,
    deleteUser,
    refresh,
  }
}

