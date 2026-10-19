import { useApi } from '~/composables/useApi'

export interface EffectiveScopeEntity {
  id: string
  label: string
}

export interface EffectiveScopeResponse {
  organizations: EffectiveScopeEntity[]
  mcns: EffectiveScopeEntity[]
  channels: EffectiveScopeEntity[]
  has_any: { organization: boolean; mcn: boolean; channel: boolean }
  is_platform_admin: boolean
}

type ScopeKind = 'organization' | 'mcn' | 'channel'

const cached = ref<EffectiveScopeResponse | null>(null)
const fetching = ref<Promise<EffectiveScopeResponse | null> | null>(null)

export function useEffectiveScope() {
  const { get } = useApi()

  const load = async (force = false): Promise<EffectiveScopeResponse | null> => {
    if (cached.value && !force) return cached.value
    if (fetching.value) return fetching.value
    fetching.value = (async () => {
      try {
        const res = await get<EffectiveScopeResponse>('/api/v1/auth/me/effective-scope')
        cached.value = res.data
        return res.data
      } catch {
        return null
      } finally {
        fetching.value = null
      }
    })()
    return fetching.value
  }

  const reset = () => {
    cached.value = null
  }

  const hasAnyScopeFor = (kind: ScopeKind): boolean => {
    if (!cached.value) return true // fail open until loaded; server still authoritative
    if (cached.value.is_platform_admin) return true
    return Boolean(cached.value.has_any?.[kind])
  }

  return { effectiveScope: cached, load, reset, hasAnyScopeFor }
}
