<template>
  <div class="space-y-6">
    <!-- Not-yet-run precondition -->
    <div v-if="!reportReady" class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800/60 dark:bg-amber-950/30">
      <p class="text-sm font-medium text-amber-900 dark:text-amber-200">Run this report first to generate an insight</p>
      <p class="mt-1 text-xs text-amber-700 dark:text-amber-300/80">
        The AI analysis needs real channel data. Complete the report in the Setup tab before generating an insight.
      </p>
    </div>

    <!-- Loading initial summary -->
    <div v-else-if="loadingSummary" class="flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
    </div>

    <!-- Generation in flight -->
    <div v-else-if="generating" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      <p class="text-base font-medium text-gray-900 dark:text-white">{{ generatingLabel }}</p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">This can take up to a minute — feel free to switch tabs, we'll notify you when it's ready.</p>
    </div>

    <!-- No comments left to analyze after fetch/filter/cleaning (comments lane only) -->
    <div v-else-if="noCommentsAvailable" class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800/60 dark:bg-amber-950/30">
      <p class="text-sm font-medium text-amber-900 dark:text-amber-200">No comments available to analyze</p>
      <p class="mt-1 text-xs text-amber-700 dark:text-amber-300/80">
        This report's videos have no comments to analyze yet, or all fetched comments were filtered out as spam or the creator's own replies.
      </p>
    </div>

    <!-- Dashboard for the currently-viewed entry -->
    <div v-else-if="viewedInsight?.insight_data" class="space-y-6">
      <p class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
        This analysis is AI-generated commentary produced by Atlas from the report data above — it is not official YouTube data.
      </p>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {{ languageLabel(viewedInsight.language) }}
          </span>
          <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {{ modelLabel(viewedInsight.model) }}
          </span>
          <span v-if="isViewingHistory" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Viewing history · {{ formatDate(viewedInsight.completed_at || viewedInsight.created_at) }}
          </span>
          <span v-if="showCost" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            tokens: {{ viewedInsight.input_tokens }}/{{ viewedInsight.output_tokens }}
            <span v-if="viewedInsight.estimated_cost_usd != null"> · est. ${{ viewedInsight.estimated_cost_usd.toFixed(4) }}</span>
          </span>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <button
              type="button"
              @click="historyOpen = !historyOpen"
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              History ({{ history.length }})
            </button>
            <div
              v-if="historyOpen"
              class="absolute right-0 z-10 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              <button
                v-for="entry in history"
                :key="entry.id"
                type="button"
                @click="openHistoryEntry(entry.id)"
                class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span class="text-gray-700 dark:text-gray-300">
                  {{ formatDate(entry.completed_at || entry.created_at) }} · {{ languageLabel(entry.language) }} · {{ modelLabel(entry.model) }}
                </span>
                <span :class="statusDotClass(entry.status)"></span>
              </button>
              <p v-if="!history.length" class="px-3 py-2 text-xs text-gray-400 dark:text-gray-600">No history yet</p>
            </div>
          </div>
          <button
            type="button"
            @click="showRegeneratePanel = !showRegeneratePanel"
            class="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div v-if="showRegeneratePanel" class="rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/10">
        <GenerateSettingsForm v-model:language="selectedLanguage" v-model:model="selectedModel" />
        <div class="mt-3 flex items-center gap-2">
          <button
            type="button"
            @click="handleRegenerate"
            class="rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Confirm Regenerate
          </button>
          <button type="button" @click="showRegeneratePanel = false" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
            Cancel
          </button>
        </div>
        <p class="mt-2 text-xs text-amber-700 dark:text-amber-400">{{ regenerateNote }}</p>
      </div>

      <!-- Executive Insight sections — new (10-key) schema -->
      <template v-if="insightType === 'executive' && isNewExecutiveSchema">
        <InsightChannelHealthCard :health="(viewedInsight.insight_data as NewInsightData).channel_health" />
        <InsightCreatorPersona :persona="(viewedInsight.insight_data as NewInsightData).creator_persona" />
        <InsightAudiencePreferences :data="(viewedInsight.insight_data as NewInsightData).audience_preferences" />
        <InsightSeoMetadataHealth :data="(viewedInsight.insight_data as NewInsightData).seo_metadata_health" />
        <InsightUploadPatterns :data="(viewedInsight.insight_data as NewInsightData).upload_patterns" />
        <InsightTopContentDeepDive :items="(viewedInsight.insight_data as NewInsightData).top_content_deep_dive" />
        <InsightSmartMetrics :data="(viewedInsight.insight_data as NewInsightData).smart_metrics" />
        <InsightGrowthPlan :data="(viewedInsight.insight_data as NewInsightData).growth_plan" />
        <InsightDataQuality :data="(viewedInsight.insight_data as NewInsightData).data_quality" />
        <InsightClientReadySummary :text="(viewedInsight.insight_data as NewInsightData).client_ready_summary" />
      </template>

      <!-- Executive Insight sections — legacy (11-key, pre-2026-07-31) schema fallback -->
      <template v-else-if="insightType === 'executive'">
        <InsightCampaignHealthCard :health="(viewedInsight.insight_data as InsightData).campaign_health" />
        <InsightExecutiveSummary :items="(viewedInsight.insight_data as InsightData).executive_summary" />
        <InsightKpiSummaryGrid :items="(viewedInsight.insight_data as InsightData).kpi_summary" />
        <InsightKeyInsightsList :items="(viewedInsight.insight_data as InsightData).key_insights" />
        <InsightTopContent :data="(viewedInsight.insight_data as InsightData).top_content" />
        <InsightChannelInsights :items="(viewedInsight.insight_data as InsightData).channel_insights" />
        <InsightContentPatterns :items="(viewedInsight.insight_data as InsightData).content_patterns" />
        <InsightConcentrationAnalysis :data="(viewedInsight.insight_data as InsightData).concentration_analysis" />
        <InsightDataQuality :data="(viewedInsight.insight_data as InsightData).data_quality" />
        <InsightRecommendations :items="(viewedInsight.insight_data as InsightData).recommendations" />
        <InsightClientReadySummary :text="(viewedInsight.insight_data as InsightData).client_ready_summary" />
      </template>

      <!-- Comments Insight sections -->
      <template v-else>
        <CommentsHealthCard :health="(viewedInsight.insight_data as CommentsInsightData).comment_health" />
        <CommentsExecutiveSummary :items="(viewedInsight.insight_data as CommentsInsightData).executive_summary" />
        <CommentsKeyInsightsList :items="(viewedInsight.insight_data as CommentsInsightData).key_insights" />
        <CommentsBrandConnection :data="(viewedInsight.insight_data as CommentsInsightData).brand_connection" />
        <CommentsSentimentAnalysis :data="(viewedInsight.insight_data as CommentsInsightData).sentiment_analysis" />
        <CommentsBrandMentions :data="(viewedInsight.insight_data as CommentsInsightData).brand_mentions" />
        <CommentsTopKeywords :items="(viewedInsight.insight_data as CommentsInsightData).top_keywords" />
        <CommentsCampaignImpact :data="(viewedInsight.insight_data as CommentsInsightData).campaign_impact" />
        <CommentsDataQuality :data="(viewedInsight.insight_data as CommentsInsightData).data_quality" />
        <CommentsSampleOverview :data="(viewedInsight.insight_data as CommentsInsightData).sample_overview" />
        <CommentsClientReadySummary :text="(viewedInsight.insight_data as CommentsInsightData).client_ready_summary" />
      </template>
    </div>

    <!-- Last attempt failed, no completed insight yet -->
    <div v-else-if="lastFailed" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
      <p class="text-sm font-semibold text-red-800 dark:text-red-300">Insight generation failed</p>
      <p v-if="latestAttemptError" class="mt-1 text-sm text-red-700 dark:text-red-400">{{ latestAttemptError }}</p>
      <div class="mx-auto mt-4 max-w-sm">
        <GenerateSettingsForm v-model:language="selectedLanguage" v-model:model="selectedModel" />
        <button
          type="button"
          @click="handleGenerate"
          class="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Never generated -->
    <div v-else class="mx-auto max-w-sm py-12 text-center">
      <p class="text-base font-medium text-gray-900 dark:text-white">{{ generateTitle }}</p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ generateDescription }}</p>
      <div class="mt-5 text-left">
        <GenerateSettingsForm v-model:language="selectedLanguage" v-model:model="selectedModel" />
      </div>
      <button
        type="button"
        @click="handleGenerate"
        class="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
      >
        Generate Insight
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelReport } from '~/composables/useChannelReport'
import {
  useChannelReportInsight,
  INSIGHT_MODEL_OPTIONS,
  type ChannelReportInsight,
  type ChannelReportInsightSummary,
  type InsightData,
  type NewInsightData,
  type CommentsInsightData,
  type InsightLanguage,
  type InsightModel,
  type InsightType,
} from '~/composables/useChannelReportInsight'

