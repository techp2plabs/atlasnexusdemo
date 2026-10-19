import { useApi } from '~/composables/useApi'
import type { YouTubeChannel, ChannelCreate, ChannelUpdate, ChannelStats } from '~/types/channel'

export interface ChannelFilters {
  organization_id?: string
  mcn_id?: string
  creator_user_id?: string
  title?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export interface PaginatedChannelsResponse {
  items: YouTubeChannel[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useChannels() {
  const { get, post, put, delete: del } = useApi()
  const channels = ref<YouTubeChannel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  const fetchChannels = async (filters?: ChannelFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      if (filters?.organization_id) {
        params.organization_id = filters.organization_id
      }
      if (filters?.mcn_id) {
        params.mcn_id = filters.mcn_id
      }
      if (filters?.creator_user_id) {
        params.creator_user_id = filters.creator_user_id
      }
      if (filters?.title) {
        params.title = filters.title
      }
      if (filters?.sort_by) {
        params.sort_by = filters.sort_by
      }
      if (filters?.sort_dir) {
        params.sort_dir = filters.sort_dir
      }
      params.page = filters?.page || 1
      params.page_size = filters?.page_size || 10

      const response = await get<PaginatedChannelsResponse>('/api/v1/channels', { params })
      const data = response.data

      if (data && data.items) {
        channels.value = data.items
        pagination.value = {
          total: data.total,
          page: data.page,
          page_size: data.page_size,
          total_pages: data.total_pages
        }
      } else if (Array.isArray(data)) {
        // Fallback for backward compatibility if API returns array
        channels.value = data
        pagination.value = {
          total: data.length,
          page: 1,
          page_size: data.length,
          total_pages: 1
        }
      } else {
        console.warn('Unexpected response format:', typeof data, data)
        channels.value = []
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
        error.value = 'You don\'t have permission to view channels'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch channels'
      }
      channels.value = []
      pagination.value = {
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0
      }
      console.error('Failed to fetch channels:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchChannel = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await get<YouTubeChannel>(`/api/v1/channels/${id}`)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Channel not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have access to this channel'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch channel'
      }
      console.error('Failed to fetch channel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createChannel = async (data: ChannelCreate) => {
    loading.value = true
    error.value = null
    try {
      const response = await post<YouTubeChannel>('/api/v1/channels', data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 403) {
        error.value = 'You don\'t have permission to create channels'
      } else if (statusCode === 409) {
        error.value = 'A channel with this ID already exists'
      } else {
        error.value = err.response?.data?.detail || 'Failed to create channel'
      }
      console.error('Failed to create channel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateChannel = async (id: string, data: ChannelUpdate) => {
    loading.value = true
    error.value = null
    try {
      const response = await put<YouTubeChannel>(`/api/v1/channels/${id}`, data)
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Channel not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to update this channel'
      } else {
        error.value = err.response?.data?.detail || 'Failed to update channel'
      }
      console.error('Failed to update channel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refresh = async (filters?: ChannelFilters) => {
    await fetchChannels(filters)
  }

  const deleteChannel = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await del(`/api/v1/channels/${id}`)
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Channel not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have permission to delete this channel'
      } else {
        error.value = err.response?.data?.detail || 'Failed to delete channel'
      }
      console.error('Failed to delete channel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchChannelStats = async (id: string, refresh: boolean = false): Promise<ChannelStats> => {
    loading.value = true
    error.value = null
    try {
      const response = await get<ChannelStats>(`/api/v1/channels/${id}/stats`, {
        params: { refresh }
      })
      return response.data
    } catch (err: any) {
      const statusCode = err.response?.status
      if (statusCode === 404) {
        error.value = 'Channel not found'
      } else if (statusCode === 403) {
        error.value = 'You don\'t have access to this channel'
      } else {
        error.value = err.response?.data?.detail || 'Failed to fetch channel stats'
      }
      console.error('Failed to fetch channel stats:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    channels,
    loading,
    error,
    pagination,
    fetchChannels,
    fetchChannel,
    createChannel,
    updateChannel,
    deleteChannel,
    fetchChannelStats,
    refresh,
  }
}

