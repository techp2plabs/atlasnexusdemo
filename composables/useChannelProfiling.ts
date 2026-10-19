export interface ChannelProfilingCreate {
  name: string
  description?: string | null
}

export interface ChannelProfilingUpdate {
  name: string
  description?: string | null
}

export interface ChannelProfilingImport {
  channel_urls: string[]
}

export interface ChannelOut {
  id: string
  channel_id: string
  title: string | null
  description: string | null
  custom_url: string | null
  thumbnail_url: string | null
  country: string | null
  published_at: string | null
  subscriber_count: number | null
  hidden_subscriber_count: boolean
  view_count: number | null
  video_count: number | null
  topics: string[]
  keywords: string[]
  source_url: string | null
  fetched_at: string | null
}

export interface ChannelProfilingAggregates {
  channel_count: number
  total_subscribers: number
  total_views: number
  total_videos: number
}

export interface ChannelProfilingOut {
  id: string
  name: string
  description: string | null
  status: string
  error_message: string | null
  channels: ChannelOut[]
  failed_urls: { url: string; reason: string }[]
  aggregates: ChannelProfilingAggregates
  created_at: string
  updated_at: string
  owner_email: string | null
  deleted_at: string | null
}

export interface ChannelProfilingListItem {
  id: string
  name: string
  description: string | null
  status: string
  channel_count: number
  created_at: string
  updated_at: string
  owner_email: string | null
  deleted_at: string | null
}

export interface PaginatedProfilings {
  items: ChannelProfilingListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ShareStatus {
  is_shared: boolean
  public_url: string | null
}

export interface ShareGenerateResult {
  is_shared: boolean
  public_url: string
  code: string
}

export function useChannelProfiling() {
  const { get, post, patch, delete: del } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const createProfiling = async (input: ChannelProfilingCreate): Promise<ChannelProfilingOut> => {
    loading.value = true
    error.value = null
    try {
      const res = await post<ChannelProfilingOut>('/api/v1/tools/youtube-channel-profiling', input)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to create profiling project'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchProfilings = async (
    page = 1,
    pageSize = 20,
    status: 'active' | 'archived' = 'active',
    q?: string
  ): Promise<PaginatedProfilings> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<PaginatedProfilings>('/api/v1/tools/youtube-channel-profiling', {
        params: { page, page_size: pageSize, status, ...(q ? { q } : {}) },
      })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to load profiling projects'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchProfiling = async (id: string): Promise<ChannelProfilingOut> => {
    const res = await get<ChannelProfilingOut>(`/api/v1/tools/youtube-channel-profiling/${id}`)
    return res.data
  }

  const updateProfiling = async (id: string, input: ChannelProfilingUpdate): Promise<ChannelProfilingOut> => {
    loading.value = true
    error.value = null
    try {
      const res = await patch<ChannelProfilingOut>(`/api/v1/tools/youtube-channel-profiling/${id}`, input)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to update profiling project'
      throw e
    } finally {
      loading.value = false
    }
  }

  const importChannels = async (id: string, channelUrls: string[]): Promise<ChannelProfilingOut> => {
    const res = await post<ChannelProfilingOut>(`/api/v1/tools/youtube-channel-profiling/${id}/import`, {
      channel_urls: channelUrls,
    })
    return res.data
  }

  const removeChannel = async (profilingId: string, channelId: string): Promise<ChannelProfilingOut> => {
    const res = await del<ChannelProfilingOut>(
      `/api/v1/tools/youtube-channel-profiling/${profilingId}/channels/${channelId}`
    )
    return res.data
  }

  const refreshChannel = async (profilingId: string, channelId: string): Promise<ChannelOut> => {
    const res = await post<ChannelOut>(
      `/api/v1/tools/youtube-channel-profiling/${profilingId}/channels/${channelId}/refresh`,
      {}
    )
    return res.data
  }

  const downloadExcel = async (id: string, name: string): Promise<void> => {
    const response = await get<Blob>(`/api/v1/tools/youtube-channel-profiling/${id}/download`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `channel-profiling-${name.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteProfiling = async (id: string): Promise<void> => {
    await del(`/api/v1/tools/youtube-channel-profiling/${id}`)
  }

  const restoreProfiling = async (id: string): Promise<ChannelProfilingOut> => {
    const res = await post<ChannelProfilingOut>(`/api/v1/tools/youtube-channel-profiling/${id}/restore`, {})
    return res.data
  }

  const getShareStatus = async (id: string): Promise<ShareStatus> => {
    const res = await get<ShareStatus>(`/api/v1/tools/youtube-channel-profiling/${id}/share`)
    return res.data
  }

  const generateShare = async (id: string): Promise<ShareGenerateResult> => {
    const res = await post<ShareGenerateResult>(`/api/v1/tools/youtube-channel-profiling/${id}/share`)
    return res.data
  }

  const disableShare = async (id: string): Promise<ShareStatus> => {
    const res = await del<ShareStatus>(`/api/v1/tools/youtube-channel-profiling/${id}/share`)
    return res.data
  }

  return {
    loading,
    error,
    createProfiling,
    fetchProfilings,
    fetchProfiling,
    updateProfiling,
    importChannels,
    removeChannel,
    refreshChannel,
    downloadExcel,
    deleteProfiling,
    restoreProfiling,
    getShareStatus,
    generateShare,
    disableShare,
  }
}
