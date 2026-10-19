import axios from 'axios'
import type { ReportData } from '~/composables/useChannelReport'
import type { InsightData, NewInsightData } from '~/composables/useChannelReportInsight'

export interface PublicChannelReport {
  id: string
  brand_name: string | null
  campaign_name: string
  period_start: string | null
  period_end: string | null
  status: string
  report_data: ReportData | null
  // Executive Insight only (Comments Insight isn't surfaced on the public share
  // view) — may be either schema depending on when it was generated; see
  // useChannelReportInsight.ts's NewInsightData/InsightData for the split.
  insight: InsightData | NewInsightData | null
}

let publicClient: ReturnType<typeof axios.create> | null = null

function getClient() {
  if (!publicClient) {
    const config = useRuntimeConfig()
    publicClient = axios.create({ baseURL: config.public.apiBaseUrl })
  }
  return publicClient
}

export function usePublicChannelReport() {
  const verifyCode = async (reportId: string, code: string): Promise<string> => {
    const res = await getClient().post<{ access_token: string }>(
      `/api/v1/tools/youtube-channel-report/${reportId}/public/verify`,
      { code },
    )
    return res.data.access_token
  }

  const fetchPublicReport = async (reportId: string, token: string): Promise<PublicChannelReport> => {
    const res = await getClient().get<PublicChannelReport>(
      `/api/v1/tools/youtube-channel-report/${reportId}/public`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return res.data
  }

  return { verifyCode, fetchPublicReport }
}
