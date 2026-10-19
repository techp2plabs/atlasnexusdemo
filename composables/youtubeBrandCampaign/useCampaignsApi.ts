import { useApi } from '~/composables/useApi'

/**
 * Campaign Core — real API composable (agency role only).
 * See release-plan-20260911-youtube-brand-campaign-r2-campaign-core-v1.md §5.
 *
 * The creator-role branch of these pages stays on the mock store
 * (composables/youtubeBrandCampaign/useCampaigns.ts) — that rendering belongs to
 * R3 (Applications & Portal), not this plan.
 */

export interface Completeness {
  percentage: number
  missing: string[]
}

export interface CampaignRecord {
  id: string
  organization_id: string
  organization_name?: string | null
  mcn_name?: string | null
  mcn_id: string | null
  name: string
  brand_name: string
  status: 'draft' | 'open' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived'
  currency: string
  usd_pricing_snapshot: Record<string, any> | null
  total_budget: number | null
  investment_mix: 'creator' | 'ads' | 'hybrid'
  creator_budget: number | null
  ads_budget: number | null
  target_roi: number | null
  start_date: string | null
  end_date: string | null
  duration_days: number | null
  region: string | null
  launched_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  completeness: Completeness
  roster_count: number
  product_count: number
  /** R4: tracked/pending posted-video counts, feeding the Running tab's visibility gate. */
  tracked_video_count: number
  pending_video_count: number
  /** Amount planned spend exceeds the total budget by, or null when within budget. */
  budget_overrun: number | null
  /** True when inputs moved since the last saved forecast — launch is gated on this. */
  forecast_stale: boolean
  /** Phase 1 operational campaign code (minted at launch; null on drafts). */
  campaign_code: string | null
  /** Brand's native YouTube code, when supplied out-of-band (never minted). */
  external_campaign_code: string | null
  campaign_code_version: number
}

/**
 * Creator-role response variant of `GET /api/v1/campaigns/{id}` (R3 — see
 * release-plan-20260915-youtube-brand-campaign-r3-applications-creator-portal.md).
 * Backed by the `campaigns.brief` JSONB column (`{summary, highlights[],
 * requirements[], payout_model, deliverable_mix, commerce_model}` — see
 * atlas-platform-core migration 20260911000001_create_campaigns.sql) rather
 * than the agency-only forecasting/roster fields on `CampaignRecord`.
 */
export interface CampaignBrief {
  summary: string | null
  highlights: string[]
  requirements: string[]
  payout_model: string | null
  deliverable_mix: string | null
  commerce_model: string | null
}

export interface CreatorCampaignRecord {
  id: string
  name: string
  brand_name: string
  status: CampaignRecord['status']
  currency: string
  total_budget: number | null
  investment_mix: 'creator' | 'ads' | 'hybrid'
  target_roi: number | null
  start_date: string | null
  end_date: string | null
  brief: CampaignBrief | null
}

export interface PaginatedCampaigns {
  items: CampaignRecord[]
  total: number
  page: number
  page_size: number
}

export interface CampaignProductRecord {
  id: string
  name: string
  sku: string | null
  product_url: string | null
  image_url: string | null
  price: number | null
  position: number
}

export interface RosterRecord {
  id: string
  creator_profile_id: string
  creator_name: string
  status: string
  source: 'discovery' | 'application'
  package: { shorts?: number; longform?: number }
  planned_cost: number
  rate_card_snapshot: Record<string, any> | null
  pricing_snapshot: Record<string, any> | null
  added_at: string
}

export interface ForecastRecord {
  id: string
  version: number
  is_baseline: boolean
  inputs: Record<string, any>
  assumptions: Record<string, any>
  outputs: {
    views: { organic: number; paid: number; total: number }
    engagement_rate: number
    gmv: number | null
    roi: number | null
    roas: number | null
    cce: number | null
    unavailable_reason: string | null
  }
  engine_version: string
  created_at: string
}

