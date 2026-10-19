import { useApi } from '~/composables/useApi'

export interface CreatorSuitesToolCount {
  tool_slug: string
  tool_name: string
  total: number
  processing: number
  failed: number
  completed_last_7d: number
}

export interface CreatorSuitesRecentReport {
  id: string
  tool_slug: string
  tool_name: string
  title: string
  status: string
  created_at: string
  thumbnail_url?: string | null
}

export interface CreatorSuitesSummaryData {
  tools: CreatorSuitesToolCount[]
  recent_reports: CreatorSuitesRecentReport[]
}

export function useCreatorSuitesSummary() {
  const { get } = useApi()
  const data = ref<CreatorSuitesSummaryData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await get<CreatorSuitesSummaryData>('/api/v1/dashboard/creator-suites-summary')
      data.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch Creator Suites summary'
      console.error('Failed to fetch Creator Suites summary:', err)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
