<template>
  <div class="nexus-home grid grid-cols-12 gap-6">
    <header class="nx-page-header col-span-12">
      <div>
        <div class="nx-scope-trail"><Network :size="14" aria-hidden="true" /><span>{{ scopeLabel }}</span><ChevronRight :size="13" aria-hidden="true" /><span>Overview</span></div>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageSubtitle }}</p>
      </div>
      <div class="nx-button-group">
        <button type="button" class="nx-button" :disabled="overviewBusy" @click="refreshOverview"><RefreshCw :size="15" aria-hidden="true" />{{ overviewBusy ? 'Refreshing…' : 'Refresh overview' }}</button>
        <button v-if="isAdmin" type="button" class="nx-button nx-button-primary" @click="handleInviteOrganization"><Plus :size="16" aria-hidden="true" />Invite organization</button>
      </div>
    </header>
    <div v-if="overviewError" class="nx-error col-span-12" role="alert"><AlertCircle :size="18" aria-hidden="true" /><div><strong>Overview could not be fully updated</strong><p>Some data may be unavailable or from the previous refresh. Try refreshing again.</p></div><button type="button" class="nx-button" :disabled="overviewBusy" @click="refreshOverview">Retry</button></div>

    <!-- Level 1: Platform Admin — Control Tower -->
    <template v-if="isAdmin">
      <DashboardLoading v-if="controlTowerLoading || platformLoading || initializing" class="col-span-12" />

      <template v-else>
        <div class="col-span-12 xl:col-span-7"><NetworkWelcome @invite-organization="handleInviteOrganization" /></div>
        <div class="col-span-12 xl:col-span-5"><ControlTowerQuickActions :pending-count="platformOverviewData?.counts.pending_verifications ?? 0" @invite-organization="handleInviteOrganization" @create-user="handleCreateUser" /></div>
        <ExpiringContractsBanner
          v-if="showExpiringControlTowerBanner"
          :total="expiringContractsTotal"
          subtitle="Review them across the platform to renew or replace before they lapse."
          @dismiss="dismissExpiringControlTowerBanner"
        />

        <div class="col-span-12">
          <PlatformMetrics
            v-if="platformOverviewData"
            :counts="platformOverviewData.counts"
            :pending-invitations-total="platformOverviewData.pending_invitations_total"
          />
        </div>


        <div v-if="platformOverviewData" class="col-span-12 xl:col-span-7">
          <TopChannelsTable :channels="platformOverviewData.top_channels" />
        </div>
        <div v-if="platformOverviewData" class="col-span-12 xl:col-span-5">
          <ChannelDistributionDonut :distribution="platformOverviewData.channel_distribution" />
        </div>


        <div class="col-span-12 xl:col-span-6"><ActivityFeed :activities="activityItems" :loading="activityLoading" :error="activityError" /></div>
        <div v-if="platformOverviewData" class="col-span-12 xl:col-span-6"><DashboardAttention :counts="platformOverviewData.counts" :expiring30d="platformOverviewData.expiring_contracts_30d" :sync-health="platformOverviewData.sync_health" /></div>
        <div class="col-span-12">
          <RecentItems
            :organizations="recentOrganizations"
            :mcns="recentMcns"
            :channels="recentChannels"
          />
        </div>

        <div class="col-span-12">
          <CreatorSuitesSummaryCard :data="creatorSuitesSummary" :loading="creatorSuitesLoading" :error="creatorSuitesError" />
        </div>

        <div class="col-span-12">
          <SystemStatusFooter
            :last-updated="controlTowerLastUpdated"
            :sync-health="platformOverviewData?.sync_health ?? null"
            :refreshing="overviewBusy"
            @refresh="refreshOverview"
          />
        </div>
      </template>
    </template>

    <!-- Level 2: Org Owner / Admin -->
    <template v-else-if="isOrgRole">
      <div class="col-span-12">
        <OrgCommandCenter
          :data="orgData"
          :loading="orgLoading"
          @add-mcn="handleAddMCN"
          @sync-channels="handleSyncChannels"
          @create-user="handleCreateUser"
        />
      </div>
      <div class="col-span-12">
        <ActivityFeed :activities="activityItems" :loading="activityLoading" :error="activityError" />
      </div>
      <div class="col-span-12">
        <CreatorSuitesSummaryCard :data="creatorSuitesSummary" :loading="creatorSuitesLoading" :error="creatorSuitesError" />
      </div>
    </template>

    <!-- Level 3: MCN Operator -->
    <template v-else-if="isMcnOperator">
      <div class="col-span-12">
        <McnOperationsView
          :data="mcnData"
          :loading="mcnLoading"
          @sync-channels="handleSyncChannels"
          @invite-creator="handleInviteCreator"
        />
      </div>
      <div class="col-span-12">
        <ActivityFeed :activities="activityItems" :loading="activityLoading" :error="activityError" />
      </div>
      <div class="col-span-12">
        <CreatorSuitesSummaryCard :data="creatorSuitesSummary" :loading="creatorSuitesLoading" :error="creatorSuitesError" />
      </div>
    </template>

    <!-- Level 4: Creator -->
    <template v-else-if="isCreator">
      <ExpiringContractsBanner
        v-if="showExpiringCreatorBanner"
        :total="expiringCreatorContractsTotal"
        subtitle="Review them to renew or discuss terms before they lapse."
        @dismiss="dismissExpiringCreatorBanner"
      />
      <div class="col-span-12">
        <CreatorStudioView
          :data="creatorData"
          :loading="creatorLoading"
        />
      </div>
      <div class="col-span-12">
        <CreatorSuitesSummaryCard :data="creatorSuitesSummary" :loading="creatorSuitesLoading" :error="creatorSuitesError" />
      </div>
    </template>

    <!-- Modals -->
    <MCNFormModal
      :is-open="isMCNModalOpen"
      :is-edit="false"
      @close="handleCloseMCNModal"
      @success="handleMCNModalSuccess"
    />
    <InviteMCNAdminModal
      :is-open="isInviteMCNAdminModalOpen"
      @close="handleCloseInviteMCNAdminModal"
      @success="handleInviteMCNAdminModalSuccess"
    />
    <InviteCreatorUserModal
      :is-open="isInviteCreatorUserModalOpen"
      @close="handleCloseInviteCreatorUserModal"
      @success="handleInviteCreatorUserModalSuccess"
    />
    <InviteOrganizationOwnerModal
      :is-open="isInviteOrganizationModalOpen"
      @close="handleCloseInviteOrganizationModal"
      @success="handleInviteOrganizationModalSuccess"
    />
    <FetchChannelsModal
      :is-open="isFetchChannelsModalOpen"
      :mcn-id="selectedMcnId"
      @close="handleCloseFetchChannelsModal"
      @success="handleFetchChannelsSuccess"
    />
    <CreateUserModal
      :is-open="isCreateUserModalOpen"
      @close="handleCloseCreateUserModal"
      @success="handleCreateUserModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, ChevronRight, Network, Plus, RefreshCw } from 'lucide-vue-next'