// Executive Insight sections — new (10-key, 2026-07-31+) schema
import InsightChannelHealthCard from '~/components/tools/channel-report/insight/InsightChannelHealthCard.vue'
import InsightCreatorPersona from '~/components/tools/channel-report/insight/InsightCreatorPersona.vue'
import InsightAudiencePreferences from '~/components/tools/channel-report/insight/InsightAudiencePreferences.vue'
import InsightSeoMetadataHealth from '~/components/tools/channel-report/insight/InsightSeoMetadataHealth.vue'
import InsightUploadPatterns from '~/components/tools/channel-report/insight/InsightUploadPatterns.vue'
import InsightTopContentDeepDive from '~/components/tools/channel-report/insight/InsightTopContentDeepDive.vue'
import InsightSmartMetrics from '~/components/tools/channel-report/insight/InsightSmartMetrics.vue'
import InsightGrowthPlan from '~/components/tools/channel-report/insight/InsightGrowthPlan.vue'

// Executive Insight sections — legacy (11-key, pre-2026-07-31) schema, kept for
// historical rows generated before the prompt swap
import InsightCampaignHealthCard from '~/components/tools/channel-report/insight/InsightCampaignHealthCard.vue'
import InsightExecutiveSummary from '~/components/tools/channel-report/insight/InsightExecutiveSummary.vue'
import InsightKpiSummaryGrid from '~/components/tools/channel-report/insight/InsightKpiSummaryGrid.vue'
import InsightKeyInsightsList from '~/components/tools/channel-report/insight/InsightKeyInsightsList.vue'
import InsightTopContent from '~/components/tools/channel-report/insight/InsightTopContent.vue'
import InsightChannelInsights from '~/components/tools/channel-report/insight/InsightChannelInsights.vue'
import InsightContentPatterns from '~/components/tools/channel-report/insight/InsightContentPatterns.vue'
import InsightConcentrationAnalysis from '~/components/tools/channel-report/insight/InsightConcentrationAnalysis.vue'
import InsightRecommendations from '~/components/tools/channel-report/insight/InsightRecommendations.vue'