export interface VideoRecord {
  id: string
  campaign_creator_id: string
  /** Null on pending_upload intents (Phase 1). */
  video_url: string | null
  /** Null on pending_upload intents (Phase 1). */
  video_id: string | null
  /** Null on pending_upload intents (Phase 1). */
  format: 'shorts' | 'longform' | null
  has_product_tag: boolean
  status: 'pending_upload' | 'pending_verification' | 'tracked' | 'rejected' | 'removed'
  metadata_status: 'pending' | 'resolved' | 'failed'
  metadata_error: string | null
  /** Operational code the row was registered with, if any (Phase 1). */
  campaign_code_used: string | null
  code_issuance_id: string | null
  title: string | null
  duration_seconds: number | null
  published_at: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
}

/** Phase 1: per-creator issuance of a campaign's operational code. */
export interface CodeIssuanceRecord {
  id: string
  campaign_creator_id: string | null
  creator_name: string
  channel_id: string | null
  channel_url: string | null
  handle: string | null
  status: 'issued' | 'consumed' | 'revoked' | 'expired'
  /** Client-side usability (issued + not expired). */
  usable: boolean
  expires_at: string | null
  consumed_by_video_id: string | null
  created_at: string
}

/** Phase 1: creator-authenticated `GET /campaigns/{id}/my-code`. */
export interface MyCodeRecord {
  campaign_id: string
  campaign_name: string
  brand_name: string
  campaign_code: string | null
  external_campaign_code: string | null
  issuance: CodeIssuanceRecord
  instructions_id: string[]
  instructions_en: string[]
}

export interface MonitoringMetric {
  forecast: number | null
  actual: number | null
  delta_pct: number | null
  unavailable_reason?: string | null
}

export interface MonitoringSummary {
  campaign: {
    id: string
    status: string
    brand_name: string
    investment_mix: string
    start_date: string | null
    end_date: string | null
    total_budget: number | null
    target_roi: number | null
    creator_count: number
    live_video_count: number
  }
  funnel: 'combined' | 'organic' | 'paid'
  has_baseline_forecast: boolean
  forecast_vs_actual: {
    views: MonitoringMetric
    engagement_rate: MonitoringMetric
    net_gmv: MonitoringMetric
    roi: MonitoringMetric
  } | null
  kpis: {
    views: number | null
    engagement_rate: number | null
    net_gmv: number | null
    net_gmv_unavailable_reason?: string | null
    roi_unavailable_reason?: string | null
    note?: string | null
    unavailable_reason?: string | null
  }
  trend: { date: string; views: number }[]
  by_creator: {
    campaign_creator_id: string; creator_profile_id: string; video_count: number
    views: number; gmv: number | null; orders: number | null; gmv_unavailable_reason: string | null
  }[]
  by_video: {
    id: string; campaign_creator_id: string; title: string | null; format: string; has_product_tag: boolean
    views: number; engagement_rate: number; gmv: number | null; orders: number | null
    gmv_unavailable_reason: string | null; cce: number | null
  }[]
}

export interface MonitoringInsightRecord {
  id: string
  funnel: string
  status: 'processing' | 'completed' | 'failed'
  model: string | null
  insight_text: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface CommerceImportRecord {
  id: string
  file_name: string
  status: 'processing' | 'completed' | 'failed' | 'reverted'
  rows_total: number
  rows_imported: number
  rows_skipped: number
  errors: { line: number | null; reason: string }[]
  created_at: string
  reverted_at: string | null
}

export interface ActivityEventRecord {
  id: string
  entity_type: string
  entity_id: string | null
  event_type: string
  from_status: string | null
  to_status: string | null
  actor_user_id: string | null
  meta: Record<string, any>
  created_at: string
}

export function useCampaignsApi() {
  const { get, post, patch, delete: del } = useApi()

  async function list(status?: string, page = 1, pageSize = 20): Promise<PaginatedCampaigns> {
    const params: Record<string, string | number> = { page, page_size: pageSize }
    if (status && status !== 'all') params.status = status
    const { data } = await get<PaginatedCampaigns>('/api/v1/campaigns', { params })
    return data
  }

  async function get_(id: string): Promise<CampaignRecord> {
    const { data } = await get<CampaignRecord>(`/api/v1/campaigns/${id}`)
    return data
  }

  /** Creator-role variant of the same endpoint — see `CreatorCampaignRecord`. */
  async function getForCreator(id: string): Promise<CreatorCampaignRecord> {
    const { data } = await get<CreatorCampaignRecord>(`/api/v1/campaigns/${id}`)
    return data
  }

  async function create(payload: {
    name: string
    brand_name: string
    currency?: string
    total_budget?: number
    start_date?: string
    end_date?: string
    organization_id?: string
    mcn_id?: string
    external_campaign_code?: string
  }): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>('/api/v1/campaigns', payload)
    return data
  }