import NetworkWelcome from '~/components/dashboard/NetworkWelcome.vue'
import DashboardAttention from '~/components/dashboard/DashboardAttention.vue'
import DashboardLoading from '~/components/dashboard/DashboardLoading.vue'
import PlatformMetrics from '~/components/dashboard/PlatformMetrics.vue'
import RecentItems from '~/components/dashboard/RecentItems.vue'
import ActivityFeed from '~/components/dashboard/ActivityFeed.vue'
import ControlTowerQuickActions from '~/components/dashboard/ControlTowerQuickActions.vue'
import SystemStatusFooter from '~/components/dashboard/SystemStatusFooter.vue'
import ExpiringContractsBanner from '~/components/dashboard/ExpiringContractsBanner.vue'
import OrgCommandCenter from '~/components/dashboard/OrgCommandCenter.vue'
import McnOperationsView from '~/components/dashboard/McnOperationsView.vue'
import CreatorStudioView from '~/components/dashboard/CreatorStudioView.vue'
import ChannelDistributionDonut from '~/components/dashboard/ChannelDistributionDonut.vue'
import TopChannelsTable from '~/components/dashboard/TopChannelsTable.vue'
import CreatorSuitesSummaryCard from '~/components/dashboard/CreatorSuitesSummaryCard.vue'
import MCNFormModal from '~/components/modals/MCNFormModal.vue'
import InviteMCNAdminModal from '~/components/modals/InviteMCNAdminModal.vue'
import InviteCreatorUserModal from '~/components/modals/InviteCreatorUserModal.vue'
import InviteOrganizationOwnerModal from '~/components/modals/InviteOrganizationOwnerModal.vue'
import FetchChannelsModal from '~/components/modals/FetchChannelsModal.vue'
import CreateUserModal from '~/components/modals/CreateUserModal.vue'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const router = useRouter()

