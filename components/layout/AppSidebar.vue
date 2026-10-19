<template>
  <aside
    ref="sidebarElement"
    tabindex="-1"
    :aria-modal="isMobileOpen ? true : undefined"
    :role="isMobileOpen ? 'dialog' : undefined"
    aria-label="Workspace navigation"
    class="nexus-sidebar"
    :class="[
      'fixed mt-14 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-40 border-r border-gray-100 shadow-sm',
      {
        'lg:w-[256px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[72px]': !isExpanded && !isHovered,
        'translate-x-0 w-[256px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    :style="{ width: isExpanded || isMobileOpen || isHovered ? '256px' : '72px' }"
    @mouseenter="!isExpanded && setIsHovered(true)"
    @mouseleave="setIsHovered(false)"
    @focusin="showRailTooltip"
    @focusout="clearRailTooltip"
  >
    <div class="nx-sidebar-brand flex items-center justify-center lg:justify-start">
      <NuxtLink to="/app/home"
              aria-label="Atlas Nexus home" class="flex items-center gap-2.5 w-full group">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          src="/atlas-nexus-logo.png"
          alt="Atlas Nexus"
          class="h-9 w-auto max-w-[196px]"
        />
        <img
          v-else
          src="/atlas-nexus-icon.png"
          alt="Atlas Nexus"
          class="w-9 h-9 flex-shrink-0"
        />
      </NuxtLink>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <ul class="flex flex-col gap-3">
          <li
            v-if="isExpanded || isHovered || isMobileOpen"
            class="nx-sidebar-group px-3 flex items-center justify-between select-none"
          >
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Workspace</span>
          </li>
          <!-- Home -->
          <li>
            <NuxtLink
              to="/app/home"
              aria-label="Home"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/home'),
                  'menu-item-inactive': !isActive('/app/home'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/home')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="HomeIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Home</span
              >
            </NuxtLink>
          </li>

          <li v-if="campaignNavigation.length && (isExpanded || isHovered || isMobileOpen)" class="nx-sidebar-group px-3 select-none">
            <span>YouTube Brand Campaign</span>
          </li>

          <li v-if="!isExpanded && !isHovered && !isMobileOpen" class="nx-sidebar-separator" aria-hidden="true"><span /></li>
          <!-- Direct production workflows; no parent/group collapse state. -->
          <li v-for="item in campaignNavigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              :aria-label="item.label"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              :title="!isExpanded && !isHovered && !isMobileOpen ? item.label : undefined"
              :class="['menu-item group', isActive(item.to) ? 'menu-item-active' : 'menu-item-inactive']"
            >
              <span :class="isActive(item.to) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'">
                <component :is="campaignIcons[item.icon]" aria-hidden="true" />
              </span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{ item.label }}</span>
            </NuxtLink>
          </li>

          <li v-if="isExpanded || isHovered || isMobileOpen" class="nx-sidebar-group px-3 select-none">
            <span>Insights</span>
          </li>

          <li v-if="!isExpanded && !isHovered && !isMobileOpen" class="nx-sidebar-separator" aria-hidden="true"><span /></li>
          <!-- Analytics -->
          <li v-if="canViewAnalytics">
            <NuxtLink
              to="/app/analytics"
              aria-label="Analytics"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/analytics'),
                  'menu-item-inactive': !isActive('/app/analytics'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/analytics')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="PieChartIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Analytics</span
              >
            </NuxtLink>
          </li>

          <!-- Creator Suites -->
          <li>
            <NuxtLink
              to="/app/creator-suites"
              aria-label="Creator Suites"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/creator-suites'),
                  'menu-item-inactive': !isActive('/app/creator-suites'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/creator-suites')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="ToolsIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Creator Suites</span
              >
            </NuxtLink>
          </li>

          <li v-if="!isExpanded && !isHovered && !isMobileOpen" class="nx-sidebar-separator" aria-hidden="true"><span /></li>
          <!-- ENTITIES -->
          <li
            v-if="isExpanded || isHovered || isMobileOpen"
            class="nx-sidebar-group px-3 pt-2 flex items-center justify-between select-none"
          >
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Ecosystem</span>
          </li>

          <!-- Organizations -->
          <li v-if="canViewOrganizations">
            <NuxtLink
              to="/app/organizations"
              aria-label="Organizations"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/organizations'),
                  'menu-item-inactive': !isActive('/app/organizations'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/organizations')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="BuildingIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Organizations</span
              >
            </NuxtLink>
          </li>

          <!-- MCNs -->
          <li v-if="canViewMcns">
            <NuxtLink
              to="/app/mcns"
              aria-label="Partner networks"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/mcns'),
                  'menu-item-inactive': !isActive('/app/mcns'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/mcns')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="BoxIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Partner networks</span
              >
            </NuxtLink>
          </li>

          <!-- Channels -->
          <li>
            <NuxtLink
              to="/app/channels"
              aria-label="Channels"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/channels'),
                  'menu-item-inactive': !isActive('/app/channels'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/channels')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="YoutubeIcon" class="h-[18px] w-[18px]" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Channels</span
              >
            </NuxtLink>
          </li>

          <!-- Contracts (view for creators; full access for org/MCN/atlas roles) -->
          <li v-if="canViewContractsNav">
            <NuxtLink
              to="/app/contracts"
              aria-label="Contracts"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/contracts'),
                  'menu-item-inactive': !isActive('/app/contracts'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/contracts')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="ContractIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Contracts</span
              >
            </NuxtLink>
          </li>

          <!-- Reports — hidden from sidebar; route /app/reports remains accessible via URL -->
          <!--
          <li v-if="canViewReports">
            <NuxtLink
              to="/app/reports"
              aria-label="Reports"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/reports'),
                  'menu-item-inactive': !isActive('/app/reports'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/reports')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="PieChartIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Reports</span
              >
            </NuxtLink>
          </li>
          -->

          <li
            v-if="(isExpanded || isHovered || isMobileOpen) && canViewUsers"
            class="nx-sidebar-group px-3 pt-2 flex items-center justify-between select-none"
          >
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Management</span>
          </li>
          <li v-if="!isExpanded && !isHovered && !isMobileOpen" class="nx-sidebar-separator" aria-hidden="true"><span /></li>
          <!-- Users -->
          <li v-if="canViewUsers">
            <NuxtLink
              to="/app/users"
              aria-label="Users"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isUsersNavActive(),
                  'menu-item-inactive': !isUsersNavActive(),
                },
              ]"
            >
              <span
                :class="[
                  isUsersNavActive()
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="UserCircleIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Users</span
              >
            </NuxtLink>
          </li>

          <li v-if="canViewOnboardingQueues">
            <NuxtLink to="/app/users/agency-access-requests" aria-label="Agency requests" :aria-current="isActive('/app/users/agency-access-requests') ? 'page' : undefined" :title="!isExpanded && !isHovered && !isMobileOpen ? 'Agency requests' : undefined" :class="['menu-item group', isActive('/app/users/agency-access-requests') ? 'menu-item-active' : 'menu-item-inactive']">
              <span :class="isActive('/app/users/agency-access-requests') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'"><component :is="AgencyRequestsIcon" aria-hidden="true" /></span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">Agency requests</span>
            </NuxtLink>
          </li>
          <li v-if="canViewOnboardingQueues">
            <NuxtLink to="/app/users/brand-waitlist" aria-label="Brand waitlist" :aria-current="isActive('/app/users/brand-waitlist') ? 'page' : undefined" :title="!isExpanded && !isHovered && !isMobileOpen ? 'Brand waitlist' : undefined" :class="['menu-item group', isActive('/app/users/brand-waitlist') ? 'menu-item-active' : 'menu-item-inactive']">
              <span :class="isActive('/app/users/brand-waitlist') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'"><component :is="BrandWaitlistIcon" aria-hidden="true" /></span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">Brand waitlist</span>
            </NuxtLink>
          </li>
          <li v-if="canViewOnboardingQueues">
            <NuxtLink to="/app/users/onboarding-metrics" aria-label="Onboarding metrics" :aria-current="isActive('/app/users/onboarding-metrics') ? 'page' : undefined" :title="!isExpanded && !isHovered && !isMobileOpen ? 'Onboarding metrics' : undefined" :class="['menu-item group', isActive('/app/users/onboarding-metrics') ? 'menu-item-active' : 'menu-item-inactive']">
              <span :class="isActive('/app/users/onboarding-metrics') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'"><component :is="OnboardingMetricsIcon" aria-hidden="true" /></span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">Onboarding metrics</span>
            </NuxtLink>
          </li>
          <li v-if="authStore.user?.role === 'creator'">
            <NuxtLink to="/app/creator/channel-link-requests" aria-label="Channel access requests" :aria-current="isActive('/app/creator/channel-link-requests') ? 'page' : undefined" :class="['menu-item group', isActive('/app/creator/channel-link-requests') ? 'menu-item-active' : 'menu-item-inactive']">
              <span :class="isActive('/app/creator/channel-link-requests') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'"><component :is="LinkIcon" aria-hidden="true" /></span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">Channel requests</span>
            </NuxtLink>
          </li>
          <!-- Invitations -->
          <li v-if="canViewUsers">
            <NuxtLink
              to="/app/users/invites"
              aria-label="Invitations"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isInvitesNavActive(),
                  'menu-item-inactive': !isInvitesNavActive(),
                },
              ]"
            >
              <span
                :class="[
                  isInvitesNavActive()
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="PageIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Invitations</span
              >
            </NuxtLink>
          </li>
          <li
            v-if="isExpanded || isHovered || isMobileOpen"
            class="nx-sidebar-group px-3 pt-2 flex items-center justify-between select-none"
          >
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Settings</span>
          </li>
          <li v-if="!isExpanded && !isHovered && !isMobileOpen" class="nx-sidebar-separator" aria-hidden="true"><span /></li>
          <li>
            <NuxtLink
              to="/app/account"
              aria-label="Account"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/account'),
                  'menu-item-inactive': !isActive('/app/account'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/account')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="SettingsIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Account</span
              >
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink
              to="/app/settings/creator-suites"
              aria-label="Creator Suites Management"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/settings/creator-suites'),
                  'menu-item-inactive': !isActive('/app/settings/creator-suites'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/settings/creator-suites')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="ToolsIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Creator Suites Management</span
              >
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink
              to="/app/settings/pages"
              aria-label="Pages"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/settings/pages'),
                  'menu-item-inactive': !isActive('/app/settings/pages'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/settings/pages')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="PageIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Pages</span
              >
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink
              to="/app/settings/email-templates"
              aria-label="Email Templates"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/settings/email-templates'),
                  'menu-item-inactive': !isActive('/app/settings/email-templates'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/settings/email-templates')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="ListIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Email Templates</span
              >
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink
              to="/app/settings/youtube-api"
              aria-label="YouTube API"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/settings/youtube-api'),
                  'menu-item-inactive': !isActive('/app/settings/youtube-api'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/settings/youtube-api')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="YoutubeIcon" class="h-[18px] w-[18px]" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >YouTube API</span
              >
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink
              to="/app/settings/release-notes"
              aria-label="Release Notes"
              :class="[
                'menu-item group',
                {
                  'menu-item-active': isActive('/app/settings/release-notes'),
                  'menu-item-inactive': !isActive('/app/settings/release-notes'),
                },
              ]"
            >
              <span
                :class="[
                  isActive('/app/settings/release-notes')
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive',
                ]"
              >
                <component :is="ReleaseNotesIcon" />
              </span>
              <span
                v-if="isExpanded || isHovered || isMobileOpen"
                class="menu-item-text"
                >Release Notes</span
              >
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink to="/apps/youtube-brand-campaign-prototype"
              aria-label="YouTube Brand Campaign prototype" title="YouTube Brand Campaign prototype"
              :class="['menu-item group', isActive('/apps/youtube-brand-campaign-prototype') ? 'menu-item-active' : 'menu-item-inactive']">
              <span class="menu-item-icon-inactive"><YoutubeIcon aria-hidden="true" /></span>
              <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">Campaign prototype</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Organization Filter (Hidden - Not currently used)
      <div
        v-if="orgFilter.isSuperadmin && (isExpanded || isHovered || isMobileOpen)"
        class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800"
      >
        <div class="px-3">
          <label
            class="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Filter by Organization
          </label>
          <select
            v-model="orgFilter.selectedOrganizationId"
            @change="orgFilter.setSelectedOrganization(orgFilter.selectedOrganizationId)"
            class="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            :disabled="orgFilter.loading"
          >
            <option :value="null">All Organizations</option>
            <option
              v-for="org in orgFilter.organizations"
              :key="org.id"
              :value="org.id"
            >
              {{ org.name }}
            </option>
          </select>
        </div>
      </div>
      -->
    </div>
    <div v-if="railTooltip && !isExpanded && !isHovered && !isMobileOpen"
      id="workspace-rail-tooltip" role="tooltip"
      class="fixed left-[80px] z-50 max-w-56 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
      :style="{ top: `${railTooltip.top}px` }">{{ railTooltip.label }}</div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, nextTick, ref, watch } from 'vue'
import {
  Home as HomeIcon,
  Building2 as BuildingIcon,
  Boxes as BoxIcon,
  CircleUserRound as UserCircleIcon,
  FileSignature as ContractIcon,
  ChartPie as PieChartIcon,
  FileText as PageIcon,
  Settings2 as SettingsIcon,
  Wrench as ToolsIcon,
  Search as DiscoveryIcon,
  Megaphone as CampaignIcon,
  ClipboardList as ApplicationsIcon,
  List as ListIcon,
  Youtube as YoutubeIcon,
  ScrollText as ReleaseNotesIcon,
  ClipboardCheck as AgencyRequestsIcon,
  Inbox as BrandWaitlistIcon,
  ChartNoAxesCombined as OnboardingMetricsIcon,
  Link as LinkIcon,
} from 'lucide-vue-next'
import { getCampaignNavigation, isNavigationActive } from '~/utils/workspaceNavigation'
import { useSidebar } from '~/composables/useSidebar'
import { useAuthStore } from '~/stores/auth'
import { useOrganizationFilter } from '~/composables/useOrganizationFilter'

const route = useRoute()
const authStore = useAuthStore()
const orgFilter = useOrganizationFilter()

const {
  isExpanded,
  isMobileOpen,
  isHovered,
  toggleMobileSidebar,
  setIsHovered,
} = useSidebar()

const campaignNavigation = computed(() => getCampaignNavigation(authStore.user?.role))
const campaignIcons = { discovery: DiscoveryIcon, campaigns: CampaignIcon, applications: ApplicationsIcon }
const isActive = (path: string) => isNavigationActive(route.path, path)

/** Users list / verify — not the invitations sub-section */
const isUsersNavActive = () => {
  const p = route.path
  if (p.startsWith('/app/creator/channel-link-requests') || p.startsWith('/app/users/invites') || p.startsWith('/app/users/agency-access-requests') || p.startsWith('/app/users/brand-waitlist') || p.startsWith('/app/users/onboarding-metrics')) return false
  return p.startsWith('/app/users')
}

const isInvitesNavActive = () => route.path.startsWith('/app/users/invites')

// Role-based visibility
const canViewOrganizations = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin'
  )
})

const canViewMcns = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator'
  )
})