// Shared across both executive schemas
import InsightDataQuality from '~/components/tools/channel-report/insight/InsightDataQuality.vue'
import InsightClientReadySummary from '~/components/tools/channel-report/insight/InsightClientReadySummary.vue'

// Comments Insight sections
import CommentsHealthCard from '~/components/tools/channel-report/insight/CommentsHealthCard.vue'
import CommentsExecutiveSummary from '~/components/tools/channel-report/insight/CommentsExecutiveSummary.vue'
import CommentsKeyInsightsList from '~/components/tools/channel-report/insight/CommentsKeyInsightsList.vue'
import CommentsBrandConnection from '~/components/tools/channel-report/insight/CommentsBrandConnection.vue'
import CommentsSentimentAnalysis from '~/components/tools/channel-report/insight/CommentsSentimentAnalysis.vue'
import CommentsBrandMentions from '~/components/tools/channel-report/insight/CommentsBrandMentions.vue'
import CommentsTopKeywords from '~/components/tools/channel-report/insight/CommentsTopKeywords.vue'
import CommentsCampaignImpact from '~/components/tools/channel-report/insight/CommentsCampaignImpact.vue'
import CommentsDataQuality from '~/components/tools/channel-report/insight/CommentsDataQuality.vue'
import CommentsSampleOverview from '~/components/tools/channel-report/insight/CommentsSampleOverview.vue'
import CommentsClientReadySummary from '~/components/tools/channel-report/insight/CommentsClientReadySummary.vue'

import GenerateSettingsForm from '~/components/tools/channel-report/insight/GenerateSettingsForm.vue'

const props = defineProps<{
  report: ChannelReport
  insightType: InsightType
}>()

const { error: showError } = useToast()
const { generateInsight, fetchInsightSummary, fetchInsightDetail } = useChannelReportInsight()
const { trackJob, jobs } = useInsightJobTracker()

const reportReady = computed(
  () => props.report.status === 'completed' && (props.report.report_data?.videos?.length ?? 0) > 0,
)

const generateTitle = computed(() =>
  props.insightType === 'executive' ? 'Generate an AI executive insight' : 'Generate an AI Comments Insight',
)
const generateDescription = computed(() =>
  props.insightType === 'executive'
    ? "Turn this channel's data into a client-ready growth analysis with health status, creator persona, and a growth plan."
    : "Analyze the audience's comments (top 100 by likes) for sentiment, brand reception, and themes. If comments haven't been fetched yet, this will fetch them first.",
)
const generatingLabel = computed(() =>
  props.insightType === 'executive' ? 'Analyzing channel performance…' : 'Analyzing audience comments…',
)
const regenerateNote = computed(() =>
  props.insightType === 'executive'
    ? 'This will use real Gemini tokens and create a new history entry.'
    : 'This will use real Gemini tokens and create a new history entry. It reuses already-fetched comments and does not re-pull from YouTube unless none exist yet.',
)

const loadingSummary = ref(true)
const submitting = ref(false)
const historyOpen = ref(false)
const showRegeneratePanel = ref(false)
const noCommentsAvailable = ref(false)

const selectedLanguage = ref<InsightLanguage>('en')
const selectedModel = ref<InsightModel>('gemini-3.6-flash')

