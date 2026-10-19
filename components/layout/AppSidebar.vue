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

          <!-- Settings: keep Account available while other settings are paused. -->
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
        </ul>
      </nav>
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
  ChartPie as PieChartIcon,
  Settings2 as SettingsIcon,
  Wrench as ToolsIcon,
  Search as DiscoveryIcon,
  Megaphone as CampaignIcon,
  ClipboardList as ApplicationsIcon,
  Youtube as YoutubeIcon,
} from 'lucide-vue-next'
import { getCampaignNavigation, isNavigationActive } from '~/utils/workspaceNavigation'
import { useSidebar } from '~/composables/useSidebar'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

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
