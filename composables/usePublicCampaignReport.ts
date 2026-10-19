import axios from 'axios'
import type { ReportData } from '~/composables/useCampaignReport'
import type { InsightData } from '~/composables/useCampaignReportInsight'

export interface PublicCampaignReport {
  id: string
  brand_name: string | null
  campaign_name: string
  period_start: string | null
  period_end: string | null
  status: string
  report_data: ReportData | null
  insight: InsightData | null
}

let publicClient: ReturnType<typeof axios.create> | null = null

function getClient() {
  if (!publicClient) {
    const config = useRuntimeConfig()
    publicClient = axios.create({ baseURL: config.public.apiBaseUrl })
  }
  return publicClient
}

export function usePublicCampaignReport() {
  const verifyCode = async (reportId: string, code: string): Promise<string> => {
    const res = await getClient().post<{ access_token: string }>(
      `/api/v1/tools/youtube-brand-deal-report/${reportId}/public/verify`,
      { code },
    )
    return res.data.access_token
  }

  const fetchPublicReport = async (reportId: string, token: string): Promise<PublicCampaignReport> => {
    const res = await getClient().get<PublicCampaignReport>(
      `/api/v1/tools/youtube-brand-deal-report/${reportId}/public`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return res.data
  }

  return { verifyCode, fetchPublicReport }
}