const canViewUsers = computed(() => authStore.canManageUsersAndInvites)

const canViewOnboardingQueues = computed(() => ['atlas_admin', 'atlas_superadmin'].includes(authStore.user?.role || ''))

/** Reports (not for creators). */
const canViewReports = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator'
  )
})

/** Analytics — all roles including creator (creators see their own channels). */
const canViewAnalytics = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator' ||
    role === 'creator'
  )
})

/** Contracts list: creators see channel-scoped contracts read-only from API. */
const canViewContractsNav = computed(() => {
  const role = authStore.user?.role
  return canViewReports.value || role === 'creator'
})

const isAdmin = computed(() => {
  const role = authStore.user?.role
  return role === 'atlas_superadmin' || role === 'atlas_admin'
})

// Fetch organizations on mount if superadmin
onMounted(() => {
  if (orgFilter.isSuperadmin) {
    orgFilter.fetchOrganizations()
  }
})
const sidebarElement = ref<HTMLElement | null>(null)
const railTooltip = ref<{ label: string; top: number } | null>(null)
let tooltipTarget: HTMLElement | null = null
const clearRailTooltip = () => {
  tooltipTarget?.removeAttribute('aria-describedby')
  tooltipTarget = null
  railTooltip.value = null
}
const showRailTooltip = (event: FocusEvent) => {
  clearRailTooltip()
  if (isExpanded.value || isHovered.value || isMobileOpen.value) return
  const target = (event.target as HTMLElement)?.closest<HTMLElement>('a[aria-label]')
  if (!target) return
  tooltipTarget = target
  target.setAttribute('aria-describedby', 'workspace-rail-tooltip')
  railTooltip.value = { label: target.getAttribute('aria-label') || '', top: Math.min(target.getBoundingClientRect().top, window.innerHeight - 48) }
}
watch([isExpanded, isHovered, isMobileOpen], clearRailTooltip)

