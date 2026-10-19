export interface ToolOrgAccess {
  organization_id: string
  video_url_limit_override: number | null  // null = follow global default; positive int = custom cap
}

export interface AdminTool {
  id: string
  slug: string
  name: string
  description: string | null
  scope: 'global' | 'organization'
  status: 'active' | 'inactive'
  video_url_limit: number
  daily_refresh_limit: number
  roles: string[]
  org_access: ToolOrgAccess[]
  created_at: string
  updated_at: string
}

export interface PaginatedAdminTools {
  items: AdminTool[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useAdminTools() {
  const { get, patch, put } = useApi()

  const fetchTools = async (page = 1, pageSize = 50): Promise<PaginatedAdminTools> => {
    const res = await get<PaginatedAdminTools>(`/api/v1/admin/tools?page=${page}&page_size=${pageSize}`)
    return res.data
  }

  const fetchTool = async (id: string): Promise<AdminTool> => {
    const res = await get<AdminTool>(`/api/v1/admin/tools/${id}`)
    return res.data
  }

  const updateTool = async (
    id: string,
    payload: { name?: string; description?: string; status?: string; scope?: string; video_url_limit?: number; daily_refresh_limit?: number },
  ): Promise<AdminTool> => {
    const res = await patch<AdminTool>(`/api/v1/admin/tools/${id}`, payload)
    return res.data
  }

  const setToolRoles = async (id: string, roles: string[]): Promise<AdminTool> => {
    const res = await put<AdminTool>(`/api/v1/admin/tools/${id}/roles`, { roles })
    return res.data
  }

  const setToolOrganizations = async (id: string, organization_ids: string[]): Promise<AdminTool> => {
    const res = await put<AdminTool>(`/api/v1/admin/tools/${id}/organizations`, { organization_ids })
    return res.data
  }

  const updateToolOrgAccess = async (
    toolId: string,
    orgId: string,
    videoUrlLimitOverride: number | null,
  ): Promise<ToolOrgAccess> => {
    const res = await patch<ToolOrgAccess>(
      `/api/v1/admin/tools/${toolId}/organizations/${orgId}`,
      { video_url_limit_override: videoUrlLimitOverride },
    )
    return res.data
  }

  return { fetchTools, fetchTool, updateTool, setToolRoles, setToolOrganizations, updateToolOrgAccess }
}
