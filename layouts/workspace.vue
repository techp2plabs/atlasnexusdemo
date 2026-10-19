<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'

const demo = useDemoStore()
const session = useSessionStore()
onMounted(() => { demo.hydrate(); session.hydrate() })
const route = useRoute()
const groups = [
  { label: 'Workspace', items: [
    { label: 'Home', to: '/app/home', icon: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6' },
    { label: 'Contracts', to: '/app/contracts', icon: 'M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M9 13h6M9 17h6' },
  ] },
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
  '/app/channels': 'Channels', '/app/analytics': 'Analytics', '/app/account': 'Account', '/app/contracts': 'Contracts',
}
const visibleGroups = computed(() => groups.map(group => ({
  ...group,
  items: group.items.filter(item => !['Organizations', 'Partner networks'].includes(item.label) || session.session?.role !== 'creator'),
})))
const currentLabel = computed(() => titles[route.path] || (route.path.startsWith('/app/contracts/') ? 'Contract details' : route.path.startsWith('/app/campaigns/') ? 'Creator Discovery' : route.path.includes('brand-deal') ? 'Brand Deal Reports' : route.path.includes('channel-reports') ? 'Channel Reports' : route.path.includes('profiling') ? 'Channel Profiling' : 'Atlas'))
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
          <NuxtLink v-for="item in group.items" :key="`${group.label}-${item.label}`" :to="item.to" class="side-link" :class="{ active: currentLabel===item.label || (item.label==='Creator Discovery' && route.path.startsWith('/app/campaigns/')) || (item.label==='Contracts' && route.path.startsWith('/app/contracts')) }" :aria-label="item.label" :title="isCollapsed ? item.label : undefined" @click="isMobileOpen=false">
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

<style>
.workspace-shell{--workspace-ink:#252236;--workspace-muted:#6c687c;--workspace-paper:#f6f5f9;--workspace-line:#e5e2ed;--workspace-violet:#7250ce;min-height:100vh;background:var(--workspace-paper);color:var(--workspace-ink);font-family:Outfit,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.workspace-shell *{box-sizing:border-box}
.workspace-shell .sidebar{position:fixed;inset:0 auto 0 0;z-index:40;display:flex;width:256px;flex-direction:column;border-right:1px solid var(--workspace-line);background:#fff;transition:width .18s ease,transform .18s ease}
.workspace-shell .brand-lockup{display:flex;height:78px;flex:0 0 78px;align-items:center;padding:0 23px;border-bottom:1px solid var(--workspace-line)}
.workspace-shell .brand-lockup img{display:block;width:168px;max-width:100%;height:auto;max-height:48px;object-fit:contain;object-position:left center}
.workspace-shell .side-nav{min-height:0;flex:1;overflow:auto;padding:14px 12px 18px}
.workspace-shell .nav-group{margin:0 0 18px}
.workspace-shell .sidebar-caption{margin:0;padding:10px 11px 7px;color:#777286;font-size:11px;font-weight:500;line-height:1.4}
.workspace-shell .side-link{display:flex;min-height:42px;align-items:center;gap:12px;margin:2px 0;padding:9px 11px;border-radius:8px;color:#575267;font-size:13px;line-height:1.3;text-decoration:none;transition:background-color .14s ease,color .14s ease}
.workspace-shell .side-link:hover{background:#f6f5f9;color:#252236}
.workspace-shell .side-link.active{background:#eee9fa;color:#6041b4;font-weight:500}
.workspace-shell .nav-glyph{width:18px;height:18px;flex:0 0 18px}
.workspace-shell .side-link-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.workspace-shell .sidebar-foot{display:flex;min-height:56px;align-items:center;gap:9px;padding:12px 22px;border-top:1px solid var(--workspace-line);color:var(--workspace-muted);font-size:11px;white-space:nowrap}
.workspace-shell .demo-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#51a882}
.workspace-shell .workspace-main{min-width:0;min-height:100vh;margin-left:256px}
.workspace-shell .workspace-topbar{position:sticky;top:0;z-index:30;display:flex;min-height:72px;align-items:center;justify-content:space-between;gap:20px;padding:0 30px;border-bottom:1px solid var(--workspace-line);background:rgba(255,255,255,.96);backdrop-filter:blur(12px)}
.workspace-shell .topbar-context,.workspace-shell .topbar-actions{display:flex;align-items:center;gap:14px}
.workspace-shell .sidebar-toggle{display:grid;width:38px;height:38px;flex:0 0 38px;place-items:center;border:1px solid var(--workspace-line);border-radius:8px;background:#fff;color:#575267;cursor:pointer}
.workspace-shell .sidebar-toggle:hover{background:#f6f5f9;color:#252236}
.workspace-shell .sidebar-toggle svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}
.workspace-shell .workspace-context-copy{display:flex;flex-direction:column;gap:2px}
.workspace-shell .workspace-context-copy small{color:var(--workspace-muted);font-size:10px}
.workspace-shell .workspace-context-copy strong{color:var(--workspace-ink);font-size:13px;font-weight:500}
.workspace-shell .demo-badge{padding:6px 8px;border:1px solid var(--workspace-line);border-radius:6px;background:#fcfbfd;color:#6c687c;font-size:10px;font-weight:500;white-space:nowrap}
.workspace-shell .role-menu-wrap{position:relative}
.workspace-shell .profile-button{display:flex;align-items:center;gap:10px;padding:5px;border:0;border-radius:9px;background:transparent;color:var(--workspace-ink);text-align:left;cursor:pointer}
.workspace-shell .profile-button:hover{background:#f6f5f9}
.workspace-shell .profile-avatar{display:grid;width:36px;height:36px;flex:0 0 36px;place-items:center;border-radius:50%;background:#eee9fa;color:#6041b4;font-size:12px;font-weight:600}
.workspace-shell .profile-copy{display:flex;min-width:0;flex-direction:column;gap:2px}
.workspace-shell .profile-copy strong{max-width:180px;overflow:hidden;font-size:12px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}
.workspace-shell .profile-copy small{color:var(--workspace-muted);font-size:10px}
.workspace-shell .profile-chevron{color:var(--workspace-muted);font-size:15px}
.workspace-shell .role-menu{position:absolute;top:calc(100% + 7px);right:0;z-index:60;display:grid;width:210px;gap:3px;padding:7px;border:1px solid var(--workspace-line);border-radius:10px;background:#fff;box-shadow:0 12px 30px rgba(37,34,54,.12)}
.workspace-shell .role-menu button,.workspace-shell .role-menu a{display:block;width:100%;padding:9px 10px;border:0;border-radius:6px;background:transparent;color:#403956;font:400 12px Outfit,ui-sans-serif,system-ui,sans-serif;text-align:left;text-decoration:none;cursor:pointer}
.workspace-shell .role-menu button:hover,.workspace-shell .role-menu a:hover{background:#f6f5f9}
.workspace-shell .notice-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:16px 30px 0;padding:10px 13px;border:1px solid #d9d5e2;border-radius:8px;background:#fff;color:#403956;font-size:12px}
.workspace-shell .notice-error{border-color:#f2c9c6;background:#fff8f7;color:#8b3028}
.workspace-shell .notice-bar button{border:0;background:transparent;color:inherit;font-size:18px;line-height:1;cursor:pointer}
.workspace-shell .workspace-page-breadcrumb{display:flex;align-items:center;gap:9px;margin:21px auto 0;padding:0 30px;color:var(--workspace-muted);font-size:12px}
.workspace-shell .workspace-page-breadcrumb a{color:#575267;text-decoration:none}
.workspace-shell .workspace-page-breadcrumb a:hover{color:var(--workspace-violet);text-decoration:underline;text-underline-offset:3px}
.workspace-shell .sidebar-scrim{display:none}
.workspace-shell :is(a,button):focus-visible{outline:2px solid var(--workspace-violet);outline-offset:3px}
.workspace-shell.nav-collapsed .sidebar{width:76px}
.workspace-shell.nav-collapsed .brand-lockup{justify-content:center;padding:0 12px}
.workspace-shell.nav-collapsed .brand-lockup img{width:40px;height:40px;object-fit:contain}
.workspace-shell.nav-collapsed .sidebar-caption,.workspace-shell.nav-collapsed .side-link-label,.workspace-shell.nav-collapsed .sidebar-foot-label{display:none}
.workspace-shell.nav-collapsed .side-link{justify-content:center;padding-inline:0}
.workspace-shell.nav-collapsed .sidebar-foot{justify-content:center;padding-inline:0}
.workspace-shell.nav-collapsed .workspace-main{margin-left:76px}
@media(max-width:1100px){.workspace-shell .workspace-topbar{padding-inline:22px}.workspace-shell .workspace-page-breadcrumb{padding-inline:22px}}
@media(max-width:760px){
  .workspace-shell .sidebar{width:256px;transform:translateX(-100%)}
  .workspace-shell .sidebar.sidebar-mobile-open{transform:translateX(0)}
  .workspace-shell.nav-collapsed .sidebar{width:256px}
  .workspace-shell .workspace-main,.workspace-shell.nav-collapsed .workspace-main{margin-left:0}
  .workspace-shell .sidebar-scrim{position:fixed;inset:0;z-index:35;display:block;border:0;background:rgba(37,34,54,.32)}
  .workspace-shell .workspace-topbar{min-height:62px;padding:0 15px}
  .workspace-shell .topbar-context,.workspace-shell .topbar-actions{gap:9px}
  .workspace-shell .demo-badge{display:none}
  .workspace-shell .profile-copy,.workspace-shell .profile-chevron{display:none}
  .workspace-shell .workspace-page-breadcrumb{margin-top:17px;padding-inline:18px}
  .workspace-shell .notice-bar{margin-inline:18px}
}
@media(prefers-reduced-motion:reduce){.workspace-shell *{scroll-behavior:auto!important;transition-duration:0ms!important}}
</style>
