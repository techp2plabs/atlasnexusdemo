import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export interface ContractSummary {
  id: string
  contract_number?: string | null
  revenue_share_pct: number
  start_date: string
  end_date?: string | null
  effective_date?: string | null
}

export interface ContractGroups {
  active: ContractSummary[]
  future: ContractSummary[]
  expired: ContractSummary[]
  contracts_truncated?: boolean
}

export interface EdgeCounts {
  active: number
  future: number
  expired: number
}

export interface OrgNode {
  id: string
  name: string
}

export interface McnNode {
  id: string
  name: string
  organization_id: string
}

export interface ChannelNode {
  id: string
  title: string
  youtube_channel_id: string
  mcn_id: string
}

export interface PlatformToOrgEdge {
  organization_id: string
  counts: EdgeCounts
  contracts: ContractGroups
}

export interface OrgToMcnEdge {
  organization_id: string
  mcn_id: string
  counts: EdgeCounts
  contracts: ContractGroups
}

export interface McnToChannelEdge {
  mcn_id: string
  channel_id: string
  counts: EdgeCounts
  contracts: ContractGroups
}

export interface ContractTreeResponse {
  nodes: {
    organizations: OrgNode[]
    mcns: McnNode[]
    channels: ChannelNode[]
  }
  edges: {
    platform_to_org: PlatformToOrgEdge[]
    org_to_mcn: OrgToMcnEdge[]
    mcn_to_channel: McnToChannelEdge[]
  }
}

export function useContractTree() {
  const { get } = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTree = async (params?: { organization_id?: string; mcn_id?: string }) => {
    loading.value = true
    error.value = null
    try {
      const res = await get<ContractTreeResponse>('/api/v1/contracts/tree', { params })
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load contract tree'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchTree }
}

