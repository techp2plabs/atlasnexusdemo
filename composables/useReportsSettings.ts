import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export interface RevenueSettingsResponse {
  mcn_id: string
  revenue_report_profile: string
  owner_type?: string
}

export interface DiscoveredReportTypeRow {
  report_type_id: string
  name?: string | null
  is_system_managed?: boolean | null
  fetched_at?: string | null
}

export interface DiscoveredTypesResponse {
  owner_type: string
  splittable_report_types: string[]
  fetch_scope_youtube_report_type_ids?: string[] | null
  items: DiscoveredReportTypeRow[]
}

export interface RollupChannelRow {
  id: string
  mcn_id: string
  youtube_channel_id: string
}

export function useReportsSettings() {
  const { get, patch, post, delete: del } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRevenueSettings = async (mcnId: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await get<RevenueSettingsResponse>(`/api/v1/mcns/${mcnId}/revenue-settings`)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load revenue settings'
      throw e
    } finally {
      loading.value = false
    }
  }

  const saveRevenueProfile = async (mcnId: string, revenue_report_profile: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await patch<RevenueSettingsResponse>(`/api/v1/mcns/${mcnId}/revenue-settings`, {
        revenue_report_profile,
      })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to save settings'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchDiscoveredTypes = async (mcnId: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await get<DiscoveredTypesResponse>('/api/v1/reports/revenue/discovered-types', {
        params: { mcn_id: mcnId },
      })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load discovered types'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchRollupChannels = async (mcnId: string) => {
    const res = await get<RollupChannelRow[]>(`/api/v1/mcns/${mcnId}/revenue-rollup-channels`)
    return res.data
  }

  const addRollupChannel = async (mcnId: string, youtube_channel_id: string) => {
    const res = await post<RollupChannelRow>(`/api/v1/mcns/${mcnId}/revenue-rollup-channels`, {
      youtube_channel_id,
    })
    return res.data
  }

  const removeRollupChannel = async (mcnId: string, youtube_channel_id: string) => {
    await del(`/api/v1/mcns/${mcnId}/revenue-rollup-channels`, {
      params: { youtube_channel_id },
    })
  }

  return {
    loading,
    error,
    fetchRevenueSettings,
    saveRevenueProfile,
    fetchDiscoveredTypes,
    fetchRollupChannels,
    addRollupChannel,
    removeRollupChannel,
  }
}
