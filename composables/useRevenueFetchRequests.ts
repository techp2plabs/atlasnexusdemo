import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export type RevenueFetchStatus = 'queued' | 'running' | 'succeeded' | 'partial' | 'failed' | 'cancelled'

export interface RevenueFetchRequestCreatePayload {
  organization_id: string
  content_owner_ids: string[]
  channel_ids?: string[] | null
  date_from: string
  date_to: string
}

export interface RevenueFetchRequestCreateResponse {
  status: string
  fetch_request_id: string
}

export interface RevenueFetchRequestRun {
  id: string
  content_owner_id: string
  youtube_content_owner_id: string
  attempt_no: number
  status: RevenueFetchStatus
  date_from: string
  date_to: string
  rows_upserted: number
  report_files_processed: number
  skipped_unmapped_channels: number
  error_count: number
  result: Record<string, any>
  files: Array<Record<string, any>>
  started_at?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RevenueFetchRequestItem {
  id: string
  organization_id: string
  requested_by_user_id: string
  attempt_no: number
  date_from: string
  date_to: string
  status: RevenueFetchStatus
  selection: Record<string, any>
  summary: Record<string, any>
  affected_months: number[]
  error_message?: string | null
  started_at?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RevenueFetchRequestListResponse {
  total: number
  items: RevenueFetchRequestItem[]
}

export interface RevenueFetchRequestDetailResponse extends RevenueFetchRequestItem {
  runs: RevenueFetchRequestRun[]
}

export interface FetchRequestListParams {
  organization_id?: string
  status?: RevenueFetchStatus | ''
  page?: number
  page_size?: number
}

export function useRevenueFetchRequests() {
  const { get, post } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const createFetchRequest = async (payload: RevenueFetchRequestCreatePayload) => {
    loading.value = true
    error.value = null
    try {
      const res = await post<RevenueFetchRequestCreateResponse>('/api/v1/reports/revenue/fetch-requests', payload)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to create fetch request'
      throw e
    } finally {
      loading.value = false
    }
  }

  const listFetchRequests = async (params: FetchRequestListParams) => {
    loading.value = true
    error.value = null
    try {
      const res = await get<RevenueFetchRequestListResponse>('/api/v1/reports/revenue/fetch-requests', { params })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load fetch history'
      throw e
    } finally {
      loading.value = false
    }
  }

  const getFetchRequest = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await get<RevenueFetchRequestDetailResponse>(`/api/v1/reports/revenue/fetch-requests/${id}`)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load fetch request detail'
      throw e
    } finally {
      loading.value = false
    }
  }

  const rerunFetchRequest = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await post<RevenueFetchRequestCreateResponse>(`/api/v1/reports/revenue/fetch-requests/${id}/rerun`, {})
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to re-run fetch request'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createFetchRequest,
    listFetchRequests,
    getFetchRequest,
    rerunFetchRequest,
  }
}

