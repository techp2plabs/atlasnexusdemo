<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'

const demo = useDemoStore()
const session = useSessionStore()
onMounted(() => { demo.hydrate(); session.hydrate() })
const route = useRoute()
const groups = [
  { label: 'Workspace', items: [{ label: 'Home', to: '/app/home', icon: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6' }] },
  { label: 'YouTube Brand Campaign', items: [
    { label: 'Creator Discovery', to: '/app/campaigns/campaign-lumina', icon: 'm21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4' },
    { label: 'Campaigns', to: '/app/campaigns', icon: 'm3 11 18-6-6 18-3.2-8.8L3 11Z' },
  ] },
  { label: 'Insights', items: [
    { label: 'Analytics', to: '/app/analytics', icon: 'M3 3v18h18M7 14l4-4 4 3 6-7' },
    { label: 'Creator Suites', to: '/app/creator-suites', icon: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5' },
  ] },
  { label: 'Ecosystem', items: [
    { label: 'Organizations', to: '/app/organizations', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4' },
    { label: 'Partner networks', to: '/app/mcns', icon: 'M12 3 3.5 7.5 12 12l8.5-4.5L12 3ZM3.5 12 12 16.5l8.5-4.5M3.5 16.5 12 21l8.5-4.5' },
    { label: 'Channels', to: '/app/channels', icon: 'M4 5h16v11H4zM8 20h8M12 16v4M8 9h8M8 12h4' },
  ] },
  { label: 'Settings', items: [{ label: 'Account', to: '/app/account', icon: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z' }] },
]
const titles: Record<string,string> = {
  '/app/home': 'Home', '/app/campaigns': 'Campaigns', '/app/creator-suites': 'Creator Suites',
  '/app/hierarchy': 'Network hierarchy', '/app/organizations': 'Organizations', '/app/mcns': 'Partner networks',
  '/app/channels': 'Channels', '/app/analytics': 'Analytics', '/app/account': 'Account',
}
const visibleGroups = computed(() => groups.map(group => ({
  ...group,
  items: group.items.filter(item => !['Organizations', 'Partner networks'].includes(item.label) || session.session?.role !== 'creator'),
})))
const currentLabel = computed(() => titles[route.path] || (route.path.startsWith('/app/campaigns/') ? 'Creator Discovery' : route.path.includes('brand-deal') ? 'Brand Deal Reports' : route.path.includes('channel-reports') ? 'Channel Reports' : route.path.includes('profiling') ? 'Channel Profiling' : 'Atlas'))
const isMenuOpen = ref(false)
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
function switchRole(role: string) { session.signIn(role); isMenuOpen.value = false; navigateTo('/app/home') }
watch(() => route.path, () => { isMobileOpen.value = false; isMenuOpen.value = false })
</script>

<template>
  <div class="workspace-shell" :class="{ 'nav-collapsed': isCollapsed }">
    <button v-if="isMobileOpen" class="sidebar-scrim" type="button" aria-label="Close navigation" @click="isMobileOpen=false" />
    <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileOpen }" aria-label="Atlas Nexus navigation">
      <NuxtLink class="brand-lockup" to="/app/home" aria-label="Atlas Nexus home"><img v-if="!isCollapsed" src="/atlas-nexus-logo.png" alt="Atlas Nexus"><img v-else src="/atlas-nexus-icon.png" alt="Atlas Nexus"></NuxtLink>
      <nav class="side-nav" aria-label="Workspace navigation">
        <section v-for="group in visibleGroups" :key="group.label" class="nav-group">
          <p class="sidebar-caption">{{ group.label }}</p>
          <NuxtLink v-for="item in group.items" :key="`${group.label}-${item.label}`" :to="item.to" class="side-link" :class="{ active: currentLabel===item.label || (item.label==='Creator Discovery' && route.path.startsWith('/app/campaigns/')) }" :aria-label="item.label" :title="isCollapsed ? item.label : undefined" @click="isMobileOpen=false">
            <svg class="nav-glyph" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg><span class="side-link-label">{{ item.label }}</span>
          </NuxtLink>
        </section>
      </nav>
      <div class="sidebar-foot"><span class="demo-dot" /><span class="sidebar-foot-label">Demo data · saved in this browser</span></div>
    </aside>
    <main class="workspace-main">
      <header class="workspace-topbar">
        <div class="topbar-context"><button class="sidebar-toggle" type="button" aria-label="Toggle sidebar" @click="isMobileOpen ? isMobileOpen=false : isCollapsed=!isCollapsed"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button><div class="workspace-context-copy"><small>Platform workspace</small><strong>{{ currentLabel }}</strong></div></div>
        <div class="topbar-actions"><span class="demo-badge">DEMO WORKSPACE</span><div class="role-menu-wrap"><button class="profile-button" type="button" aria-haspopup="true" :aria-expanded="isMenuOpen" @click="isMenuOpen=!isMenuOpen"><span class="profile-avatar">{{ session.session?.name?.split(' ').map((part:string)=>part[0]).join('').slice(0,2)||'AN' }}</span><span class="profile-copy"><strong>{{ session.session?.name || 'Demo user' }}</strong><small>{{ session.roleLabel }}</small></span><span class="profile-chevron" aria-hidden="true">⌄</span></button><div v-if="isMenuOpen" class="role-menu" role="menu"><button v-for="role in ['admin','agency','creator']" :key="role" type="button" role="menuitem" @click="switchRole(role)">Enter as {{ role==='admin'?'Super Admin':role }}</button><NuxtLink to="/app/account" role="menuitem" @click="isMenuOpen=false">Demo settings</NuxtLink><button type="button" role="menuitem" @click="session.signOut();navigateTo('/login')">Log out</button></div></div></div>
      </header>
      <div v-if="demo.message" class="notice-bar" :class="`notice-${demo.noticeTone}`" role="status"><span>{{ demo.message }}</span><button type="button" aria-label="Dismiss message" @click="demo.clearMessage()">×</button></div>
      <div v-if="route.path!=='/app/home'" class="workspace-page-breadcrumb"><NuxtLink to="/app/home">Home</NuxtLink><span>›</span><span>{{ currentLabel }}</span></div>
      <slot />
    </main>
  </div>
</template>