const { setLocked } = useBodyScrollLock()
let opener: HTMLElement | null = null
watch(isMobileOpen, async (open) => {
  setLocked(open)
  if (open) {
    opener = document.activeElement as HTMLElement
    await nextTick()
    sidebarElement.value?.focus()
  } else {
    await nextTick()
    opener?.focus()
  }
})
watch(() => route.path, () => { if (isMobileOpen.value) toggleMobileSidebar() })
const handleNavigationKey = (event: KeyboardEvent) => {
  if (!isMobileOpen.value || !sidebarElement.value) return
  if (event.key === 'Escape') { event.preventDefault(); toggleMobileSidebar(); return }
  if (event.key !== 'Tab') return
  const controls = Array.from(sidebarElement.value.querySelectorAll<HTMLElement>('a[href],button,[tabindex="0"]')).filter(el => el.getClientRects().length > 0)
  const first = controls[0], last = controls[controls.length - 1]
  if (!first) { event.preventDefault(); return }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === sidebarElement.value)) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && (document.activeElement === last || !sidebarElement.value.contains(document.activeElement))) { event.preventDefault(); first.focus() }
}
onMounted(() => document.addEventListener('keydown', handleNavigationKey))
onUnmounted(() => document.removeEventListener('keydown', handleNavigationKey))
</script>

