import { useApi } from '~/composables/useApi'

/**
 * Metric glossary (F-14) and status vocabulary (F-15) registries.
 * See release-plan-20260911-youtube-brand-campaign-r0-foundation-v1.md §4/§5/§10.
 */

export interface MetricDefinition {
  key: string
  label: string
  short_definition: string
  formula: string
  inputs: string[]
  data_source: string
  freshness: string
  is_atlas_derived: boolean
  unit: string | null
  precision: number | null
  availability: 'available' | 'requires_commerce_data' | 'requires_paid_data' | 'unresolved'
  compliance_label: string | null
  unresolved: boolean
}

export interface StatusDefinition {
  entity_kind: string
  value: string
  label: string
  description: string
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'pending'
}

let glossaryCache: MetricDefinition[] | null = null
let statusesCache: StatusDefinition[] | null = null

export function useCampaignMeta() {
  const { get } = useApi()

  async function glossary(): Promise<MetricDefinition[]> {
    if (glossaryCache) return glossaryCache
    const { data } = await get<MetricDefinition[]>('/api/v1/campaigns/meta/glossary')
    glossaryCache = data
    return data
  }

  async function statuses(): Promise<StatusDefinition[]> {
    if (statusesCache) return statusesCache
    const { data } = await get<StatusDefinition[]>('/api/v1/campaigns/meta/statuses')
    statusesCache = data
    return data
  }

  async function metric(key: string): Promise<MetricDefinition | undefined> {
    return (await glossary()).find((m) => m.key === key)
  }

  return { glossary, statuses, metric }
}