  // atlas_admin/atlas_superadmin have no organization of their own — they must pick
  // one to create a campaign under. Returns [] for every other role.
  async function listOrganizationsForCreate(): Promise<{ id: string; name: string; brand_name: string }[]> {
    const { data } = await get<{ id: string; name: string; brand_name: string }[]>('/api/v1/campaigns/meta/organizations')
    return data
  }

  async function update(id: string, payload: Partial<{
    name: string; brand_name: string; currency: string; total_budget: number; investment_mix: string;
    target_roi: number; start_date: string; end_date: string; region: string;
    external_campaign_code: string
  }>): Promise<CampaignRecord> {
    const { data } = await patch<CampaignRecord>(`/api/v1/campaigns/${id}`, payload)
    return data
  }

  async function listProducts(campaignId: string): Promise<CampaignProductRecord[]> {
    const { data } = await get<CampaignProductRecord[]>(`/api/v1/campaigns/${campaignId}/products`)
    return data
  }

  async function addProduct(campaignId: string, payload: { name: string; sku?: string; product_url?: string; image_url?: string; price?: number }): Promise<CampaignProductRecord> {
    const { data } = await post<CampaignProductRecord>(`/api/v1/campaigns/${campaignId}/products`, payload)
    return data
  }

  async function removeProduct(campaignId: string, productId: string): Promise<void> {
    await del(`/api/v1/campaigns/${campaignId}/products/${productId}`)
  }

  async function listRoster(campaignId: string): Promise<RosterRecord[]> {
    const { data } = await get<RosterRecord[]>(`/api/v1/campaigns/${campaignId}/creators`)
    return data
  }

  async function addCreators(campaignId: string, creatorProfileIds: string[]): Promise<RosterRecord[]> {
    const { data } = await post<RosterRecord[]>(`/api/v1/campaigns/${campaignId}/creators`, { creator_profile_ids: creatorProfileIds })
    return data
  }

  async function updateRosterPackage(campaignId: string, rosterId: string, pkg: { shorts?: number; longform?: number }): Promise<RosterRecord> {
    const { data } = await patch<RosterRecord>(`/api/v1/campaigns/${campaignId}/creators/${rosterId}`, { package: pkg })
    return data
  }

  async function removeCreator(campaignId: string, rosterId: string, reason?: string): Promise<void> {
    await del(`/api/v1/campaigns/${campaignId}/creators/${rosterId}`, { params: reason ? { reason } : undefined })
  }

  async function saveForecast(campaignId: string): Promise<ForecastRecord> {
    const { data } = await post<ForecastRecord>(`/api/v1/campaigns/${campaignId}/forecast`)
    return data
  }

  async function getForecast(campaignId: string): Promise<ForecastRecord | null> {
    const { data } = await get<ForecastRecord | null>(`/api/v1/campaigns/${campaignId}/forecast`)
    return data
  }

