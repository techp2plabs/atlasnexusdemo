<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12">
      <h1 class="text-2xl font-bold text-foreground dark:text-white">Sync from Channels</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Pick which organizations or MCN partners to pull creator bank rows from, then sync. Channels without a
        connected OAuth token still get real public subscriber/view counts and topics.
      </p>
    </div>

    <div class="col-span-12 rounded-xl border border-border bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div v-if="loadingOrgs" class="p-8 text-center text-sm text-gray-400">Loading…</div>

      <div v-else-if="isAdmin" class="flex flex-col gap-1">
        <div v-for="org in organizations" :key="org.id" class="rounded-lg">
          <label class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5">
            <input
              type="checkbox"
              :checked="orgState(org.id) === 'checked'"
              :indeterminate.prop="orgState(org.id) === 'indeterminate'"
              @change="toggleOrg(org)"
            />
            <button type="button" class="text-gray-400" @click.prevent="toggleExpand(org)">
              {{ expandedOrgIds.has(org.id) ? '▾' : '▸' }}
            </button>
            <span class="flex-1 font-medium text-gray-800 dark:text-white/90">{{ org.brand_name || org.name }}</span>
            <span class="text-xs text-gray-400">{{ org.mcn_count ?? 0 }} MCNs · {{ org.channel_count ?? 0 }} channels</span>
          </label>

          <div v-if="expandedOrgIds.has(org.id)" class="ml-10 flex flex-col gap-1 border-l border-gray-100 pl-3 dark:border-gray-800">
            <div v-if="mcnLoading[org.id]" class="py-1 text-xs text-gray-400">Loading MCNs…</div>
            <label
              v-for="mcn in mcnsByOrg[org.id] ?? []"
              :key="mcn.id"
              class="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <input type="checkbox" :checked="isMcnSelected(org.id, mcn.id)" @change="toggleMcn(org, mcn)" />
              <span class="flex-1 text-gray-700 dark:text-gray-300">{{ mcn.name }}</span>
              <span class="text-xs text-gray-400">{{ mcn.channel_count ?? 0 }} channels</span>
            </label>
            <p v-if="!mcnLoading[org.id] && (mcnsByOrg[org.id]?.length ?? 0) === 0" class="py-1 text-xs text-gray-400">No MCNs.</p>
          </div>
        </div>
        <p v-if="organizations.length === 0" class="p-4 text-sm text-gray-400">No organizations found.</p>
      </div>

      <div v-else class="flex flex-col gap-1">
        <label
          v-for="mcn in ownOrgMcns"
          :key="mcn.id"
          class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <input type="checkbox" :checked="selectedMcnIds.has(mcn.id)" @change="toggleOwnOrgMcn(mcn.id)" />
          <span class="flex-1 font-medium text-gray-800 dark:text-white/90">{{ mcn.name }}</span>
          <span class="text-xs text-gray-400">{{ mcn.channel_count ?? 0 }} channels</span>
        </label>
        <p v-if="ownOrgMcns.length === 0" class="p-4 text-sm text-gray-400">No MCN partners found in your organization.</p>
      </div>
    </div>

    <div class="col-span-12 flex items-center justify-between">
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ selectedChannelCount }} channel(s) selected</span>
      <div class="flex gap-2">
        <NuxtLink to="/app/youtube-brand-campaign/creator-discovery" class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200">
          Cancel
        </NuxtLink>
        <button
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          :disabled="syncing || selectedChannelCount === 0"
          @click="runSync"
        >
          {{ syncing ? 'Syncing…' : `Sync ${selectedChannelCount} selected channel(s)` }}
        </button>
      </div>
    </div>

    <div v-if="result" class="col-span-12 rounded-xl border border-success-200 bg-success-50 p-4 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
      Scanned {{ result.channels_scanned }} channels — {{ result.created }} created, {{ result.updated }} updated,
      {{ result.enriched }} enriched with fresh public data.
      <span v-if="result.performance_backfill_queued">
        Avg. views/engagement rate for {{ result.performance_backfill_queued }} creator(s) is computing in the
        background — check back in a minute.
      </span>
      <NuxtLink to="/app/youtube-brand-campaign/creator-discovery" class="ml-2 font-medium underline">Back to Creator Discovery →</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import { useAuthStore } from '~/stores/auth'
import { useOrganizations } from '~/composables/useOrganizations'
import { useMcns } from '~/composables/useMcns'
import { useCreatorDiscovery } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import type { Organization } from '~/types/organization'
import type { MCN } from '~/types/mcn'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'],
})

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Creator Discovery', to: '/app/youtube-brand-campaign/creator-discovery' },
  { label: 'Sync from Channels' },
]

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const { organizations, fetchOrganizations } = useOrganizations()
const { syncFromChannels } = useCreatorDiscovery()

