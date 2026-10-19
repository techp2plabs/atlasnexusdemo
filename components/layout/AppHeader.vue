<template>
  <header class="app-workspace-header sticky top-0 flex w-full z-30">
    <div class="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">

      <!-- Mobile top bar: hamburger | page title | avatar -->
      <div class="app-workspace-header__mobile relative flex items-center justify-between w-full px-3 lg:hidden">
        <!-- Left: hamburger toggle -->
        <button
          @click="handleToggle"
          aria-label="Toggle menu"
          class="app-workspace-header__toggle flex items-center justify-center shrink-0"
          :class="isMobileOpen ? 'bg-gray-100' : ''"
        >
          <svg v-if="isMobileOpen" class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="" />
          </svg>
          <svg v-else width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
          </svg>
        </button>

        <!-- Center: current page title -->
        <span class="app-workspace-header__context absolute left-1/2 -translate-x-1/2 truncate max-w-[58%] pointer-events-none">
          <span>Platform workspace</span><strong>{{ pageTitle }}</strong>
        </span>

        <!-- Right: avatar dropdown -->
        <div class="app-workspace-header__user shrink-0">
          <UserMenu :compact="true" />
        </div>
      </div>

      <!-- Desktop bar: hamburger | search | bell | UserMenu -->
      <div class="app-workspace-header__desktop hidden lg:flex items-center justify-between w-full gap-4">
        <div class="flex items-center gap-4">
          <button
            @click="handleToggle"
            aria-label="Toggle sidebar"
            class="app-workspace-header__toggle flex items-center justify-center"
            :class="isMobileOpen ? 'bg-gray-100' : ''"
          >
            <svg v-if="isMobileOpen" class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="" />
            </svg>
            <svg v-else width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
            </svg>
          </button>
          <div class="app-workspace-header__context">
            <span>Platform workspace</span><strong>{{ pageTitle }}</strong>
          </div>
        </div>

        <div class="app-workspace-header__user flex items-center gap-3">
          <UserMenu />
        </div>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '~/composables/useSidebar'
import UserMenu from './header/UserMenu.vue'
// import SearchBar from './header/SearchBar.vue' // re-enable once search is functional

const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar()
const route = useRoute()

const handleToggle = () => {
  if (process.client && window.innerWidth >= 1024) {
    toggleSidebar()
  } else {
    toggleMobileSidebar()
  }
}

const PAGE_TITLES: Record<string, string> = {
  '/app/youtube-brand-campaign/creator-discovery': 'Creator Discovery',
  '/app/youtube-brand-campaign/campaigns': 'Campaigns',
  '/app/youtube-brand-campaign/campaign-applications': 'Applications',
  '/app/creator-suites': 'Creator Suites',
  '/app/settings/release-notes': 'Release Notes',
  '/app/users/invites': 'Invitations',
  '/app/home': 'Home',
  '/app/organizations': 'Organizations',
  '/app/mcns': 'Partner networks',
  '/app/channels': 'Channels',
  '/app/users': 'Users',
  '/app/contracts': 'Contracts',
  '/app/analytics': 'Analytics',
  '/app/account': 'Account',
  '/app/settings': 'Settings',
}

const pageTitle = computed(() => {
  const exact = PAGE_TITLES[route.path]
  if (exact) return exact
  // Fallback: derive from first matching prefix
  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(k => route.path.startsWith(k + '/'))
  return match ? PAGE_TITLES[match] : 'Atlas'
})
</script>

<style scoped>
.app-workspace-header { height: 80px; background: var(--card); border-bottom: 1px solid var(--border); box-shadow: 0 1px 2px rgb(37 34 54 / .025); backdrop-filter: blur(14px); }
.app-workspace-header__desktop { min-height: 80px; padding: 0 28px; }
.app-workspace-header__toggle { width: 44px; height: 44px; color: var(--nx-muted); background: #fff; border: 1px solid var(--border); border-radius: 10px; transition: background .18s, color .18s; }
.app-workspace-header__toggle:hover { color: var(--foreground); background: var(--nx-subtle); }
.app-workspace-header__context { display: flex; flex-direction: column; gap: 2px; color: var(--foreground); }
.app-workspace-header__context > span { font-size: 10px; line-height: 1.25; color: var(--nx-muted); font-weight: 400; }
.app-workspace-header__context strong { font-size: 13px; line-height: 1.35; font-weight: 500; }
:deep(.app-workspace-header__user button > span:first-child) { background: var(--nx-selected); color: var(--nx-action-text); }
:deep(.app-workspace-header__user button > span:nth-child(2) span:first-child) { color: var(--foreground); font-weight: 500; }
:deep(.app-workspace-header__user button > span:nth-child(2) span:last-child) { color: var(--nx-muted); }
@media (max-width: 1023px) {
  .app-workspace-header { height: 62px; }
  .app-workspace-header__mobile { height: 62px; border-bottom: 1px solid var(--border); }
  .app-workspace-header__toggle { width: 44px; height: 44px; }
  .app-workspace-header__context { align-items: center; }
  .app-workspace-header__context > span { font-size: 9px; }
  .app-workspace-header__context strong { font-size: 13px; }
  :deep(.app-workspace-header__user button > span:first-child) { width: 34px; height: 34px; font-size: 11px; }
}
</style>
