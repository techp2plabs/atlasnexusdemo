import type { IntakePayload, OnboardingConfig, OnboardingEventKey } from '~/types/onboarding'

export function useOnboarding() {
  const { get, post } = useApi()
  const config = useState<OnboardingConfig | null>('onboarding-config', () => null)

  async function loadConfig() {
    const response = await get<OnboardingConfig>('/api/v1/public/onboarding-config')
    config.value = response.data
    return response.data
  }

  function anonymousId() {
    if (!import.meta.client) return ''
    const key = 'atlas-onboarding-visitor-id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }

  async function track(event_key: OnboardingEventKey, persona?: 'creator' | 'agency' | 'brand', source?: string) {
    if (!import.meta.client) return
    try { await post('/api/v1/public/onboarding-events', { event_key, anonymous_id: anonymousId(), persona, source }) }
    catch { /* Funnel analytics must never block an onboarding action. */ }
  }

  async function submitAgency(payload: IntakePayload & { company_name: string; request_type: string }) {
    return post('/api/v1/public/agency-access-requests', payload)
  }

  async function submitBrand(payload: IntakePayload & { brand_name: string }) {
    return post('/api/v1/public/brand-waitlist', payload)
  }

  return { config, loadConfig, submitAgency, submitBrand, anonymousId, track }
}
