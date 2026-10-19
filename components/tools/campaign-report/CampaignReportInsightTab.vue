<template>
  <div class="space-y-6">
    <!-- Public / read-only view — executive insight only, unchanged from before this component's sub-tab split -->
    <template v-if="readonly">
      <div v-if="publicInsightData" class="space-y-6">
        <p class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
          This analysis is AI-generated commentary produced by Atlas from the report data above — it is not official YouTube data.
        </p>
        <InsightCampaignHealthCard :health="publicInsightData.campaign_health" />
        <InsightExecutiveSummary :items="publicInsightData.executive_summary" />
        <InsightKpiSummaryGrid :items="publicInsightData.kpi_summary" />
        <InsightKeyInsightsList :items="publicInsightData.key_insights" />
        <InsightTopContent :data="publicInsightData.top_content" />
        <InsightChannelInsights :items="publicInsightData.channel_insights" />
        <InsightContentPatterns :items="publicInsightData.content_patterns" />
        <InsightConcentrationAnalysis :data="publicInsightData.concentration_analysis" />
        <InsightDataQuality :data="publicInsightData.data_quality" />
        <InsightRecommendations :items="publicInsightData.recommendations" />
        <InsightClientReadySummary :text="publicInsightData.client_ready_summary" />
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
import type { CampaignReport } from '~/composables/useCampaignReport'
import type { InsightData, InsightType } from '~/composables/useCampaignReportInsight'
import InsightCampaignHealthCard from '~/components/tools/campaign-report/insight/InsightCampaignHealthCard.vue'
import InsightExecutiveSummary from '~/components/tools/campaign-report/insight/InsightExecutiveSummary.vue'
import InsightKpiSummaryGrid from '~/components/tools/campaign-report/insight/InsightKpiSummaryGrid.vue'
import InsightKeyInsightsList from '~/components/tools/campaign-report/insight/InsightKeyInsightsList.vue'
import InsightTopContent from '~/components/tools/campaign-report/insight/InsightTopContent.vue'
import InsightChannelInsights from '~/components/tools/campaign-report/insight/InsightChannelInsights.vue'
import InsightContentPatterns from '~/components/tools/campaign-report/insight/InsightContentPatterns.vue'
import InsightConcentrationAnalysis from '~/components/tools/campaign-report/insight/InsightConcentrationAnalysis.vue'
import InsightDataQuality from '~/components/tools/campaign-report/insight/InsightDataQuality.vue'
import InsightRecommendations from '~/components/tools/campaign-report/insight/InsightRecommendations.vue'
import InsightClientReadySummary from '~/components/tools/campaign-report/insight/InsightClientReadySummary.vue'
import InsightLane from '~/components/tools/campaign-report/insight/InsightLane.vue'

const props = withDefaults(
  defineProps<{
    report: CampaignReport
    readonly?: boolean
    publicInsightData?: InsightData | null
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