  async function launch(campaignId: string, toStatus: 'open' | 'active' = 'active', acknowledgeOverrun = false): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>(`/api/v1/campaigns/${campaignId}/launch`, { to_status: toStatus, acknowledge_overrun: acknowledgeOverrun })
    return data
  }

  async function pause(campaignId: string): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>(`/api/v1/campaigns/${campaignId}/pause`)
    return data
  }

  async function resume(campaignId: string): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>(`/api/v1/campaigns/${campaignId}/resume`)
    return data
  }

  async function complete(campaignId: string): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>(`/api/v1/campaigns/${campaignId}/complete`)
    return data
  }

  async function cancel(campaignId: string, reason: string): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>(`/api/v1/campaigns/${campaignId}/cancel`, { reason })
    return data
  }

  async function archive(campaignId: string): Promise<CampaignRecord> {
    const { data } = await post<CampaignRecord>(`/api/v1/campaigns/${campaignId}/archive`)
    return data
  }

  /** Discard a draft (doc 04 §1). Soft delete; refused once the campaign has launched. */
  async function discardDraft(campaignId: string): Promise<void> {
    await del(`/api/v1/campaigns/${campaignId}`)
  }

  async function activity(campaignId: string, page = 1): Promise<ActivityEventRecord[]> {
    const { data } = await get<ActivityEventRecord[]>(`/api/v1/campaigns/${campaignId}/activity`, { params: { page } })
    return data
  }

  // ── Running Campaign: posted videos (R4) ──────────────────────────────────

  async function listVideos(campaignId: string): Promise<VideoRecord[]> {
    const { data } = await get<VideoRecord[]>(`/api/v1/campaigns/${campaignId}/videos`)
    return data
  }

  async function registerVideo(campaignId: string, payload: {
    video_url: string; campaign_creator_id: string; format?: 'shorts' | 'longform'; has_product_tag?: boolean
  }): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/videos`, payload)
    return data
  }

  async function verifyVideo(campaignId: string, videoId: string): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/videos/${videoId}/verify`)
    return data
  }

  async function rejectVideo(campaignId: string, videoId: string, reason?: string): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/videos/${videoId}/reject`, { reason })
    return data
  }

  // ── Campaign codes & pre-upload flow (Phase 1) ────────────────────────────

  async function ensureCode(campaignId: string): Promise<{ campaign_code: string | null; external_campaign_code: string | null; campaign_code_version: number }> {
    const { data } = await post(`/api/v1/campaigns/${campaignId}/code`)
    return data
  }

  async function regenerateCode(campaignId: string): Promise<{ campaign_code: string | null; external_campaign_code: string | null; campaign_code_version: number }> {
    const { data } = await post(`/api/v1/campaigns/${campaignId}/code/regenerate`)
    return data
  }

  async function listIssuances(campaignId: string): Promise<CodeIssuanceRecord[]> {
    const { data } = await get<CodeIssuanceRecord[]>(`/api/v1/campaigns/${campaignId}/code/issuances`)
    return data
  }

  async function issueCode(campaignId: string, payload: {
    creator_name: string; channel_url?: string; handle?: string; channel_id?: string; expires_at?: string
  }): Promise<CodeIssuanceRecord> {
    const { data } = await post<CodeIssuanceRecord>(`/api/v1/campaigns/${campaignId}/code/issuances`, payload)
    return data
  }

  async function revokeIssuance(campaignId: string, issuanceId: string): Promise<CodeIssuanceRecord> {
    const { data } = await post<CodeIssuanceRecord>(`/api/v1/campaigns/${campaignId}/code/issuances/${issuanceId}/revoke`)
    return data
  }

  async function resolveCode(campaignId: string, code: string): Promise<{ campaign_id: string; campaign_name: string; brand_name: string; live_issuances: number }> {
    const { data } = await get(`/api/v1/campaigns/${campaignId}/code/resolve`, { params: { code } })
    return data
  }

  async function registerVideoByCode(payload: {
    campaign_code: string; video_url: string; campaign_creator_id?: string; format?: 'shorts' | 'longform'; has_product_tag?: boolean
  }): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>('/api/v1/campaigns/videos/by-code', payload)
    return data
  }

  async function createUploadIntent(campaignId: string, campaignCreatorId: string): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/videos/intents`, { campaign_creator_id: campaignCreatorId })
    return data
  }

  async function attachUpload(campaignId: string, videoId: string, videoUrl: string): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/videos/${videoId}/attach-upload`, { video_url: videoUrl })
    return data
  }

  // ── Creator self-service (Phase 1 §4.3.3 C2–C4) ───────────────────────────

  async function myCode(campaignId: string): Promise<MyCodeRecord> {
    const { data } = await get<MyCodeRecord>(`/api/v1/campaigns/${campaignId}/my-code`)
    return data
  }

  async function listMyVideos(campaignId: string): Promise<VideoRecord[]> {
    const { data } = await get<VideoRecord[]>(`/api/v1/campaigns/${campaignId}/my-videos`)
    return data
  }

  async function submitMyVideo(campaignId: string, payload: { video_url: string; format?: 'shorts' | 'longform' }): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/my-videos`, payload)
    return data
  }

  async function createMyIntent(campaignId: string): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/my-videos/intents`)
    return data
  }

  async function attachMyUpload(campaignId: string, videoId: string, videoUrl: string): Promise<VideoRecord> {
    const { data } = await post<VideoRecord>(`/api/v1/campaigns/${campaignId}/my-videos/${videoId}/attach-upload`, { video_url: videoUrl })
    return data
  }

  // ── Monitoring & Reporting (R5) ───────────────────────────────────────────

  async function getMonitoring(campaignId: string, funnel: 'combined' | 'organic' | 'paid' = 'combined'): Promise<MonitoringSummary> {
    const { data } = await get<MonitoringSummary>(`/api/v1/campaigns/${campaignId}/monitoring`, { params: { funnel } })
    return data
  }

  async function getMonitoringInsight(campaignId: string, funnel: 'combined' | 'organic' | 'paid' = 'combined'): Promise<MonitoringInsightRecord | null> {
    const { data } = await get<MonitoringInsightRecord | null>(`/api/v1/campaigns/${campaignId}/monitoring/insight`, { params: { funnel } })
    return data
  }

  async function generateMonitoringInsight(campaignId: string, funnel: 'combined' | 'organic' | 'paid' = 'combined'): Promise<MonitoringInsightRecord> {
    const { data } = await post<MonitoringInsightRecord>(`/api/v1/campaigns/${campaignId}/monitoring/insight`, null, { params: { funnel } })
    return data
  }

  /** Agency self-service refresh — syncs only this campaign's tracked videos.
   * Rate-limited server-side (429 with a "try again in Ns" message on cooldown).
   */
  async function refreshMonitoringStats(campaignId: string): Promise<{ id: string; status: string; videos_total: number; videos_ok: number; videos_failed: number }> {
    const { data } = await post(`/api/v1/campaigns/${campaignId}/monitoring/sync`)
    return data
  }

  // ── Commerce import (R5, doc 00 Q-6) ──────────────────────────────────────

  async function listCommerceImports(campaignId: string): Promise<CommerceImportRecord[]> {
    const { data } = await get<CommerceImportRecord[]>(`/api/v1/campaigns/${campaignId}/commerce/imports`)
    return data
  }

  async function uploadCommerceImport(campaignId: string, file: File): Promise<CommerceImportRecord> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await post<CommerceImportRecord>(`/api/v1/campaigns/${campaignId}/commerce/imports`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  async function revertCommerceImport(campaignId: string, importId: string): Promise<CommerceImportRecord> {
    const { data } = await post<CommerceImportRecord>(`/api/v1/campaigns/${campaignId}/commerce/imports/${importId}/revert`)
    return data
  }

  return {
    list, get: get_, getForCreator, create, update, listOrganizationsForCreate,
    listProducts, addProduct, removeProduct,
    listRoster, addCreators, updateRosterPackage, removeCreator,
    saveForecast, getForecast,
    launch, pause, resume, complete, cancel, archive, discardDraft,
    activity,
    listVideos, registerVideo, verifyVideo, rejectVideo,
    ensureCode, regenerateCode, listIssuances, issueCode, revokeIssuance, resolveCode,
    registerVideoByCode, createUploadIntent, attachUpload,
    myCode, listMyVideos, submitMyVideo, createMyIntent, attachMyUpload,
    getMonitoring, getMonitoringInsight, generateMonitoringInsight, refreshMonitoringStats,
    listCommerceImports, uploadCommerceImport, revertCommerceImport,
  }
}
