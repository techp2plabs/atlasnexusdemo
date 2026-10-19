import { defineStore } from 'pinia'
import { applications as seedApplications, type CampaignApplication } from '~/mocks/fixtures/applications'
import { useNotificationsStore } from '~/stores/youtubeBrandCampaign/notifications'
import { useApplicationsApi } from '~/composables/youtubeBrandCampaign/useApplicationsApi'

interface ApplicationsState {
  applications: CampaignApplication[]
  loading: boolean
  loaded: boolean
}

const ELIGIBILITY_POLL_MS = 5000

/**
 * Real-API-backed store for Creator Applications (release-plan-09 §8.3,
 * swapped to `/api/v1/campaign-applications` per release-plan-03 §B.2 and
 * release-plan-20260915-youtube-brand-campaign-r3-applications-creator-portal.md).
 * Backs `useApplications()`. Public action signatures are unchanged from the
 * mock-data version so no consuming component needed to change.
 */
export const useApplicationsStore = defineStore('ybc_applications', {
  state: (): ApplicationsState => ({
    applications: seedApplications,
    loading: false,
    loaded: false,
  }),

  persist: {
    key: 'ybc_mock_applications',
  },

  getters: {
    byId: (state) => (id: string) => state.applications.find((a) => a.id === id) ?? null,
    forCreatorHandle: (state) => (handle: string) => state.applications.filter((a) => a.creator_handle === handle),
  },

  actions: {
    /** Loads the role-branched queue/list from the real API. Safe to call repeatedly (e.g. on page mount). */
    async fetchList() {
      this.loading = true
      try {
        this.applications = await useApplicationsApi().list()
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async submit(input: {
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
      const application = await useApplicationsApi().submit(input)
      this.applications.unshift(application)
      useNotificationsStore().push({
        audience: 'agency',
        type: 'application_submitted',
        message: `${input.creator_name} applied to ${input.campaign_name}.`,
        link: '/app/youtube-brand-campaign/campaign-applications',
      })
      return application
    },

    async approve(id: string) {
      const updated = await useApplicationsApi().approve(id)
      const idx = this.applications.findIndex((a) => a.id === id)
      if (idx >= 0) this.applications[idx] = updated
      useNotificationsStore().push({
        audience: 'creator',
        type: 'application_approved',
        message: `Your application to ${updated.campaign_name} was approved. Run eligibility analysis to join the roster.`,
        link: '/app/youtube-brand-campaign/campaign-applications',
      })
    },

    async reject(id: string) {
      const updated = await useApplicationsApi().reject(id)
      const idx = this.applications.findIndex((a) => a.id === id)
      if (idx >= 0) this.applications[idx] = updated
      useNotificationsStore().push({
        audience: 'creator',
        type: 'application_rejected',
        message: `Your application to ${updated.campaign_name} was not approved this time.`,
        link: '/app/youtube-brand-campaign/campaign-applications',
      })
    },

    async withdraw(id: string) {
      const updated = await useApplicationsApi().withdraw(id)
      const idx = this.applications.findIndex((a) => a.id === id)
      if (idx >= 0) this.applications[idx] = updated
      return updated
    },

    /**
     * Triggers the real Gemini-backed eligibility assessment (doc10 §9), then
     * polls `GET .../eligibility` every ELIGIBILITY_POLL_MS until it resolves —
     * same poll-and-notify shape as `useInsightJobTracker.ts` (interval poll,
     * stop once status leaves `processing`, toast/notification on settle).
     * That tracker itself isn't reused directly: it's hard-wired to the
     * `campaign`/`channel` report-insight endpoints and shapes, so a bespoke
     * poll loop here — following the same pattern — is the closer fit than
     * bending a 2-kind singleton into a 3rd, differently-shaped kind.
     */
    async runEligibilityAnalysis(id: string) {
      const app = this.applications.find((a) => a.id === id)
      if (!app || app.status !== 'approved') return

      const api = useApplicationsApi()
      app.status = 'under_analysis'
      app.eligibility = { status: 'processing', verdict: null, fit_score: null, gmv_potential_rating: null, summary: null }

      try {
        const triggered = await api.triggerEligibility(id)
        const current = this.applications.find((a) => a.id === id)
        if (current) current.eligibility = triggered
      } catch {
        const current = this.applications.find((a) => a.id === id)
        if (current) {
          current.status = 'approved'
          current.eligibility = null
        }
        return
      }

      const poll = async () => {
        const current = this.applications.find((a) => a.id === id)
        if (!current || current.status !== 'under_analysis') return
        try {
          const result = await api.getEligibility(id)
          if (!result || result.status === 'processing') {
            setTimeout(poll, ELIGIBILITY_POLL_MS)
            return
          }
          current.eligibility = result
          current.status = result.verdict ?? current.status
          useNotificationsStore().push({
            audience: 'creator',
            type: 'eligibility_ready',
            message: `Your eligibility analysis for ${current.campaign_name} is ready — ${
              result.verdict === 'eligible' ? 'Eligible' : result.verdict === 'needs_review' ? 'Needs review' : 'Not eligible'
            }.`,
            link: '/app/youtube-brand-campaign/campaign-applications',
          })
        } catch {
          // transient network error — retry on the next tick
          setTimeout(poll, ELIGIBILITY_POLL_MS)
        }
      }
      setTimeout(poll, ELIGIBILITY_POLL_MS)
    },

    reset() {
      this.applications = seedApplications
      this.loaded = false
    },
  },
})
