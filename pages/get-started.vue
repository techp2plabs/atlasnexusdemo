<template>
  <main class="onboarding-page">
    <header class="onboarding-header">
      <div class="header-inner">
        <NuxtLink class="brand-link" to="/" aria-label="Atlas Nexus home">
          <img src="/atlas-nexus-logo.png" alt="Atlas Nexus" />
        </NuxtLink>
        <nav class="desktop-nav" aria-label="Main navigation">
          <NuxtLink to="/#platform">Platform</NuxtLink>
          <NuxtLink to="/#how-it-works">How it works</NuxtLink>
          <NuxtLink to="/#for-you">Who it’s for</NuxtLink>
          <NuxtLink to="/#faq">FAQs</NuxtLink>
        </nav>
        <div class="header-actions">
          <button class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-controls="mobile-menu" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">{{ menuOpen ? '×' : '☰' }}</button>
        </div>
      </div>
      <nav v-if="menuOpen" id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation">
        <NuxtLink to="/#platform" @click="menuOpen = false">Platform</NuxtLink>
        <NuxtLink to="/#how-it-works" @click="menuOpen = false">How it works</NuxtLink>
        <NuxtLink to="/#for-you" @click="menuOpen = false">Who it’s for</NuxtLink>
        <NuxtLink to="/#faq" @click="menuOpen = false">FAQs</NuxtLink>
      </nav>
    </header>

    <section class="start-layout" aria-labelledby="start-title">
      <div class="start-intro">
        <h1 id="start-title">Start with your side of the partnership.</h1>
        <p>Choose how you’d like to work with Atlas Nexus. Each path takes you to the right next step.</p>
      </div>

      <div class="persona-list" aria-label="Choose your role">
        <NuxtLink class="persona-row" to="/register/creator">
          <span class="persona-copy"><strong>I’m a Creator</strong><small>Browse open campaigns and apply to the ones that fit.</small></span>
          <span class="persona-action">Continue <span aria-hidden="true">↗</span></span>
        </NuxtLink>
        <NuxtLink class="persona-row" to="/register/agency">
          <span class="persona-copy"><strong>I’m an Agency or MCN</strong><small>Request access for your team. We’ll review your details.</small></span>
          <span class="persona-action">Continue <span aria-hidden="true">↗</span></span>
        </NuxtLink>
      </div>
      <p class="start-login">Already have a demo profile? <NuxtLink to="/login">Continue to login</NuxtLink></p>
    </section>

    <footer class="onboarding-footer">
      <span>Atlas Nexus · Better connections. Clearer outcomes.</span>
      <nav aria-label="Footer navigation"><a href="#">Privacy policy</a><a href="#">Terms of service</a></nav>
    </footer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const menuOpen = ref(false)
</script>

