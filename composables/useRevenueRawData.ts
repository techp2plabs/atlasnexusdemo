import { useApi } from '~/composables/useApi'

export interface RawDataReportFile {
  id: string
  report_type: string
  youtube_report_id: string
  storage_path: string
}

export interface RawDataPagination {
  page: number
  page_size: number
  total_rows: number
  total_pages: number
}

export interface RevenueRawDataResponse {
  report_file: RawDataReportFile | null
  columns: string[]
  rows: Record<string, any>[]
  pagination: RawDataPagination
}

export interface RawDataParams {
  month: number
  report_type?: string
  report_file_id?: string
  page?: number
  page_size?: number
  search?: string
}

export function useRevenueRawData() {
  const { get } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRawData = async (
    channelId: string,
    params: RawDataParams
  ): Promise<RevenueRawDataResponse | null> => {
    loading.value = true
    error.value = null
    console.log('[useRevenueRawData] Fetching raw data for channel:', channelId, 'params:', params)
    try {
      const response = await get<RevenueRawDataResponse>(
        `/api/v1/reports/revenue/channel/${channelId}/raw`,
        { params }
      )
      console.log('[useRevenueRawData] Response:', response.data)
      return response.data
    } catch (err: any) {
      console.error('[useRevenueRawData] Error:', err)
      error.value = err.response?.data?.detail || 'Failed to fetch raw data'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchRawData,
  }
}