const loadingOrgs = ref(true)
const expandedOrgIds = ref(new Set<string>())
const mcnsByOrg = reactive<Record<string, MCN[]>>({})
const mcnLoading = reactive<Record<string, boolean>>({})

const selectedOrgIds = ref(new Set<string>())
const selectedMcnIds = ref(new Set<string>())

const ownOrgMcns = ref<MCN[]>([])

async function loadMcnsForOrg(orgId: string) {
  if (mcnsByOrg[orgId]) return
  mcnLoading[orgId] = true
  try {
    // Fresh composable instance per call — useMcns() keeps its list in its own
    // local ref, so reusing one shared instance across multiple orgs would
    // have each load overwrite the previous org's list.
    const { mcns, fetchMcns } = useMcns()
    await fetchMcns({ organization_id: orgId, page_size: 100 })
    mcnsByOrg[orgId] = mcns.value
  } finally {
    mcnLoading[orgId] = false
  }
}

async function toggleExpand(org: Organization) {
  if (expandedOrgIds.value.has(org.id)) {
    expandedOrgIds.value.delete(org.id)
  } else {
    expandedOrgIds.value.add(org.id)
    await loadMcnsForOrg(org.id)
  }
}

function orgState(orgId: string): 'checked' | 'indeterminate' | 'unchecked' {
  if (selectedOrgIds.value.has(orgId)) return 'checked'
  const mcns = mcnsByOrg[orgId] ?? []
  if (mcns.some((m) => selectedMcnIds.value.has(m.id))) return 'indeterminate'
  return 'unchecked'
}

function isMcnSelected(orgId: string, mcnId: string): boolean {
  return selectedOrgIds.value.has(orgId) || selectedMcnIds.value.has(mcnId)
}

async function toggleOrg(org: Organization) {
  if (selectedOrgIds.value.has(org.id)) {
    selectedOrgIds.value.delete(org.id)
  } else {
    selectedOrgIds.value.add(org.id)
    if (!expandedOrgIds.value.has(org.id)) {
      await loadMcnsForOrg(org.id)
    }
  }
  for (const mcn of mcnsByOrg[org.id] ?? []) {
    selectedMcnIds.value.delete(mcn.id)
  }
}

function toggleMcn(org: Organization, mcn: MCN) {
  if (selectedOrgIds.value.has(org.id)) {
    // Org was fully selected — switch to granular: keep every other MCN under
    // it selected, drop the one just unchecked.
    selectedOrgIds.value.delete(org.id)
    for (const m of mcnsByOrg[org.id] ?? []) {
      if (m.id !== mcn.id) selectedMcnIds.value.add(m.id)
    }
    return
  }
  if (selectedMcnIds.value.has(mcn.id)) {
    selectedMcnIds.value.delete(mcn.id)
  } else {
    selectedMcnIds.value.add(mcn.id)
  }
}

function toggleOwnOrgMcn(mcnId: string) {
  if (selectedMcnIds.value.has(mcnId)) {
    selectedMcnIds.value.delete(mcnId)
  } else {
    selectedMcnIds.value.add(mcnId)
  }
}

const selectedChannelCount = computed(() => {
  let count = 0
  if (isAdmin.value) {
    for (const org of organizations.value) {
      if (selectedOrgIds.value.has(org.id)) count += org.channel_count ?? 0
    }
    for (const orgId of Object.keys(mcnsByOrg)) {
      if (selectedOrgIds.value.has(orgId)) continue
      for (const mcn of mcnsByOrg[orgId]) {
        if (selectedMcnIds.value.has(mcn.id)) count += mcn.channel_count ?? 0
      }
    }
  } else {
    for (const mcn of ownOrgMcns.value) {
      if (selectedMcnIds.value.has(mcn.id)) count += mcn.channel_count ?? 0
    }
  }
  return count
})

const syncing = ref(false)
const result = ref<{
  channels_scanned: number
  created: number
  updated: number
  enriched: number
  performance_backfill_queued: number
} | null>(null)

async function runSync() {
  syncing.value = true
  result.value = null
  try {
    result.value = await syncFromChannels({
      organizationIds: isAdmin.value ? Array.from(selectedOrgIds.value) : undefined,
      mcnIds: Array.from(selectedMcnIds.value),
    })
  } finally {
    syncing.value = false
  }
}

onMounted(async () => {
  loadingOrgs.value = true
  try {
    if (isAdmin.value) {
      await fetchOrganizations({ page_size: 100 })
    } else if (authStore.user?.organization_id) {
      const { mcns, fetchMcns } = useMcns()
      await fetchMcns({ organization_id: authStore.user.organization_id, page_size: 100 })
      ownOrgMcns.value = mcns.value
    }
  } finally {
    loadingOrgs.value = false
  }
})
</script>