// Role helpers
const userRole = computed(() => authStore.user?.role)
const isAdmin = computed(() => authStore.isAdmin)
const isOrgRole = computed(() => userRole.value === 'org_owner' || userRole.value === 'org_admin')
const isMcnOperator = computed(() => userRole.value === 'mcn_operator')
const isCreator = computed(() => userRole.value === 'creator')

const pageTitle = computed(() => isAdmin.value ? `Welcome back, ${authStore.user?.name || 'Atlas administrator'}` : isCreator.value ? 'Creator overview' : isMcnOperator.value ? 'Network overview' : 'Executive overview')

const pageSubtitle = computed(() => {
  if (isAdmin.value) return 'Your creator ecosystem, in focus.'
  if (isOrgRole.value) return 'Your partner networks, channel portfolio and contract coverage.'
  if (isMcnOperator.value) return 'Channel performance and the operations that keep your network moving.'
  if (isCreator.value) return 'Your channels, performance and contract coverage.'
  return 'Your accessible workspace at a glance.'
})

// --- Control Tower (Admin) ---
const {
  recentOrganizations,
  recentMcns,
  recentChannels,
  loading: controlTowerLoading,
  fetchControlTowerData,
  refresh: refreshControlTower,
} = useControlTower()

const { data: platformOverviewData, loading: platformLoading, error: platformError, fetch: fetchPlatformOverview } = usePlatformOverview()
const controlTowerLastUpdated = ref<Date | null>(null)

// --- Org overview ---
const { data: orgData, loading: orgLoading, error: orgError, fetch: fetchOrgData } = useDashboardOrg()

// --- MCN overview ---
const { data: mcnData, loading: mcnLoading, error: mcnError, fetch: fetchMcnData } = useDashboardMcn()

// --- Creator overview ---
const { data: creatorData, loading: creatorLoading, error: creatorError, fetch: fetchCreatorData } = useDashboardCreator()

// --- Real activity feed (admin: platform-wide; org/MCN: own scope) ---
const { items: activityItems, loading: activityLoading, error: activityError, fetch: fetchActivity } = useDashboardActivity()

// --- Creator Suites summary (all roles that have any tool access) ---
const { data: creatorSuitesSummary, loading: creatorSuitesLoading, error: creatorSuitesError, fetch: fetchCreatorSuitesSummary } = useCreatorSuitesSummary()

const initializing = ref(true)
const refreshingOverview = ref(false)
const overviewBusy = computed(() => initializing.value || refreshingOverview.value || controlTowerLoading.value || platformLoading.value || orgLoading.value || mcnLoading.value || creatorLoading.value)
const overviewError = computed(() => isAdmin.value ? platformError.value : isOrgRole.value ? orgError.value : isMcnOperator.value ? mcnError.value : creatorError.value)
const scopeLabel = computed(() => {
  if (isAdmin.value) return 'Platform workspace'
  if (isOrgRole.value) return orgData.value?.org.name || 'Your organization'
  if (isMcnOperator.value) return mcnData.value?.mcns.length === 1 ? mcnData.value.mcns[0].mcn_name : 'Your partner networks'
  return 'Your channels'
})

