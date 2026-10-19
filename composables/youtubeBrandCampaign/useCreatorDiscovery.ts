import { useApi } from '~/composables/useApi'

/**
 * Creator Discovery — real API composable.
 * See release-plan-20260831-youtube-brand-campaign-creator-discovery-v1.md §8.
 */

export interface RateCardEntry {
  min?: number | string | null
  max?: number | string | null
  note?: string | null
}

export interface SocialRatePackage {
  name: string
  price?: string | null
  min?: string | null
  max?: string | null
  note?: string | null
}

export interface SocialRateGroup {
  platform: string
  platform_label?: string | null
  packages?: SocialRatePackage[] | null
}

export interface RateCard {
  currency?: string | null
  currency_verified?: boolean | null
  currency_change_mode?: "keep" | "convert"
  currency_source?: string | null
  shorts?: RateCardEntry | null
  longform?: RateCardEntry | null
  social?: SocialRateGroup[] | null
}

export interface Contact {
  email?: string | null
  whatsapp?: string | null
}

export interface SocialLink {
  platform: string
  platform_label?: string | null
  handle_or_url: string
  note?: string | null
}

export interface PerformanceSummary {
  avg_views_per_video: number | null
  engagement_rate: number | null
  sample_video_count: number
  computed_at: string
  source?: string
  sample_start_at?: string | null
  sample_end_at?: string | null
  sample_window_complete?: boolean
  engagement_sample_video_count?: number
}

export interface CreatorProfile {
  id: string
  organization_id: string | null
  mcn_id: string | null
  source: 'manual_lookup' | 'import' | 'managed_channel' | 'brand_deal_report'
  sources: Array<'manual_lookup' | 'import' | 'managed_channel' | 'brand_deal_report'>
  channel_id: string
  title: string | null
  description: string | null
  custom_url: string | null
  thumbnail_url: string | null
  country: string | null
  subscriber_count: number | null
  view_count: number | null
  video_count: number | null
  topics: string[]
  keywords: string[]
  performance_summary: PerformanceSummary | null
  rate_card: RateCard | null
  rate_card_usd_snapshot: Record<string, any> | null
  contact: Contact | null
  social_links: SocialLink[]
  stats_fetched_at: string | null
  created_at: string
  updated_at: string
}

export interface CreatorLookupPreview {
  channel_id: string
  title: string
  description: string
  custom_url: string
  thumbnail_url: string
  country: string
  subscriber_count: number
  hidden_subscriber_count: boolean
  view_count: number
  video_count: number
  topics: string[]
  keywords: string[]
  channel_published_at?: string | null
}

/**
 * One row of the dedicated Add Creators page's Review & enrich step — a
 * channel already fetched via `lookup()`, carried back to `saveBatch()` with
 * optional enrichment so submit never re-queries YouTube for it. See
 * release-plan-20260922-youtube-brand-campaign-creator-discovery-add-creators-dedicated-page.md §4.2.
 */
export interface PrefetchedChannel extends CreatorLookupPreview {
  contact?: Contact | null
  social_links?: SocialLink[] | null
  rate_card?: RateCard | null
}

export interface CreatorVideo {
  video_id: string
  title: string
  thumbnail_url: string
  published_at: string
  duration: string
  view_count: number
  like_count: number
  comment_count: number
  url: string
}

export interface CreatorNote {
  id: string
  body: string
  author_user_id: string
  author_display_name: string
  author_role: string
  created_at: string
  updated_at: string
  can_edit: boolean
}

export interface CreatorBankFilters {
  q?: string
  topics?: string[]
  country?: string
  source?: string
  has_verified_youtube_rates?: boolean
  min_subscribers?: number
  min_avg_views?: number
  min_engagement_rate?: number
  sort?: string
  page?: number
  page_size?: number
}

export interface PaginatedProfiles {
  items: CreatorProfile[]
  total: number
  page: number
  page_size: number
}

export interface BulkImportResultRow {
  input: string
  status: 'created' | 'duplicate' | 'not_found' | 'quota_exceeded'
  profile_id: string | null
}

/**
 * Creator commerce baseline (YouTube Shopping affiliate upload).
 * See release-plan-20260924-creator-discovery-commerce-baseline-v1.md §5-§6.
 * All figures are computed server-side; the FE consumes them verbatim.
 */
