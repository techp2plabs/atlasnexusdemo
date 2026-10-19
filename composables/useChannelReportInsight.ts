export type InsightLanguage = 'en' | 'id'
export type InsightModel =
  | 'gemini-2.5-flash'
  | 'gemini-3-flash-preview'
  | 'gemini-3.5-flash'
  | 'gemini-3.6-flash'
  | 'gemini-2.5-flash-lite'
export type InsightStatus = 'processing' | 'completed' | 'failed'
export type InsightType = 'executive' | 'comments'

export const INSIGHT_LANGUAGE_OPTIONS: { value: InsightLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
]

// Backend ALLOWED_MODELS still lists every model on the Atlas Technology
// project's AI Studio rate-limit dashboard, but only gemini-3.6-flash has
// been verified to generate successfully end-to-end (2026-07-30, upgraded
// from gemini-3.5-flash). The others hard-404 ("no longer available to new
// users") or are quota-blocked/transiently unavailable, so the UI only
// exposes the working model to avoid users hitting failed generations.
export const INSIGHT_MODEL_OPTIONS: { value: InsightModel; label: string }[] = [
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
]

// ── Old (pre-2026-07-31) 11-key Executive Insight schema ────────────────────
// Kept unchanged so historical rows generated before the prompt swap still
// render via the legacy component set (InsightCampaignHealthCard.vue, etc.).

export interface InsightCampaignHealth {
  status: string
  confidence: string
  period_status: string
  headline: string
  reason: string
}

export interface InsightKpiSummaryItem {
  metric: string
  value: string
  interpretation: string
  target_comparison: string
}

export interface InsightKeyInsight {
  title: string
  finding: string
  evidence: string[]
  implication: string
}

export interface InsightTopVideoByViews {
  rank: number
  video_title: string
  channel: string
  views: number
  view_contribution_percent: number | null
  engagement_rate_percent: number | null
  reason: string
}

export interface InsightTopVideoByEfficiency {
  rank: number
  video_title: string
  channel: string
  views: number
  engagement_rate_percent: number | null
  classification: string
  reason: string
}

export interface InsightUnderperformingVideo {
  video_title: string
  channel: string
  views: number
  engagement_rate_percent: number | null
  diagnosis: string
}

export interface InsightTopContent {
  top_by_views: InsightTopVideoByViews[]
  top_by_engagement_efficiency: InsightTopVideoByEfficiency[]
  underperforming_content: InsightUnderperformingVideo[]
}

export interface InsightChannelInsight {
  channel: string
  campaign_views: number
  view_contribution_percent: number | null
  subscriber_count: number | null
  insight: string
}

export interface InsightContentPattern {
  pattern: string
  evidence: string
  interpretation: string
}

export interface InsightConcentrationAnalysis {
  top_5_video_view_share_percent: number | null
  top_10_video_view_share_percent: number | null
  top_channel_view_share_percent: number | null
  assessment: string
  implication: string
}

export interface InsightDataQualityIssue {
  severity: string
  issue: string
  impact: string
  // Only present on the old (11-key) schema — the new (10-key) schema's
  // data_quality.issues entries don't include this field. Optional so the
  // shared InsightDataQuality.vue component (reused verbatim for both
  // schemas) can render either without a type error.
  recommended_action?: string
}

export interface InsightDataQuality {
  status: string
  issues: InsightDataQualityIssue[]
}

export interface InsightRecommendation {
  priority: string
  action: string
  reason: string
  expected_impact: string
  owner: string
}

/** Old (pre-2026-07-31) 11-key Executive Insight schema. */
export interface InsightData {
  campaign_health: InsightCampaignHealth
  executive_summary: string[]
  kpi_summary: InsightKpiSummaryItem[]
  key_insights: InsightKeyInsight[]
  top_content: InsightTopContent
  channel_insights: InsightChannelInsight[]
  content_patterns: InsightContentPattern[]
  concentration_analysis: InsightConcentrationAnalysis
  data_quality: InsightDataQuality
  recommendations: InsightRecommendation[]
  client_ready_summary: string
}

// ── New (2026-07-31+) 10-key Executive Insight schema ───────────────────────
// See docs/prd/prompt-creator-suites-channel-report-insight-executive-final.md
// in atlas-platform-core for the full prompt/schema this mirrors.

export interface ChannelHealth {
  status: string
  confidence: string
  period_status: string
  headline: string
  reason: string
}

export interface CreatorPersona {
  content_pillars: string[]
  tone_and_style: string
  positioning_summary: string
}

export interface AudienceTrigger {
  pattern: string
  evidence: string
  psychological_driver: string
}

export interface AudiencePreferences {
  top_performing_triggers: AudienceTrigger[]
}

export interface SeoGapOpportunity {
  issue: string
  recommended_action: string
}

export interface SeoMetadataHealth {
  structural_alignment: string
  gaps_and_opportunities: SeoGapOpportunity[]
}

export interface UploadPatterns {
  cadence_summary: string
  consistency_assessment: string
  impact_on_traffic: string
}

export interface TopContentDeepDiveItem {
  rank: number
  video_title: string
  views: number
  engagement_rate_percent: number | null
  hook_angle: string
  core_ideation: string
  why_it_worked: string
}

export interface SmartMetrics {
  like_to_view_ratio_percent: number | null
  comment_to_view_ratio_percent: number | null
  median_views: number | null
  median_engagement_rate_percent: number | null
  engagement_depth_assessment: string
}

export interface GrowthPlanContentIdea {
  working_title: string
  hook_angle: string
  thumbnail_visual_concept: string
}

export interface GrowthPlanExecutionItem {
  priority: string
  action: string
  reason: string
}