const refreshOverview = async () => {
  if (overviewBusy.value) return
  refreshingOverview.value = true
  try {
    if (isAdmin.value) await Promise.all([handleControlTowerRefresh(), fetchExpiringCount(), fetchCreatorSuitesSummary()])
    else if (isOrgRole.value) await Promise.all([fetchOrgData(), fetchActivity(), fetchCreatorSuitesSummary()])
    else if (isMcnOperator.value) await Promise.all([fetchMcnData(), fetchActivity(), fetchCreatorSuitesSummary()])
    else if (isCreator.value) await Promise.all([fetchCreatorData(), fetchCreatorSuitesSummary()])
  } finally {
    refreshingOverview.value = false
  }
}

// --- Expiring contracts banner (admin, platform-wide) ---
const EXPIRING_CONTROL_TOWER_BANNER_KEY = 'atlas_dismiss_expiring_control_tower_banner'
const expiringControlTowerBannerDismissed = ref(false)
const { total: expiringContractsTotal, fetchExpiringCount } = useExpiringContractsCount()

const showExpiringControlTowerBanner = computed(
  () => expiringContractsTotal.value > 0 && !expiringControlTowerBannerDismissed.value,
)

const dismissExpiringControlTowerBanner = () => {
  if (import.meta.client) {
    sessionStorage.setItem(EXPIRING_CONTROL_TOWER_BANNER_KEY, '1')
  }
  expiringControlTowerBannerDismissed.value = true
}

// --- Expiring contracts banner (creator) ---
const EXPIRING_CREATOR_BANNER_KEY = 'atlas_dismiss_expiring_creator_banner'
const expiringCreatorBannerDismissed = ref(false)

const expiringCreatorContractsTotal = computed(() => {
  if (!creatorData.value) return 0
  return creatorData.value.channels.filter((ch) => ch.contract?.status === 'expiring_soon').length
})

const showExpiringCreatorBanner = computed(
  () => expiringCreatorContractsTotal.value > 0 && !expiringCreatorBannerDismissed.value,
)

const dismissExpiringCreatorBanner = () => {
  if (import.meta.client) {
    sessionStorage.setItem(EXPIRING_CREATOR_BANNER_KEY, '1')
  }
  expiringCreatorBannerDismissed.value = true
}

// --- Modal states ---
const isMCNModalOpen = ref(false)
const isInviteMCNAdminModalOpen = ref(false)
const isInviteCreatorUserModalOpen = ref(false)
const isInviteOrganizationModalOpen = ref(false)
const isFetchChannelsModalOpen = ref(false)
const isCreateUserModalOpen = ref(false)
const selectedMcnId = ref<string | undefined>(undefined)

// --- Modal handlers ---
const handleAddMCN = () => { isMCNModalOpen.value = true }
const handleCloseMCNModal = () => { isMCNModalOpen.value = false }
const handleMCNModalSuccess = async () => {
  isMCNModalOpen.value = false
  useToast().success('MCN created successfully')
  if (isAdmin.value) await Promise.all([refreshControlTower(), fetchActivity()])
  else if (isOrgRole.value) await fetchOrgData()
  else if (isMcnOperator.value) await fetchMcnData()
}

const handleInviteCreator = () => { isInviteCreatorUserModalOpen.value = true }
const handleCloseInviteCreatorUserModal = () => { isInviteCreatorUserModalOpen.value = false }
const handleInviteCreatorUserModalSuccess = async () => {
  isInviteCreatorUserModalOpen.value = false
  useToast().success('Creator User invited successfully')
  if (isAdmin.value) await Promise.all([refreshControlTower(), fetchActivity()])
  else if (isMcnOperator.value) await fetchMcnData()
}

