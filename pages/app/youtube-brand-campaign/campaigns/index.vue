<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">Campaigns</h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ isAgency ? 'Create, launch, and monitor your YouTube brand campaigns.' : 'Browse open campaigns and request to join.' }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <NotificationBell :audience="isAgency ? 'agency' : 'creator'" />
        <NuxtLink
          v-if="isAgency"
          to="/app/youtube-brand-campaign/campaigns/new"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + New Campaign
        </NuxtLink>
      </div>
    </div>

    <!-- Agency: segmented tabs + list -->
    <template v-if="isAgency">
      <div class="col-span-12 flex flex-wrap gap-2">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            statusFilter === tab.value
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
          ]"
          @click="statusFilter = tab.value"
        >
          {{ tab.label }} ({{ countFor(tab.value) }})
        </button>
      </div>

      <div v-if="statusFilter === 'draft'" class="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <MetricValue label="Open drafts" :value="draftStats.open" />
        </div>
        <div class="rounded-xl border border-border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <MetricValue label="Ready to launch (>70%)" :value="draftStats.readyToLaunch" />
        </div>
        <div class="rounded-xl border border-border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <MetricValue label="Needs attention (<40%)" :value="draftStats.needsAttention" />
        </div>
      </div>

      <div class="col-span-12">
        <div v-if="loading" class="rounded-xl border border-border bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          Loading…
        </div>
        <div v-else-if="filteredCampaigns.length === 0" class="rounded-xl border border-border bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
          <EmptyState title="Start your first campaign" description="Head to the Creator Discovery to shortlist creators, then launch a campaign." />
        </div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="c in filteredCampaigns"
            :key="c.id"
            class="rounded-xl border border-border bg-white p-4 shadow-theme-xs transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900"
          >
            <div class="flex items-start justify-between gap-3">
              <NuxtLink :to="`/app/youtube-brand-campaign/campaigns/${c.id}`" class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate font-medium text-gray-800 dark:text-white/90">{{ c.name }}</p>
                  <StatusBadge :status="c.status" />
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ c.brand_name }} · {{ formatCurrency(c.total_budget ?? 0, c.currency) }}<span v-if="c.usd_pricing_snapshot?.status === 'ready' && c.currency !== 'USD'"> · ≈ {{ formatCurrency(Number(c.usd_pricing_snapshot.amounts?.total_budget?.converted_amount ?? 0), 'USD') }} (FX {{ c.usd_pricing_snapshot.amounts?.total_budget?.rate_as_of }})</span> ·
                  {{ c.roster_count }} creator{{ c.roster_count === 1 ? '' : 's' }} ·
                  {{ c.product_count }} product{{ c.product_count === 1 ? '' : 's' }} ·
                  {{ c.investment_mix }}
                  <template v-if="c.duration_days"> · {{ c.duration_days }} days</template>
                </p>
                <p class="mt-0.5 text-xs text-gray-400">
                  Updated {{ formatRelative(c.updated_at) }}
                  <template v-if="c.status === 'draft' && c.completeness.missing.length">
                    · Missing: {{ c.completeness.missing.join(', ') }}
                  </template>
                </p>
              </NuxtLink>
              <button
                v-if="c.status === 'draft'"
                type="button"
                class="shrink-0 text-xs font-medium text-error-600 hover:underline"
                @click="askDiscard(c)"
              >
                Discard
              </button>
            </div>
            <div v-if="c.status === 'draft'" class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
              <div class="h-full rounded-full bg-brand-500" :style="{ width: `${c.completeness.percentage}%` }" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Creator: card grid, open campaigns only (release-plan-09 §7.1) -->
    <template v-else>
      <div class="col-span-12">
        <div v-if="openCampaigns.length === 0" class="rounded-xl border border-border bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
          <EmptyState title="No open campaigns right now" description="Check back soon — new brand campaigns open regularly." />
        </div>
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="c in openCampaigns"
            :key="c.id"
            class="cursor-pointer rounded-xl border border-border bg-white p-4 shadow-theme-xs transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900"
            @click="openPreview(c)"
          >
            <div class="flex items-center justify-between">
              <p class="font-medium text-gray-800 dark:text-white/90">{{ c.brand }}</p>
              <StatusBadge status="open" />
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ c.name }}</p>
            <p class="mt-2 text-xs text-gray-400">{{ c.creators.length }} of many slots · closes {{ c.end_date }}</p>
          </div>
        </div>
      </div>
    </template>

    <Modal :is-open="discardTarget !== null" title="Discard draft" size="md" @close="discardTarget = null">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Discard <span class="font-medium text-gray-800 dark:text-white/90">{{ discardTarget?.name }}</span>?
        It disappears from the list; launched campaigns are cancelled instead of discarded.
      </p>
      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
          @click="discardTarget = null"
        >
          Keep draft
        </button>
        <button
          type="button"
          :disabled="discarding"
          class="rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50"
          @click="confirmDiscard"
        >
          {{ discarding ? 'Discarding…' : 'Discard' }}
        </button>
      </template>
    </Modal>

    <PreviewDrawer v-if="!isAgency" v-model:open="isDrawerOpen" :title="activeCampaign?.name ?? ''">
      <template v-if="activeCampaign" #summary>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ activeCampaign.brand }} — {{ activeCampaign.investment_mix }} mix</p>
      </template>
      <template v-if="activeCampaign" #stats>
        <MetricValue label="Budget" :value="formatCurrency(activeCampaign.budget_total, activeCampaign.currency)" />
        <MetricValue label="Ends" :value="activeCampaign.end_date" />
      </template>
      <template #actions>
        <button type="button" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900">
          Request to Join
        </button>
      </template>
      <template #footer-link>
        <NuxtLink :to="`/app/youtube-brand-campaign/campaigns/${activeCampaign?.id}`" class="text-sm font-medium text-brand-600 hover:underline">
          View full brief →
        </NuxtLink>
      </template>
    </PreviewDrawer>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import StatusBadge from '~/components/common/StatusBadge.vue'