export interface CommerceTopProduct {
  product_title: string | null
  total_sales: number | null
  orders: number
  aov: number | null
}

export interface CommerceDailyPoint {
  date: string
  total_sales: number | null
}

export interface CommercePeriod {
  period: string
  period_start: string
  period_end: string
  currency: string
  source_type: string
  monthly_gmv: number | null
  total_orders: number | null
  aov: number | null
  avg_gmv_per_day: number | null
  days_in_period: number
  realized_commission: number | null
  pipeline_commission: number | null
  removed_commission: number | null
  coverage_sales_ratio: number | null
  product_count: number
  conversion_rate: number | null
  conversion_rate_state: string
  click_coverage_products: string
  total_clicks: number | null
  total_impressions: number | null
  daily: CommerceDailyPoint[]
  top_products: CommerceTopProduct[]
}

export interface CommerceSummary {
  periods: CommercePeriod[]
  headline: {
    avg_monthly_gmv: number | null
    period_count: number
    avg_aov: number | null
    avg_gmv_per_day: number | null
  } | null
}

export interface CommerceImport {
  id: string
  period_start: string
  period_end: string
  source_type: string
  currency: string
  file_names: string[]
  status: string
  totals_sum: number | null
  table_total_sales: number | null
  table_total_orders: number | null
  coverage_sales_ratio: number | null
  rows_total: number
  rows_imported: number
  rows_skipped: number
  errors: { file?: string; line?: number | null; reason: string }[]
  created_at: string
  reverted_at: string | null
}