<style scoped>
.onboarding-page{--ink:#252236;--muted:#6c687c;--violet:#7250ce;--paper:#f6f5f9;--line:#e5e2ed;min-height:100vh;display:flex;flex-direction:column;background:var(--paper);color:var(--ink);font-family:Outfit,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.onboarding-header{position:sticky;top:0;z-index:10;background:rgba(246,245,249,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(229,226,237,.8)}
.header-inner{width:min(1200px,calc(100% - 64px));height:84px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:28px}
.brand-link{display:flex;align-items:center;flex:0 0 auto}.brand-link img{display:block;width:145px;height:auto}
.desktop-nav{display:flex;align-items:center;gap:32px;margin-left:auto}.desktop-nav a,.login-link{font-size:14px;color:var(--muted);text-decoration:none;transition:color .15s ease}.desktop-nav a:hover,.login-link:hover{color:var(--violet)}
.header-actions{display:flex;align-items:center;gap:22px}.login-link{color:var(--ink)}.menu-toggle{display:none;border:1px solid var(--line);background:#fff;border-radius:999px;width:42px;height:42px;font-size:20px;color:var(--ink)}
.mobile-menu{display:none}
.start-layout{width:min(1200px,calc(100% - 64px));margin:auto;padding:96px 0 112px;display:grid;grid-template-columns:.92fr 1.08fr;gap:clamp(56px,8vw,112px);align-items:start}
.start-intro{padding-top:4px}.start-intro h1{max-width:560px;margin:0;font-size:clamp(48px,6vw,76px);line-height:1.02;letter-spacing:-.055em;font-weight:500}.start-intro p{max-width:400px;margin:26px 0 0;color:var(--muted);font-size:18px;line-height:1.65}
.persona-list{border-top:1px solid #c9c4d3}.persona-row{min-height:142px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:24px;padding:24px 4px;border-bottom:1px solid var(--line);color:inherit;text-decoration:none;transition:background-color .16s ease,padding .16s ease}.persona-row[href]:hover{padding-inline:16px;background:rgba(255,255,255,.72)}.persona-row:focus-visible,.onboarding-header a:focus-visible,.menu-toggle:focus-visible,.mobile-menu a:focus-visible,.onboarding-footer a:focus-visible{outline:3px solid var(--violet);outline-offset:4px}
.persona-copy{display:flex;flex-direction:column;gap:8px}.persona-copy strong{font-size:21px;line-height:1.2;font-weight:500;letter-spacing:-.025em}.persona-copy small{max-width:360px;color:var(--muted);font-size:14px;line-height:1.55}.persona-action{display:inline-flex;align-items:center;gap:9px;white-space:nowrap;background:var(--ink);color:#fff;border-radius:999px;padding:12px 17px;font-size:13px;font-weight:500}.persona-row[href]:hover .persona-action{background:#493765}.persona-status{max-width:150px;text-align:right;color:var(--muted);font-size:12px;line-height:1.4}.persona-disabled .persona-copy strong{color:#565267}.persona-disabled .persona-copy small{color:#777286}
.start-login{margin:22px 0 0;color:var(--muted);font-size:13px}.start-login a{color:var(--violet);font-weight:600;text-underline-offset:3px}.start-login a:focus-visible{outline:3px solid var(--violet);outline-offset:3px}
.onboarding-footer{width:min(1200px,calc(100% - 64px));margin:auto auto 0;padding:22px 0 28px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:20px;color:var(--muted);font-size:12px}.onboarding-footer nav{display:flex;gap:28px}.onboarding-footer a{color:var(--muted);text-decoration:none}.onboarding-footer a:hover{color:var(--violet)}
@media(max-width:900px){.header-inner,.start-layout,.onboarding-footer{width:min(100% - 48px,720px)}.desktop-nav{gap:18px}.start-layout{grid-template-columns:.85fr 1.15fr;gap:48px;padding:76px 0 88px}.start-intro h1{font-size:clamp(46px,6.2vw,64px)}.persona-row{min-height:132px;gap:14px}.persona-action{padding:11px 13px}}
@media(max-width:700px){.header-inner,.start-layout,.onboarding-footer{width:calc(100% - 40px)}.header-inner{height:72px}.brand-link img{width:132px}.desktop-nav{display:none}.header-actions{gap:16px}.menu-toggle{display:block}.mobile-menu{position:absolute;top:72px;left:20px;right:20px;display:grid;gap:2px;padding:12px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 40px rgba(37,34,54,.10)}.mobile-menu a{padding:12px;border-radius:8px;color:var(--ink);text-decoration:none;font-size:14px}.mobile-menu a:hover{background:var(--paper)}.start-layout{display:block;padding:58px 0 70px}.start-intro{margin-bottom:42px}.start-intro h1{max-width:520px;font-size:clamp(44px,12vw,58px)}.start-intro p{font-size:16px;line-height:1.6;margin-top:18px}.persona-row{min-height:126px;padding:20px 2px;gap:14px}.persona-row[href]:hover{padding-inline:10px}.persona-copy strong{font-size:19px}.persona-copy small{font-size:13px}.persona-action{font-size:12px;padding:10px 12px}.persona-status{max-width:116px;font-size:11px}.onboarding-footer{align-items:flex-start;flex-direction:column;padding:20px 0 24px}.onboarding-footer nav{gap:22px}}
@media(max-width:390px){.persona-row{grid-template-columns:1fr;align-items:start}.persona-action,.persona-status{justify-self:start}.persona-status{text-align:left;max-width:none}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important}}
</style>
