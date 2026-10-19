import { useApi } from '~/composables/useApi'
import type {
  RoleAssignmentListResponse,
  RoleAssignmentUser,
  UpsertRoleAssignmentRequest,
} from '~/types/roleAssignment'

export function useRoleAssignments() {
  const { get, post } = useApi()
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const users = ref<RoleAssignmentUser[]>([])

  const fetchRoleAssignments = async (role?: string) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string> = {}
      if (role && role !== 'all') params.role = role
      const response = await get<RoleAssignmentListResponse>('/api/v1/role-assignments', { params })
      users.value = response.data.items || []
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load role assignments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const upsertRoleAssignment = async (payload: UpsertRoleAssignmentRequest) => {
    saving.value = true
    error.value = null
    try {
      const response = await post<RoleAssignmentUser>('/api/v1/role-assignments', payload)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to update role assignment'
      throw err
    } finally {
      saving.value = false
    }
  }

  const fetchRoleAssignmentUser = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<RoleAssignmentUser>(`/api/v1/role-assignments/${userId}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load user assignments'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    saving,
    error,
    users,
    fetchRoleAssignments,
    fetchRoleAssignmentUser,
    upsertRoleAssignment,
  }
}
