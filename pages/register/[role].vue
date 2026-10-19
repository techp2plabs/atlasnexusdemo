<template>
  <div class="flow-shell">
    <NuxtLink class="marketing-wordmark" to="/" aria-label="Atlas Nexus home">
      <img class="flow-brand-logo" src="/atlas-nexus-logo.png" alt="Atlas Nexus">
    </NuxtLink>

    <main v-if="valid && profile" class="flow-panel">
      <p class="flow-eyebrow">{{ roleLabel }} workspace</p>
      <h1>Your {{ roleLabel.toLowerCase() }} profile is ready.</h1>
      <p class="flow-intro">Explore Atlas Nexus with this prepared demo profile. You can continue straight to the workspace.</p>

      <div class="prepared-profile">
        <span class="profile-avatar" aria-hidden="true">{{ initials(profile.name) }}</span>
        <span class="profile-details">
          <strong>{{ profile.name }}</strong>
          <small>{{ profile.email }}</small>
        </span>
        <span class="profile-role">{{ roleLabel }} account</span>
      </div>

      <button class="button button-primary full-width continue-button" @click="continueDemo">
        Continue to workspace
      </button>
      <p class="form-hint">This demo profile is for exploring the prototype. It won’t create a real account.</p>
      <NuxtLink class="flow-link" to="/get-started">Choose a different workspace</NuxtLink>
    </main>

    <main v-else class="flow-panel">
      <p class="flow-eyebrow">Workspace unavailable</p>
      <h1>That demo profile isn’t available.</h1>
      <p class="flow-intro">Choose Creator or Agency to continue.</p>
      <NuxtLink class="button button-primary continue-button" to="/get-started">Choose a workspace</NuxtLink>
    </main>
  </div>
</template>

<script setup lang="ts">
import { getDemoProfile, useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'marketing' })
const route = useRoute()
const session = useSessionStore()
const role = String(route.params.role)
const valid = ['creator', 'agency'].includes(role)
const profile = getDemoProfile(role)
const roleLabel = role === 'creator' ? 'Creator' : 'Agency'
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

function continueDemo() {
  session.signIn(role)
  navigateTo('/app/home')
}
</script>

<style scoped>
.flow-shell{--flow-ink:#252236;--flow-muted:#6c687c;--flow-violet:#7250ce;--flow-paper:#f6f5f9;--flow-line:#e5e2ed;position:relative;display:grid;min-height:100vh;min-height:100svh;place-items:center;padding:112px 24px 48px;background:var(--flow-paper);color:var(--flow-ink);font-family:Outfit,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.marketing-wordmark{position:absolute;top:32px;left:max(32px,calc((100vw - 1200px)/2));display:inline-flex;align-items:center;border-radius:5px}
.flow-brand-logo{display:block;width:148px;height:auto}
.flow-panel{width:min(100%,480px);padding:42px 44px 38px;border:1px solid var(--flow-line);border-radius:18px;background:#fff;box-shadow:0 18px 54px rgba(37,34,54,.06)}
.flow-eyebrow{margin:0 0 13px;color:var(--flow-violet);font-size:14px;font-weight:600;letter-spacing:.01em}
.flow-panel h1{max-width:370px;margin:0;font-size:clamp(32px,5vw,42px);font-weight:500;line-height:1.08;letter-spacing:-.045em}
.flow-intro{margin:16px 0 0;color:var(--flow-muted);font-size:15px;line-height:1.65}
.prepared-profile{display:flex;min-height:78px;align-items:center;gap:13px;margin:27px 0 0;padding:15px;border:1px solid var(--flow-line);border-radius:12px;background:#faf9fc}
.profile-avatar{display:grid;width:44px;height:44px;flex:0 0 44px;place-items:center;border-radius:50%;background:#eee9fa;color:var(--flow-violet);font-size:13px;font-weight:700}
.profile-details{min-width:0;flex:1}.profile-details strong{display:block;color:var(--flow-ink);font-size:14px;font-weight:600}.profile-details small{display:block;overflow:hidden;margin-top:4px;color:var(--flow-muted);font-size:12px;text-overflow:ellipsis;white-space:nowrap}
.profile-role{padding:6px 9px;border-radius:7px;background:#efedf4;color:#575267;font-size:11px;white-space:nowrap}
.continue-button{display:flex;width:100%;min-height:48px;align-items:center;justify-content:center;margin-top:18px;padding:12px 18px;border:1px solid var(--flow-violet);border-radius:9px;background:var(--flow-violet);color:#fff;font:600 14px Outfit,ui-sans-serif,system-ui,sans-serif;text-decoration:none;transition:background-color .16s ease,border-color .16s ease}
.continue-button:hover{border-color:#6041b4;background:#6041b4}
.continue-button:focus-visible,.flow-link:focus-visible,.marketing-wordmark:focus-visible{outline:3px solid #a58de8;outline-offset:4px}
.form-hint{margin:13px 0 0;color:var(--flow-muted);font-size:12px;line-height:1.55;text-align:center}
.flow-link{display:block;width:fit-content;margin:24px auto 0;color:var(--flow-ink);font-size:13px;font-weight:500;text-decoration:underline;text-decoration-color:#c7c2d2;text-underline-offset:4px}
.flow-link:hover{color:var(--flow-violet);text-decoration-color:currentColor}
@media(max-width:600px){.flow-shell{place-items:center;padding:96px 20px 32px}.marketing-wordmark{top:24px;left:20px}.flow-brand-logo{width:132px}.flow-panel{padding:32px 24px 28px;border-radius:15px}.prepared-profile{gap:10px;padding:12px}.profile-role{padding:6px 8px;font-size:10px}}
@media(max-width:380px){.flow-panel{padding-inline:19px}.prepared-profile{flex-wrap:wrap}.profile-role{margin-left:54px}}
@media(prefers-reduced-motion:reduce){.continue-button{transition:none}}
</style>
