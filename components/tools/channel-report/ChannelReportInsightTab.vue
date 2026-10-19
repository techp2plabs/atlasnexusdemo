<template>
  <div class="space-y-6">
    <!-- Public / read-only view — executive insight only, unchanged from before this component's sub-tab split -->
    <template v-if="readonly">
      <div v-if="publicInsightData" class="space-y-6">
        <p class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
          This analysis is AI-generated commentary produced by Atlas from the report data above — it is not official YouTube data.
        </p>
        <template v-if="publicInsightData && 'creator_persona' in publicInsightData">
          <InsightChannelHealthCard :health="(publicInsightData as NewInsightData).channel_health" />
          <InsightCreatorPersona :persona="(publicInsightData as NewInsightData).creator_persona" />
          <InsightAudiencePreferences :data="(publicInsightData as NewInsightData).audience_preferences" />
          <InsightSeoMetadataHealth :data="(publicInsightData as NewInsightData).seo_metadata_health" />
          <InsightUploadPatterns :data="(publicInsightData as NewInsightData).upload_patterns" />
          <InsightTopContentDeepDive :items="(publicInsightData as NewInsightData).top_content_deep_dive" />
          <InsightSmartMetrics :data="(publicInsightData as NewInsightData).smart_metrics" />
          <InsightGrowthPlan :data="(publicInsightData as NewInsightData).growth_plan" />
          <InsightDataQuality :data="(publicInsightData as NewInsightData).data_quality" />
          <InsightClientReadySummary :text="(publicInsightData as NewInsightData).client_ready_summary" />
        </template>
        <template v-else>
          <InsightCampaignHealthCard :health="(publicInsightData as InsightData).campaign_health" />
          <InsightExecutiveSummary :items="(publicInsightData as InsightData).executive_summary" />
          <InsightKpiSummaryGrid :items="(publicInsightData as InsightData).kpi_summary" />
          <InsightKeyInsightsList :items="(publicInsightData as InsightData).key_insights" />
          <InsightTopContent :data="(publicInsightData as InsightData).top_content" />
          <InsightChannelInsights :items="(publicInsightData as InsightData).channel_insights" />
          <InsightContentPatterns :items="(publicInsightData as InsightData).content_patterns" />
          <InsightConcentrationAnalysis :data="(publicInsightData as InsightData).concentration_analysis" />
          <InsightDataQuality :data="(publicInsightData as InsightData).data_quality" />
          <InsightRecommendations :items="(publicInsightData as InsightData).recommendations" />
          <InsightClientReadySummary :text="(publicInsightData as InsightData).client_ready_summary" />
        </template>
      </div>
      <div v-else class="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        No insight has been generated for this report yet.
      </div>
    </template>

    <!-- Authenticated view: two independent sub-tabs, each open to all tool-access users -->
    <template v-else>
      <div class="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          @click="view = 'executive'"
          :class="[
            'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            view === 'executive'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          ]"
        >
          Executive Insight
        </button>
        <button
          type="button"
          @click="view = 'comments'"
          :class="[
            'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            view === 'comments'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          ]"
        >
          Comments Insight
        </button>
      </div>

      <InsightLane v-if="view === 'executive'" :report="report" insight-type="executive" />
      <InsightLane v-else :report="report" insight-type="comments" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChannelReport } from '~/composables/useChannelReport'
import type { InsightData, NewInsightData, InsightType } from '~/composables/useChannelReportInsight'

// Legacy (11-key) executive schema — public/share view fallback
import InsightCampaignHealthCard from '~/components/tools/channel-report/insight/InsightCampaignHealthCard.vue'
import InsightExecutiveSummary from '~/components/tools/channel-report/insight/InsightExecutiveSummary.vue'
import InsightKpiSummaryGrid from '~/components/tools/channel-report/insight/InsightKpiSummaryGrid.vue'
import InsightKeyInsightsList from '~/components/tools/channel-report/insight/InsightKeyInsightsList.vue'
import InsightTopContent from '~/components/tools/channel-report/insight/InsightTopContent.vue'
import InsightChannelInsights from '~/components/tools/channel-report/insight/InsightChannelInsights.vue'
import InsightContentPatterns from '~/components/tools/channel-report/insight/InsightContentPatterns.vue'
import InsightConcentrationAnalysis from '~/components/tools/channel-report/insight/InsightConcentrationAnalysis.vue'
import InsightRecommendations from '~/components/tools/channel-report/insight/InsightRecommendations.vue'

// New (10-key) executive schema — public/share view
import InsightChannelHealthCard from '~/components/tools/channel-report/insight/InsightChannelHealthCard.vue'
import InsightCreatorPersona from '~/components/tools/channel-report/insight/InsightCreatorPersona.vue'
import InsightAudiencePreferences from '~/components/tools/channel-report/insight/InsightAudiencePreferences.vue'
import InsightSeoMetadataHealth from '~/components/tools/channel-report/insight/InsightSeoMetadataHealth.vue'
import InsightUploadPatterns from '~/components/tools/channel-report/insight/InsightUploadPatterns.vue'
import InsightTopContentDeepDive from '~/components/tools/channel-report/insight/InsightTopContentDeepDive.vue'
import InsightSmartMetrics from '~/components/tools/channel-report/insight/InsightSmartMetrics.vue'
import InsightGrowthPlan from '~/components/tools/channel-report/insight/InsightGrowthPlan.vue'

import InsightDataQuality from '~/components/tools/channel-report/insight/InsightDataQuality.vue'
import InsightClientReadySummary from '~/components/tools/channel-report/insight/InsightClientReadySummary.vue'

import InsightLane from '~/components/tools/channel-report/insight/InsightLane.vue'

const props = withDefaults(
  defineProps<{
    report: ChannelReport
    readonly?: boolean
    publicInsightData?: InsightData | NewInsightData | null
  }>(),
  { readonly: false, publicInsightData: null },
)

const route = useRoute()
const router = useRouter()

const view = ref<InsightType>(route.query.view === 'comments' ? 'comments' : 'executive')

watch(view, (v) => {
  router.replace({ query: { ...route.query, view: v } })
})
</script>