<style scoped>
.nexus-sidebar { font-family: var(--atlas-font-ui); background: var(--card); color: var(--foreground); border-color: var(--border); box-shadow: none; }
.nexus-sidebar .nx-sidebar-brand { padding: 16px 8px; min-height: 80px; border-bottom: 1px solid var(--border); }
.nexus-sidebar .nx-sidebar-brand img { max-width: 100%; object-fit: contain; object-position: left center; }
.nexus-sidebar nav > ul { gap: 4px; }
.nexus-sidebar .nx-sidebar-separator { height: 1px; margin: 5px 8px; border-top: 1px solid color-mix(in srgb, var(--border) 76%, transparent); }
.nexus-sidebar .nx-sidebar-separator span { display: none; }
.nexus-sidebar .nx-sidebar-group { padding: 20px 12px 8px; }
.nexus-sidebar nav > ul > .nx-sidebar-group:first-child { padding-top: 16px; }
.nexus-sidebar .nx-sidebar-group > span { color: var(--nx-muted); font-size: 12px; font-weight: 400; letter-spacing: 0; text-transform: none; }
.nexus-sidebar .menu-item { min-height: 40px; border-radius: var(--atlas-radius-control); font-size: 13px; font-weight: 400; padding: 9px 12px; transition: background-color 120ms ease, color 120ms ease; }
.nexus-sidebar .menu-item-active { color: var(--nx-action-text); background: var(--nx-selected); font-weight: 500; box-shadow: none; }
.nexus-sidebar .menu-item-inactive { color: var(--nx-secondary); }
.nexus-sidebar .menu-item-inactive:hover { background: var(--nx-subtle); color: var(--foreground); }
.nexus-sidebar .menu-item-icon-active { color: var(--nx-action-text); }
.nexus-sidebar .menu-item-icon-active, .nexus-sidebar .menu-item-icon-inactive { display: inline-flex; width: 20px; flex: 0 0 20px; align-items: center; justify-content: center; }
.nexus-sidebar .menu-item-icon-active :deep(svg), .nexus-sidebar .menu-item-icon-inactive :deep(svg) { width: 18px; height: 18px; stroke-width: 1.75; }
.nexus-sidebar .menu-item-icon-inactive { color: var(--nx-muted); }
.nexus-sidebar :is(a, button):focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
@media (max-width: 1023px) { .nexus-sidebar { margin-top: 0; height: 100dvh; } .nexus-sidebar .menu-item { min-height: 44px; } }
@media (prefers-reduced-motion: reduce) { .nexus-sidebar, .nexus-sidebar * { transition-duration: 0ms !important; } }
</style>