const latestCompleted = ref<ChannelReportInsight | null>(null)
const latestAttempt = ref<ChannelReportInsightSummary | null>(null)
const history = ref<ChannelReportInsightSummary[]>([])
const viewedInsight = ref<ChannelReportInsight | null>(null)
const isViewingHistory = ref(false)

const lastFailed = computed(() => latestAttempt.value?.status === 'failed' && !latestCompleted.value)
const latestAttemptError = computed(() => (lastFailed.value ? latestAttempt.value?.error_message : null))
const showCost = computed(() => viewedInsight.value?.input_tokens != null)

// Schema detection for the executive lane: the new (2026-07-31+) 10-key schema
// always includes `creator_persona`; historical rows generated under the old
// (11-key, campaign-shaped) schema don't, so they fall back to the legacy
// component set instead of erroring.
const isNewExecutiveSchema = computed(
  () => !!viewedInsight.value?.insight_data && 'creator_persona' in (viewedInsight.value.insight_data as object),
)

const myJobKey = computed(() => `channel:${props.report.id}:${props.insightType}`)
// Derived from the summary's own status (not a locally-toggled flag) so this lane
// shows "in progress" correctly on mount even if generation was kicked off from a
// previous page visit — plus `submitting` for the brief window between clicking
// Generate and the processing row existing.
const generating = computed(
  () => submitting.value || latestAttempt.value?.status === 'processing' || !!jobs.value[myJobKey.value],
)

const languageLabel = (lang: string) => (lang === 'id' ? 'Bahasa Indonesia' : 'English')
const modelLabel = (model: string) =>
  INSIGHT_MODEL_OPTIONS.find((opt) => opt.value === model)?.label || model

const statusDotClass = (status: string) => {
  const map: Record<string, string> = {
    completed: 'h-2 w-2 rounded-full bg-green-500',
    failed: 'h-2 w-2 rounded-full bg-red-500',
    processing: 'h-2 w-2 rounded-full bg-blue-500',
  }
  return map[status] || 'h-2 w-2 rounded-full bg-gray-400'
}

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return d
  }
}

const loadSummary = async (opts: { silent?: boolean } = {}) => {
  if (!reportReady.value) {
    loadingSummary.value = false
    return
  }
  if (!opts.silent) loadingSummary.value = true
  noCommentsAvailable.value = false
  try {
    const summary = await fetchInsightSummary(props.report.id, props.insightType)
    latestCompleted.value = summary.latest
    latestAttempt.value = summary.latest_attempt
    history.value = summary.history
    // Don't clobber a history entry the user is currently browsing with a silent
    // background refresh — only snap back to the latest on an explicit reload.
    if (!opts.silent || !isViewingHistory.value) {
      viewedInsight.value = summary.latest
      isViewingHistory.value = false
    }
    if (summary.latest) {
      selectedLanguage.value = summary.latest.language
      selectedModel.value = summary.latest.model
    }
  } catch (e: any) {
    if (!opts.silent) showError(e?.response?.data?.detail || 'Failed to load insight')
  } finally {
    if (!opts.silent) loadingSummary.value = false
  }
}

const runGeneration = async () => {
  submitting.value = true
  noCommentsAvailable.value = false
  showRegeneratePanel.value = false
  historyOpen.value = false
  try {
    await generateInsight(props.report.id, selectedLanguage.value, selectedModel.value, props.insightType)
    trackJob({
      reportId: props.report.id,
      insightType: props.insightType,
      kind: 'channel',
      label: props.insightType === 'executive' ? 'Executive Insight' : 'Comments Insight',
    })
    await loadSummary()
  } catch (e: any) {
    await loadSummary()
    if (e?.response?.status === 422 && props.insightType === 'comments') {
      noCommentsAvailable.value = true
    } else {
      showError(e?.response?.data?.detail || 'Failed to generate insight')
    }
  } finally {
    submitting.value = false
  }
}

const handleGenerate = () => runGeneration()
const handleRegenerate = () => runGeneration()

const openHistoryEntry = async (insightId: string) => {
  historyOpen.value = false
  try {
    const detail = await fetchInsightDetail(props.report.id, insightId)
    viewedInsight.value = detail
    isViewingHistory.value = detail.id !== latestCompleted.value?.id
  } catch (e: any) {
    showError(e?.response?.data?.detail || 'Failed to load history entry')
  }
}

watch(
  () => [props.report.id, props.insightType],
  () => loadSummary(),
)

// The global job tracker (composables/useInsightJobTracker.ts) untracks a job the
// moment it detects processing -> completed|failed via its own poll loop — refresh
// this lane's view when that happens so a user who stayed on the tab sees the
// result without waiting for their own next visit/reload.
watch(
  () => !!jobs.value[myJobKey.value],
  (isTracked, wasTracked) => {
    if (wasTracked && !isTracked) loadSummary({ silent: true })
  },
)

onMounted(() => loadSummary())
</script>