export interface GrowthPlan {
  content_ideas: GrowthPlanContentIdea[]
  execution_checklist: GrowthPlanExecutionItem[]
}

/** New (2026-07-31+) 10-key Executive Insight schema. */
export interface NewInsightData {
  channel_health: ChannelHealth
  creator_persona: CreatorPersona
  audience_preferences: AudiencePreferences
  seo_metadata_health: SeoMetadataHealth
  upload_patterns: UploadPatterns
  top_content_deep_dive: TopContentDeepDiveItem[]
  smart_metrics: SmartMetrics
  growth_plan: GrowthPlan
  data_quality: InsightDataQuality
  client_ready_summary: string
}

// ── AI Comments Insight (comment-derived lane, insight_type = 'comments') ────
// Identical (byte-for-byte prompt reuse) to the Brand Deal Report's Comments
// Insight schema — mirrors useCampaignReportInsight.ts's CommentsInsightData.

export interface CommentsHealth {
  status: string
  confidence: string
  coverage_status: string
  headline: string
  reason: string
}

export interface CommentsKeyInsight {
  title: string
  finding: string
  evidence: string[]
  implication: string
}

export interface CommentsBrandConnectionBreakdown {
  directly_connected_pct: number | null
  contextually_relevant_pct: number | null
  unconnected_noise_pct: number | null
}

export interface CommentsBrandConnection {
  brand_connection_ratio_pct: number | null
  breakdown: CommentsBrandConnectionBreakdown
  narrative: string
}

export interface CommentsSentimentSplit {
  positive_pct: number | null
  neutral_pct: number | null
  negative_pct: number | null
}

export interface CommentsSentimentDrivers {
  positive: string[]
  neutral: string[]
  negative: string[]
}

export interface CommentsSentimentAnalysis {
  sentiment_split: CommentsSentimentSplit
  key_drivers: CommentsSentimentDrivers
  narrative: string
}

export interface CommentsMentionVolume {
  count: number | null
  pct_of_analyzed: number | null
}

export interface CommentsTopAssociation {
  phrase: string
  sentiment: string
  context: string
}

export interface CommentsBrandMentions {
  mention_volume: CommentsMentionVolume
  top_associations: CommentsTopAssociation[]
}

export interface CommentsTopKeyword {
  rank: number
  keyword: string
  context: string
}

export interface CommentsMarketingTakeaway {
  takeaway: string
  rationale: string
  owner: string
}

export interface CommentsCampaignImpact {
  resonance_score: string
  resonance_rationale: string
  key_marketing_takeaways: CommentsMarketingTakeaway[]
}

export interface CommentsDataQualityIssue {
  severity: string
  issue: string
  impact: string
  recommended_action: string
}

export interface CommentsDataQuality {
  status: string
  issues: CommentsDataQualityIssue[]
}

export interface CommentsSampleOverview {
  total_comments_in_report: number | null
  total_comments_analyzed: number | null
  creator_replies_excluded: number | null
  spam_or_irrelevant_excluded: number | null
  coverage_note: string
}

export interface CommentsInsightData {
  comment_health: CommentsHealth
  executive_summary: string[]
  key_insights: CommentsKeyInsight[]
  brand_connection: CommentsBrandConnection
  sentiment_analysis: CommentsSentimentAnalysis
  brand_mentions: CommentsBrandMentions
  top_keywords: CommentsTopKeyword[]
  campaign_impact: CommentsCampaignImpact
  data_quality: CommentsDataQuality
  sample_overview: CommentsSampleOverview
  client_ready_summary: string
}

export interface ChannelReportInsight {
  id: string
  report_id: string
  insight_type: InsightType
  language: InsightLanguage
  model: InsightModel
  status: InsightStatus
  insight_data: InsightData | NewInsightData | CommentsInsightData | null
  error_message: string | null
  created_at: string
  completed_at: string | null
  input_tokens: number | null
  output_tokens: number | null
  estimated_cost_usd: number | null
}

export interface ChannelReportInsightSummary {
  id: string
  insight_type: InsightType
  language: InsightLanguage
  model: InsightModel
  status: InsightStatus
  error_message: string | null
  created_at: string
  completed_at: string | null
  input_tokens: number | null
  output_tokens: number | null
  estimated_cost_usd: number | null
}

export interface ChannelReportInsightList {
  latest: ChannelReportInsight | null
  latest_attempt: ChannelReportInsightSummary | null
  history: ChannelReportInsightSummary[]
}

export function useChannelReportInsight() {
  const { get, post } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const generateInsight = async (
    reportId: string,
    language: InsightLanguage,
    model: InsightModel,
    insightType: InsightType = 'executive',
  ): Promise<ChannelReportInsight> => {
    loading.value = true
    error.value = null
    try {
      const res = await post<ChannelReportInsight>(
        `/api/v1/tools/youtube-channel-report/${reportId}/insight`,
        { language, model, insight_type: insightType },
      )
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to generate insight'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchInsightSummary = async (
    reportId: string,
    insightType: InsightType = 'executive',
  ): Promise<ChannelReportInsightList> => {
    const res = await get<ChannelReportInsightList>(
      `/api/v1/tools/youtube-channel-report/${reportId}/insight`,
      { params: { insight_type: insightType } },
    )
    return res.data
  }

  const fetchInsightDetail = async (reportId: string, insightId: string): Promise<ChannelReportInsight> => {
    const res = await get<ChannelReportInsight>(
      `/api/v1/tools/youtube-channel-report/${reportId}/insight/${insightId}`,
    )
    return res.data
  }

  return {
    loading,
    error,
    generateInsight,
    fetchInsightSummary,
    fetchInsightDetail,
  }
}