import MetricValue from '~/components/common/MetricValue.vue'
import PreviewDrawer from '~/components/campaigns/PreviewDrawer.vue'
import Modal from '~/components/ui/Modal.vue'
import NotificationBell from '~/components/youtubeBrandCampaign/NotificationBell.vue'
import { useEffectiveRole } from '~/composables/youtubeBrandCampaign/useEffectiveRole'
import { useCampaigns } from '~/composables/youtubeBrandCampaign/useCampaigns'
import { useCampaignsApi, type CampaignRecord } from '~/composables/youtubeBrandCampaign/useCampaignsApi'
import { formatCurrency } from '~/utils/youtubeBrandCampaignFormat'
import type { Campaign } from '~/mocks/fixtures/campaigns'

definePageMeta({
  middleware: 'auth',
})

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Campaigns' },
]

const { isAgency } = useEffectiveRole()

// Agency branch: real API (release-plan-20260911-...-r2-campaign-core-v1.md §5).
// Creator branch (below) stays on the mock store — R3 (Applications & Portal) is
// not part of this batch.
const { listOpenForCreators } = useCampaigns()
const { list: apiList, discardDraft } = useCampaignsApi()

type StatusFilter = 'all' | 'draft' | 'active' | 'completed'
const statusTabs: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
const statusFilter = ref<StatusFilter>('all')
const campaigns = ref<CampaignRecord[]>([])
const tabCounts = ref<Record<StatusFilter, number>>({ all: 0, draft: 0, active: 0, completed: 0 })
const loading = ref(true)

async function loadCampaigns() {
  loading.value = true
  try {
    const res = await apiList(statusFilter.value === 'all' ? undefined : statusFilter.value, 1, 100)
    campaigns.value = res.items
  } finally {
    loading.value = false
  }
}

async function loadTabCounts() {
  const results = await Promise.all(statusTabs.map((t) => apiList(t.value === 'all' ? undefined : t.value, 1, 1)))
  const next: Record<StatusFilter, number> = { all: 0, draft: 0, active: 0, completed: 0 }
  statusTabs.forEach((t, i) => { next[t.value] = results[i].total })
  tabCounts.value = next
}

function countFor(status: StatusFilter) {
  return tabCounts.value[status]
}

onMounted(() => {
  if (isAgency.value) {
    loadCampaigns()
    loadTabCounts()
  }
})
watch(statusFilter, () => { if (isAgency.value) loadCampaigns() })

const filteredCampaigns = computed(() => campaigns.value)

const draftStats = computed(() => {
  const drafts = campaigns.value.filter((c) => c.status === 'draft')
  return {
    open: tabCounts.value.draft,
    readyToLaunch: drafts.filter((c) => c.completeness.percentage > 70).length,
    needsAttention: drafts.filter((c) => c.completeness.percentage < 40).length,
  }
})

// Draft discard (doc 04 §1's `draft -> deleted` edge)
const discardTarget = ref<CampaignRecord | null>(null)
const discarding = ref(false)
function askDiscard(campaign: CampaignRecord) {
  discardTarget.value = campaign
}
async function confirmDiscard() {
  if (!discardTarget.value) return
  discarding.value = true
  try {
    await discardDraft(discardTarget.value.id)
    discardTarget.value = null
    await Promise.all([loadCampaigns(), loadTabCounts()])
  } finally {
    discarding.value = false
  }
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString()
}

const openCampaigns = computed(() => listOpenForCreators())
const isDrawerOpen = ref(false)
const activeCampaign = ref<Campaign | null>(null)
function openPreview(c: Campaign) {
  activeCampaign.value = c
  isDrawerOpen.value = true
}
</script>