const handleInviteMCNOperator = () => { isInviteMCNAdminModalOpen.value = true }
const handleCloseInviteMCNAdminModal = () => { isInviteMCNAdminModalOpen.value = false }
const handleInviteMCNAdminModalSuccess = async () => {
  isInviteMCNAdminModalOpen.value = false
  useToast().success('MCN Admin invited successfully')
  if (isAdmin.value) await Promise.all([refreshControlTower(), fetchActivity()])
}

const handleInviteOrganization = () => { isInviteOrganizationModalOpen.value = true }
const handleCloseInviteOrganizationModal = () => { isInviteOrganizationModalOpen.value = false }
const handleInviteOrganizationModalSuccess = async () => {
  isInviteOrganizationModalOpen.value = false
  useToast().success('Organization Owner invited successfully')
  await Promise.all([refreshControlTower(), fetchActivity()])
}

const handleControlTowerRefresh = async () => {
  await Promise.all([refreshControlTower(), fetchActivity()])
  await fetchPlatformOverview()
  if (!platformError.value) controlTowerLastUpdated.value = new Date()
}

const handleCreateUser = () => { isCreateUserModalOpen.value = true }
const handleCloseCreateUserModal = () => { isCreateUserModalOpen.value = false }
const handleCreateUserModalSuccess = async () => {
  isCreateUserModalOpen.value = false
  useToast().success('User created successfully')
  if (isAdmin.value) await Promise.all([refreshControlTower(), fetchActivity()])
  else if (isOrgRole.value) await fetchOrgData()
}

const handleSyncChannels = () => {
  const mcnId = authStore.user?.mcn_id
  if (isMcnOperator.value && mcnId) {
    selectedMcnId.value = mcnId
    isFetchChannelsModalOpen.value = true
  } else {
    router.push('/app/mcns')
    useToast().info('Please select an MCN to sync channels')
  }
}

const handleCloseFetchChannelsModal = () => {
  isFetchChannelsModalOpen.value = false
  selectedMcnId.value = undefined
}

const handleFetchChannelsSuccess = async () => {
  isFetchChannelsModalOpen.value = false
  selectedMcnId.value = undefined
  useToast().success('Channels synced successfully')
  if (isMcnOperator.value) await fetchMcnData()
  else if (isOrgRole.value) await fetchOrgData()
}

// --- Initialize ---
onMounted(async () => {
  try {
    if (isAdmin.value) {
      if (import.meta.client) {
        expiringControlTowerBannerDismissed.value =
          sessionStorage.getItem(EXPIRING_CONTROL_TOWER_BANNER_KEY) === '1'
      }
      await Promise.all([
        fetchControlTowerData(),
        fetchPlatformOverview(), fetchActivity(),
        fetchExpiringCount(),
        fetchCreatorSuitesSummary(),
      ])
      if (!platformError.value) controlTowerLastUpdated.value = new Date()
    } else if (isOrgRole.value) {
      await Promise.all([fetchOrgData(), fetchActivity(), fetchCreatorSuitesSummary()])
    } else if (isMcnOperator.value) {
      await Promise.all([fetchMcnData(), fetchActivity(), fetchCreatorSuitesSummary()])
    } else if (isCreator.value) {
      if (import.meta.client) {
        expiringCreatorBannerDismissed.value =
          sessionStorage.getItem(EXPIRING_CREATOR_BANNER_KEY) === '1'
      }
      await Promise.all([fetchCreatorData(), fetchCreatorSuitesSummary()])
    }
  } finally {
    initializing.value = false
  }
})

// Re-fetch org/mcn data when relevant modals close
watch(isMCNModalOpen, async (isOpen) => {
  if (!isOpen && isOrgRole.value) await fetchOrgData()
})
watch(isInviteOrganizationModalOpen, async (isOpen) => {
  if (!isOpen && isAdmin.value) {
    await Promise.all([refreshControlTower(), fetchActivity()])
    await fetchPlatformOverview()
  }
})
</script>

<style src="~/assets/css/nexus-home.css"></style>