export function useCreatorDiscovery() {
  const { get, post, patch, delete: del } = useApi()

  async function list(filters?: CreatorBankFilters): Promise<PaginatedProfiles> {
    const params: Record<string, string | number> = {}
    if (filters?.q) params.q = filters.q
    if (filters?.topics?.length) params.topics = filters.topics.join(',')
    if (filters?.country) params.country = filters.country
    if (filters?.source) params.source = filters.source
    if (filters?.has_verified_youtube_rates !== undefined) params.has_verified_youtube_rates = String(filters.has_verified_youtube_rates)
    if (filters?.min_subscribers != null) params.min_subscribers = filters.min_subscribers
    if (filters?.min_avg_views != null) params.min_avg_views = filters.min_avg_views
    if (filters?.min_engagement_rate != null) params.min_engagement_rate = filters.min_engagement_rate
    if (filters?.sort) params.sort = filters.sort
    if (filters?.page) params.page = filters.page
    if (filters?.page_size) params.page_size = filters.page_size
    const { data } = await get<PaginatedProfiles>('/api/v1/creator-bank', { params })
    return data
  }

  async function get_(id: string): Promise<CreatorProfile> {
    const { data } = await get<CreatorProfile>(`/api/v1/creator-bank/${id}`)
    return data
  }

  async function lookup(query: string): Promise<CreatorLookupPreview> {
    const { data } = await get<CreatorLookupPreview>('/api/v1/creator-bank/lookup', { params: { query } })
    return data
  }

  async function save(payload: {
    query: string
    rate_card?: RateCard
    contact?: Contact
    social_links?: SocialLink[]
    organization_id?: string
  }): Promise<CreatorProfile> {
    const { data } = await post<CreatorProfile>('/api/v1/creator-bank', payload)
    return data
  }

  async function bulkImport(entries: string[], organizationId?: string): Promise<BulkImportResultRow[]> {
    const { data } = await post<BulkImportResultRow[]>('/api/v1/creator-bank/import', {
      entries,
      organization_id: organizationId,
    })
    return data
  }

  async function saveBatch(items: PrefetchedChannel[], organizationId?: string): Promise<BulkImportResultRow[]> {
    const { data } = await post<BulkImportResultRow[]>('/api/v1/creator-bank/save-batch', {
      items,
      organization_id: organizationId,
    })
    return data
  }

  async function syncFromChannels(scope?: {
    organizationIds?: string[]
    mcnIds?: string[]
  }): Promise<{
    channels_scanned: number
    created: number
    updated: number
    enriched: number
    performance_backfill_queued: number
  }> {
    const body = scope
      ? { organization_ids: scope.organizationIds, mcn_ids: scope.mcnIds }
      : undefined
    const { data } = await post('/api/v1/creator-bank/sync-from-channels', body)
    return data
  }

  async function syncFromBrandDealReports(scope?: {
    organizationIds?: string[]
    reportIds?: string[]
  }): Promise<{
    reports_scanned: number
    created: number
    linked: number
    skipped: number
  }> {
    const body = scope
      ? { organization_ids: scope.organizationIds, report_ids: scope.reportIds }
      : undefined
    const { data } = await post('/api/v1/creator-bank/sync-from-brand-deal-reports', body)
    return data
  }

  async function topicsFacet(): Promise<{ topic: string; count: number }[]> {
    const { data } = await get('/api/v1/creator-bank/topics')
    return data
  }

  async function summary(): Promise<{
    capabilities?: { source_filter?: boolean; verified_youtube_rate_filter?: boolean }
    creators_in_bank: number
    synced_from_channels: number
    externally_discovered: number
    from_brand_deal_reports: number
    avg_subscriber_count: number
    niches_represented: number
  }> {
    const { data } = await get('/api/v1/creator-bank/summary')
    return data
  }

  async function refresh(id: string): Promise<CreatorProfile> {
    const { data } = await post<CreatorProfile>(`/api/v1/creator-bank/${id}/refresh`)
    return data
  }

  async function remove(id: string): Promise<void> {
    await del(`/api/v1/creator-bank/${id}`)
  }

  async function updateProfile(
    id: string,
    payload: { rate_card?: RateCard; contact?: Contact; social_links?: SocialLink[] },
  ): Promise<CreatorProfile> {
    const { data } = await patch<CreatorProfile>(`/api/v1/creator-bank/${id}`, payload)
    return data
  }

  async function videos(id: string): Promise<CreatorVideo[]> {
    const { data } = await get<CreatorVideo[]>(`/api/v1/creator-bank/${id}/videos`)
    return data
  }

  async function notes(id: string): Promise<CreatorNote[]> {
    const { data } = await get<CreatorNote[]>(`/api/v1/creator-bank/${id}/notes`)
    return data
  }

  async function createNote(id: string, body: string): Promise<CreatorNote> {
    const { data } = await post<CreatorNote>(`/api/v1/creator-bank/${id}/notes`, { body })
    return data
  }

  async function updateNote(id: string, noteId: string, body: string): Promise<CreatorNote> {
    const { data } = await patch<CreatorNote>(`/api/v1/creator-bank/${id}/notes/${noteId}`, { body })
    return data
  }

  async function compare(profileIds: string[]): Promise<CreatorProfile[]> {
    const { data } = await post<CreatorProfile[]>('/api/v1/creator-bank/compare', { profile_ids: profileIds })
    return data
  }

  async function uploadCommerce(
    id: string,
    files: File[],
    opts?: { periodStart?: string; periodEnd?: string; sourceType?: string },
  ): Promise<CommerceImport> {
    const form = new FormData()
    for (const f of files) form.append('files', f)
    if (opts?.periodStart) form.append('period_start', opts.periodStart)
    if (opts?.periodEnd) form.append('period_end', opts.periodEnd)
    if (opts?.sourceType) form.append('source_type', opts.sourceType)
    // Drop the JSON default so the browser sets multipart + boundary.
    const { data } = await post<CommerceImport>(`/api/v1/creator-bank/${id}/commerce/imports`, form, {
      headers: { 'Content-Type': undefined as unknown as string },
    })
    return data
  }

  async function commerceImports(id: string): Promise<CommerceImport[]> {
    const { data } = await get<CommerceImport[]>(`/api/v1/creator-bank/${id}/commerce/imports`)
    return data
  }

  async function commerceSummary(id: string): Promise<CommerceSummary> {
    const { data } = await get<CommerceSummary>(`/api/v1/creator-bank/${id}/commerce/summary`)
    return data
  }

  async function revertCommerceImport(id: string, importId: string): Promise<CommerceImport> {
    const { data } = await post<CommerceImport>(
      `/api/v1/creator-bank/${id}/commerce/imports/${importId}/revert`,
    )
    return data
  }

  return {
    list,
    get: get_,
    lookup,
    save,
    bulkImport,
    saveBatch,
    syncFromChannels,
    syncFromBrandDealReports,
    topicsFacet,
    summary,
    refresh,
    updateProfile,
    videos,
    notes,
    createNote,
    updateNote,
    compare,
    remove,
    uploadCommerce,
    commerceImports,
    commerceSummary,
    revertCommerceImport,
  }
}
