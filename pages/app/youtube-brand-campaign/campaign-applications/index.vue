<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ isAgency ? 'Applications' : 'My Applications' }}</h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ isAgency ? 'Review and decide on creator applications across your campaigns.' : 'Track the status of the campaigns you applied to.' }}
        </p>
      </div>
      <NotificationBell :audience="isAgency ? 'agency' : 'creator'" />
    </div>

    <!-- Agency: review queue, segmented by state machine (release-plan-09 §6.1) -->
    <template v-if="isAgency">
      <div class="col-span-12 flex flex-wrap gap-2">
        <button
          v-for="tab in agencyTabs"
          :key="tab.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            agencyFilter === tab.value
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
          ]"
          @click="agencyFilter = tab.value"
        >
          {{ tab.label }} ({{ countAgency(tab.value) }})
        </button>
      </div>

      <div class="col-span-12">
        <div v-if="filteredAgencyApps.length === 0" class="rounded-xl border border-border bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
          <EmptyState title="Nothing here yet" description="Applications will show up as creators apply to your open campaigns." />
        </div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="app in filteredAgencyApps"
            :key="app.id"
            class="cursor-pointer rounded-xl border border-border bg-white p-4 shadow-theme-xs transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900"
            @click="openPreview(app)"
          >
            <div class="flex items-center justify-between">
              <p class="font-medium text-gray-800 dark:text-white/90">{{ app.creator_name }}</p>
              <StatusBadge :status="app.status" />
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ app.campaign_name }}</p>
            <p class="mt-1 text-xs text-gray-400">{{ app.creator_handle }} · {{ app.compensation_type }} · submitted {{ formatDate(app.submitted_at) }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Creator: own applications only, no decisions (release-plan-09 §7.4) -->
    <template v-else>
      <div class="col-span-12">
        <div v-if="myApplications.length === 0" class="rounded-xl border border-border bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
          <EmptyState title="No applications yet" description="Browse open campaigns and request to join one." />
        </div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="app in myApplications"
            :key="app.id"
            class="cursor-pointer rounded-xl border border-border bg-white p-4 shadow-theme-xs transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900"
            @click="openPreview(app)"
          >
            <div class="flex items-center justify-between">
              <p class="font-medium text-gray-800 dark:text-white/90">{{ app.campaign_name }}</p>
              <StatusBadge :status="app.status" />
            </div>
            <p class="mt-1 text-xs text-gray-400">{{ app.compensation_type }} · submitted {{ formatDate(app.submitted_at) }}</p>
          </div>
        </div>
      </div>
    </template>

    <PreviewDrawer v-model:open="isDrawerOpen" :title="activeApp?.creator_name ?? activeApp?.campaign_name ?? ''">
      <template v-if="activeApp" #summary>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ activeApp.campaign_name }}</p>
        <p class="text-xs text-gray-400">{{ activeApp.channel_url }}</p>
      </template>
      <template v-if="activeApp" #stats>
        <MetricValue label="Compensation" :value="activeApp.compensation_type" />
        <div v-if="activeApp.compensation_type === 'rate_card'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Original offer: {{ activeApp.rate_shorts ?? '—' }} Shorts / {{ activeApp.rate_longform ?? '—' }} long-form {{ activeApp.rate_currency || 'Currency unverified' }}</p>
          <p v-for="line in activeApp.pricing_snapshot?.lines || []" :key="line.format">{{ line.format }}: {{ line.campaign?.converted_amount }} {{ line.campaign?.converted_currency }} · {{ line.usd?.converted_amount }} USD · FX {{ line.campaign?.rate_as_of || line.usd?.rate_as_of || 'identity' }} · converted {{ line.campaign?.converted_at }}</p>
          <p v-if="activeApp.pricing_snapshot?.status === 'pending'" class="text-amber-700">FX quote pending; approval will require a valid quote.</p>
        </div>
        <MetricValue label="Status" :value="activeApp.status" />
        <template v-if="activeApp.eligibility?.status === 'completed'">
          <MetricValue label="Fit score" :value="activeApp.eligibility.fit_score ?? '—'" />
          <MetricValue label="GMV potential" :value="activeApp.eligibility.gmv_potential_rating ?? '—'" />
        </template>
      </template>
      <template v-if="isAgency && activeApp?.status === 'pending_brand'" #actions>
        <button type="button" :disabled="isPreviewing" class="rounded-lg border border-error-300 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50" @click="reject(activeApp!.id)">
          Reject
        </button>
        <button type="button" :disabled="isPreviewing" class="rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600 disabled:cursor-not-allowed disabled:opacity-50" @click="approve(activeApp!.id)">
          Approve
        </button>
      </template>
      <template v-else-if="!isAgency && activeApp?.status === 'approved'" #actions>
        <button type="button" :disabled="isPreviewing" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" @click="runAnalysis(activeApp!.id)">
          Run Eligibility Analysis
        </button>
      </template>
      <template v-else-if="!isAgency && ['eligible', 'needs_review'].includes(activeApp?.status ?? '')" #actions>
        <button type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" @click="openCampaign(activeApp!.campaign_id)">
          Open campaign &amp; get upload code
        </button>
      </template>
      <template v-else-if="!isAgency && activeApp?.eligibility?.status === 'processing'" #actions>
        <p class="text-sm text-gray-500 dark:text-gray-400">Eligibility analysis running — we'll notify you.</p>
      </template>
      <template v-else-if="!isAgency && activeApp?.status === 'pending_brand'" #actions>
        <button type="button" :disabled="isPreviewing" class="rounded-lg border border-error-300 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50" @click="withdraw(activeApp!.id)">
          Withdraw
        </button>
      </template>
    </PreviewDrawer>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import StatusBadge from '~/components/common/StatusBadge.vue'
import MetricValue from '~/components/common/MetricValue.vue'
import PreviewDrawer from '~/components/campaigns/PreviewDrawer.vue'
import NotificationBell from '~/components/youtubeBrandCampaign/NotificationBell.vue'
import { useAuthStore } from '~/stores/auth'
import { useEffectiveRole } from '~/composables/youtubeBrandCampaign/useEffectiveRole'
import { useApplications } from '~/composables/youtubeBrandCampaign/useApplications'
import type { ApplicationStatus, CampaignApplication } from '~/mocks/fixtures/applications'

definePageMeta({
  middleware: 'auth',
})

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Applications' },
]

