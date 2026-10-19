import axios from 'axios'
import type { ChannelOut, ChannelProfilingAggregates } from '~/composables/useChannelProfiling'

export interface PublicChannelProfiling {
  id: string
  name: string
  description: string | null
  status: string
  channels: ChannelOut[]
  aggregates: ChannelProfilingAggregates
}

let publicClient: ReturnType<typeof axios.create> | null = null

function getClient() {
  if (!publicClient) {
    const config = useRuntimeConfig()
    publicClient = axios.create({ baseURL: config.public.apiBaseUrl })
  }
  return publicClient
}

export function usePublicChannelProfiling() {
  const verifyCode = async (profilingId: string, code: string): Promise<string> => {
    const res = await getClient().post<{ access_token: string }>(
      `/api/v1/tools/youtube-channel-profiling/${profilingId}/public/verify`,
      { code },
    )
    return res.data.access_token
  }

  const fetchPublicProfiling = async (profilingId: string, token: string): Promise<PublicChannelProfiling> => {
    const res = await getClient().get<PublicChannelProfiling>(
      `/api/v1/tools/youtube-channel-profiling/${profilingId}/public`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return res.data
  }

  return { verifyCode, fetchPublicProfiling }
}
