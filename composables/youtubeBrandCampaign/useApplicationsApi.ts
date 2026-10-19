import { useApi } from '~/composables/useApi'
import { useCampaignsStore } from '~/stores/youtubeBrandCampaign/campaigns'
import type { ApplicationStatus, CampaignApplication, EligibilityAssessment } from '~/mocks/fixtures/applications'

/**
 * Creator Applications — real API composable (release-plan-20260915-youtube-brand-campaign-r3-applications-creator-portal.md).
 * Mirrors the conventions of `useCampaignsApi.ts`.
 *
 * The backend (`atlas-platform-core`, migrations 20260915000001/2 and
 * `app/api/v1/campaign_applications.py`) uses raw column/response names that
 * differ from the `CampaignApplication` / `EligibilityAssessment` fixture
 * shapes this app's components are written against: `handle` (not
 * `creator_handle`), a single `proposed_rates` JSONB (not separate
 * `rate_shorts`/`rate_longform`), `gmv_potential` (not
 * `gmv_potential_rating`), a `{items,total,page,page_size}` envelope on list,
 * `{note}` on decisions (not `{decision_note}`), and no `campaign_name`
 * column at all. This file is the single seam that maps between the two: all
 * wire I/O is typed as `*Wire` below and converted via `toRecord`/
 * `toEligibility` before anything else in the app sees it, so a future
 * backend contract change only touches this file.
 *
 * `campaign_name` has no backend source on the applications endpoints — it is
 * best-effort filled from `useCampaignsStore().byId()` (populated wherever
 * the campaigns list/detail has already been loaded) and falls back to an
 * empty string when that cache is cold.
 */

export type ApplicationRecord = CampaignApplication

export interface SubmitApplicationInput {
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
}

interface ApplicationWire {
  id: string
  campaign_id: string
  organization_id: string
  creator_user_id: string | null
  status: ApplicationStatus
  creator_name: string
  channel_url: string
  handle: string | null
  compensation_type: 'rate_card' | 'sample_only'
  proposed_rates: { shorts?: string | number | null; longform?: string | number | null; currency?: string | null } | null
  pricing_snapshot: Record<string, any> | null
  message: string | null
  submitted_at: string
  decided_at: string | null
  decided_by: string | null
  decision_note: string | null
}

interface EligibilityWire {
  id: string
  application_id: string
  status: 'processing' | 'completed' | 'failed'
  verdict: 'eligible' | 'needs_review' | 'not_eligible' | null
  fit_score: number | null
  fit_score_version: string | null
  brand_safe: boolean | null
  gmv_potential: string | null
  commerce_ready: boolean | null
  summary: string | null
  sources: string[]
  error_message: string | null
  created_at: string
  completed_at: string | null
}

interface PaginatedWire {
  items: ApplicationWire[]
  total: number
  page: number
  page_size: number
}

function toEligibility(e: EligibilityWire | null): EligibilityAssessment | null {
  if (!e) return null
  return {
    status: e.status,
    verdict: e.verdict,
    fit_score: e.fit_score,
    gmv_potential_rating: e.gmv_potential,
    summary: e.summary,
  }
}

function toRecord(a: ApplicationWire, fallbackCampaignName?: string): CampaignApplication {
  const cachedName = useCampaignsStore().byId(a.campaign_id)?.name
  return {
    id: a.id,
    campaign_id: a.campaign_id,
    campaign_name: cachedName ?? fallbackCampaignName ?? '',
    creator_name: a.creator_name,
    creator_handle: a.handle ?? '',
    channel_url: a.channel_url,
    // PII (email/whatsapp) is intentionally excluded from every API response
    // (agency queue and creator's own list alike) — never populated here.
    whatsapp: null,
    email: null,
    compensation_type: a.compensation_type,
    rate_shorts: a.proposed_rates?.shorts == null ? null : Number(a.proposed_rates.shorts),
    rate_longform: a.proposed_rates?.longform == null ? null : Number(a.proposed_rates.longform),
    rate_currency: a.proposed_rates?.currency ?? null,
    pricing_snapshot: a.pricing_snapshot,
    message: a.message,
    status: a.status,
    submitted_at: a.submitted_at,
    eligibility: null,
  }
}

export function useApplicationsApi() {
  const { get, post } = useApi()

  async function submit(input: SubmitApplicationInput): Promise<ApplicationRecord> {
    const { data } = await post<ApplicationWire>('/api/v1/campaign-applications', {
      campaign_id: input.campaign_id,
      creator_name: input.creator_name,
      handle: input.creator_handle || undefined,
      channel_url: input.channel_url,
      email: input.email || undefined,
      whatsapp: input.whatsapp || undefined,
      compensation_type: input.compensation_type,
      proposed_rates:
        input.compensation_type === 'rate_card'
          ? { shorts: input.rate_shorts == null ? null : String(input.rate_shorts), longform: input.rate_longform == null ? null : String(input.rate_longform), currency: input.rate_currency }
          : undefined,
      message: input.message || undefined,
    })
    return toRecord(data, input.campaign_name)
  }

  /** Role-branched server-side: agency gets the org-scoped queue, creator gets their own rows. */
  async function list(): Promise<ApplicationRecord[]> {
    const { data } = await get<PaginatedWire>('/api/v1/campaign-applications', { params: { page_size: 100 } })
    return data.items.map((a) => toRecord(a))
  }

  async function approve(id: string, decisionNote?: string): Promise<ApplicationRecord> {
    const { data } = await post<ApplicationWire>(
      `/api/v1/campaign-applications/${id}/approve`,
      decisionNote ? { note: decisionNote } : undefined,
    )
    return toRecord(data)
  }

  async function reject(id: string, decisionNote?: string): Promise<ApplicationRecord> {
    const { data } = await post<ApplicationWire>(
      `/api/v1/campaign-applications/${id}/reject`,
      decisionNote ? { note: decisionNote } : undefined,
    )
    return toRecord(data)
  }

  async function withdraw(id: string): Promise<ApplicationRecord> {
    const { data } = await post<ApplicationWire>(`/api/v1/campaign-applications/${id}/withdraw`)
    return toRecord(data)
  }

  /** Triggers the async Gemini-backed eligibility assessment. Returns the newly created (processing) assessment. */
  async function triggerEligibility(id: string): Promise<EligibilityAssessment> {
    const { data } = await post<EligibilityWire>(`/api/v1/campaign-applications/${id}/eligibility`)
    return toEligibility(data) as EligibilityAssessment
  }

  /** Latest assessment status/result — poll this until `status !== 'processing'`. */
  async function getEligibility(id: string): Promise<EligibilityAssessment | null> {
    const { data } = await get<EligibilityWire | null>(`/api/v1/campaign-applications/${id}/eligibility`)
    return toEligibility(data)
  }

  return { submit, list, approve, reject, withdraw, triggerEligibility, getEligibility }
}

export type { ApplicationStatus, EligibilityAssessment }