const authStore = useAuthStore()
const { isAgency, isPreviewing } = useEffectiveRole()

const {
  listForAgency, listForCreator,
  approve: approveApp, reject: rejectApp, withdraw: withdrawApp,
  runEligibilityAnalysis,
} = useApplications()

const agencyTabs: { label: string; value: 'pending' | 'under_review' | 'decided' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Decided', value: 'decided' },
]
const agencyFilter = ref<'pending' | 'under_review' | 'decided'>('pending')

const GROUP: Record<ApplicationStatus, 'pending' | 'under_review' | 'decided'> = {
  pending_brand: 'pending',
  approved: 'under_review',
  under_analysis: 'under_review',
  needs_review: 'under_review',
  eligible: 'decided',
  not_eligible: 'decided',
  rejected: 'decided',
  withdrawn: 'decided',
}

const allAgencyApps = computed(() => listForAgency())
const filteredAgencyApps = computed(() => allAgencyApps.value.filter((a) => GROUP[a.status] === agencyFilter.value))
function countAgency(group: 'pending' | 'under_review' | 'decided') {
  return allAgencyApps.value.filter((a) => GROUP[a.status] === group).length
}

// `GET /api/v1/campaign-applications` is role-branched server-side, so this is
// already "my applications" for a creator caller — see useApplications.ts.
const myApplications = computed(() => listForCreator(authStore.user?.email ?? ''))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const isDrawerOpen = ref(false)
const activeApp = ref<CampaignApplication | null>(null)
function openPreview(app: CampaignApplication) {
  activeApp.value = app
  isDrawerOpen.value = true
}
function approve(id: string) {
  if (isPreviewing.value) return
  approveApp(id)
  isDrawerOpen.value = false
}
function reject(id: string) {
  if (isPreviewing.value) return
  rejectApp(id)
  isDrawerOpen.value = false
}
function withdraw(id: string) {
  if (isPreviewing.value) return
  withdrawApp(id)
  isDrawerOpen.value = false
}
function runAnalysis(id: string) {
  if (isPreviewing.value) return
  runEligibilityAnalysis(id)
}
function openCampaign(campaignId: string) {
  isDrawerOpen.value = false
  navigateTo(`/app/youtube-brand-campaign/campaigns/${campaignId}`)
}
</script>
