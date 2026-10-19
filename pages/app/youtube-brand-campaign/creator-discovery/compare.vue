<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12">
      <h1 class="text-2xl font-bold text-foreground dark:text-white">Compare Creators</h1>
      <p class="text-gray-600 dark:text-gray-400">Comparing {{ selected.length }} creator(s).</p>
      <NuxtLink :to="discovery.listingPath" class="mt-2 inline-block text-sm text-brand-700 underline">Back to results</NuxtLink>
    </div>

    <div v-if="loading" class="col-span-12 rounded-xl border border-border bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
      Loading…
    </div>

    <div v-else-if="compareError" class="col-span-12 rounded-lg border border-error-200 p-4 text-sm text-error-600" role="alert">{{ compareError }} <button type="button" class="underline" @click="loadComparison">Try again</button></div>
    <div v-else-if="selected.length === 0" class="col-span-12">
      <EmptyState
        title="No creators selected"
        description="Go back to Creator Discovery and check 2–3 creators to compare."
        action-label="Back to Creator Discovery"
        @action="navigateTo('/app/youtube-brand-campaign/creator-discovery')"
      />
    </div>

    <div v-else class="col-span-12">
      <p class="mb-3 text-sm text-gray-500">Public samples may have different coverage. Rates are planning references; original currency and available FX context are shown.</p>
      <div class="overflow-x-auto" role="region" aria-label="Creator comparison table" tabindex="0">
      <table class="w-full min-w-[640px] border-collapse overflow-hidden rounded-xl border border-border bg-white text-sm dark:border-gray-800 dark:bg-gray-900">
        <thead>
          <tr class="border-b border-border dark:border-gray-800">
            <th class="p-3 text-left font-medium text-gray-500 dark:text-gray-400">Metric</th>
            <th v-for="c in selected" :key="c.id" scope="col" class="min-w-52 p-3 text-left font-medium text-gray-800 dark:text-white/90"><NuxtLink :to="`/app/youtube-brand-campaign/creator-discovery/${c.id}`" class="block text-brand-700 underline dark:text-brand-300">{{ c.title }}</NuxtLink><button v-if="canManageCampaigns" type="button" class="mt-3 rounded-lg border border-border px-3 py-2 text-xs" @click="openCampaignPicker(c)">Add to campaign</button></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.label" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-3 text-gray-500 dark:text-gray-400">{{ row.label }}</td>
            <td v-for="c in selected" :key="c.id" class="p-3 text-gray-800 dark:text-white/90">{{ row.value(c) }}</td>
          </tr>
        </tbody>
      </table>
      </div>
      <CreatorCampaignPicker v-model="campaignPickerOpen" :profile-id="campaignCreator?.id || ''" :creator-name="campaignCreator?.title || 'Creator'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCreatorDiscoverySessionStore } from '~/stores/creatorDiscovery'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import CreatorCampaignPicker from '~/components/youtubeBrandCampaign/CreatorCampaignPicker.vue'
import { useCreatorDiscovery, type CreatorProfile } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import { formatCompactNumber, formatCurrencyRange } from '~/utils/youtubeBrandCampaignFormat'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'],
})

const route = useRoute()
const auth = useAuthStore()
const discovery = useCreatorDiscoverySessionStore()
const canManageCampaigns = computed(() => ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'].includes(auth.user?.role || ''))
const { compare } = useCreatorDiscovery()

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Creator Discovery', to: '/app/youtube-brand-campaign/creator-discovery' },
  { label: 'Compare' },
]

const selected = ref<CreatorProfile[]>([])
const campaignCreator = ref<CreatorProfile | null>(null)
const campaignPickerOpen = ref(false)
const loading = ref(true)
const compareError = ref('')

function openCampaignPicker(creator: CreatorProfile) {
  campaignCreator.value = creator
  campaignPickerOpen.value = true
}

async function loadComparison() {
  const idsParam = route.query.ids
  const ids = [...new Set(typeof idsParam === 'string' ? idsParam.split(',').filter(Boolean) : [])].slice(0, 3)
  loading.value = true
  compareError.value = ''
  try {
    selected.value = ids.length >= 2 ? await compare(ids) : []
  } catch {
    selected.value = []
    compareError.value = 'Could not load the selected creators. Access may have changed; return to Discovery to review your selection or try again.'
  } finally {
    loading.value = false
  }
}
onMounted(loadComparison)

function topicsOverlap(c: CreatorProfile): string {
  if (selected.value.length < 2) return c.topics.join(', ') || '—'
  const others = selected.value.filter((o) => o.id !== c.id)
  const shared = c.topics.filter((t) => others.some((o) => o.topics.includes(t)))
  return shared.length ? shared.join(', ') : '—'
}

function rateForCompare(c: CreatorProfile, section: 'shorts' | 'longform'): string {
  const entry = c.rate_card?.[section]
  if (!entry) return '—'
  if (!c.rate_card?.currency_verified || !c.rate_card.currency) return 'Currency unverified'
  const original = formatCurrencyRange(entry.min, entry.max, c.rate_card.currency)
  if (c.rate_card.currency === 'USD') return original
  const snapshot = c.rate_card_usd_snapshot
  if (snapshot?.status !== 'ready') return `${original} · USD equivalent unavailable`
  const min = snapshot.entries?.find((item: any) => item.path === `${section}.min`)
  const max = snapshot.entries?.find((item: any) => item.path === `${section}.max`)
  if (!min && !max) return original
  return `${original} · ≈ ${formatCurrencyRange(min?.converted_amount, max?.converted_amount, 'USD')} (FX ${min?.rate_as_of || max?.rate_as_of || 'identity'})`
}

const rows = [
  { label: 'Source', value: (c: CreatorProfile) => (c.sources?.length ? c.sources : [c.source]).map((source) => ({ managed_channel: 'Managed channel', manual_lookup: 'Manual lookup', import: 'Import', brand_deal_report: 'Brand Deal Report' })[source]).join(', ') },
  { label: 'Country', value: (c: CreatorProfile) => c.country || 'Not provided' },
  { label: 'Subscribers', value: (c: CreatorProfile) => formatCompactNumber(c.subscriber_count) },
  { label: 'Total views', value: (c: CreatorProfile) => formatCompactNumber(c.view_count) },
  { label: 'Videos', value: (c: CreatorProfile) => c.video_count ?? '—' },
  { label: 'Avg. views / video', value: (c: CreatorProfile) => formatCompactNumber(c.performance_summary?.avg_views_per_video ?? null) },
  { label: 'Engagement rate', value: (c: CreatorProfile) => { const value = c.performance_summary?.engagement_rate; return value == null || !Number.isFinite(value) ? 'Unavailable' : `${value.toFixed(2)}%` } },
  { label: 'Public sample', value: (c: CreatorProfile) => c.performance_summary?.sample_video_count != null ? `${c.performance_summary.sample_video_count} uploads` : 'Unavailable' },
  { label: 'Metric computation', value: (c: CreatorProfile) => c.performance_summary?.computed_at ? new Date(c.performance_summary.computed_at).toLocaleDateString() : 'Unavailable' },
  { label: 'Profile refreshed', value: (c: CreatorProfile) => c.stats_fetched_at ? new Date(c.stats_fetched_at).toLocaleDateString() : 'Unavailable' },
  { label: 'Rate — Shorts', value: (c: CreatorProfile) => rateForCompare(c, 'shorts') },
  { label: 'Rate — Long-form', value: (c: CreatorProfile) => rateForCompare(c, 'longform') },
  { label: 'Topics overlap', value: topicsOverlap },
]
</script>
