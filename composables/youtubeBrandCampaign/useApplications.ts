import { useApplicationsStore } from '~/stores/youtubeBrandCampaign/applications'

/**
 * Composable seam for Creator Applications (release-plan-09 §8.1, §7.4).
 * Backed by `/api/v1/campaign-applications` per release-plan-03 §B.2 and
 * release-plan-20260915-youtube-brand-campaign-r3-applications-creator-portal.md
 * (role=creator branches onto the same endpoints per doc09/doc07 — the
 * `/creator-portal/*` router in doc03 is superseded and not used here).
 */
export function useApplications() {
  const store = useApplicationsStore()

  function ensureLoaded() {
    if (!store.loaded && !store.loading) store.fetchList()
  }

  function listForAgency() {
    ensureLoaded()
    return store.applications
  }

  /**
   * `GET /api/v1/campaign-applications` is role-branched server-side, so for a
   * creator caller `store.applications` already *is* "my applications" — no
   * client-side handle filter needed (unlike the old mock store, which had no
   * real creator<->application identity link and had to fake it).
   */
  function listForCreator(_handle: string) {
    ensureLoaded()
    return store.applications
  }

  function get(id: string) {
    return store.byId(id)
  }

  function approve(id: string) {
    return store.approve(id)
  }

  function reject(id: string) {
    return store.reject(id)
  }

  function withdraw(id: string) {
    return store.withdraw(id)
  }

  function submit(input: {
    campaign_id: string
    campaign_name: string
    creator_name: string
    creator_handle: string
    channel_url: string
    whatsapp: string | null
    email: string | null
    compensation_type: 'rate_card' | 'sample_only'
    rate_shorts: number | null
    rate_longform: number | null
    rate_currency: string | null
    message: string | null
  }) {
    return store.submit(input)
  }

  function runEligibilityAnalysis(id: string) {
    return store.runEligibilityAnalysis(id)
  }

  return { listForAgency, listForCreator, get, approve, reject, withdraw, submit, runEligibilityAnalysis, store }
}
