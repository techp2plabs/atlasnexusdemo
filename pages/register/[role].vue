<template>
  <div class="flow-shell">
    <NuxtLink class="marketing-wordmark" to="/" aria-label="Atlas Nexus home">
      <img class="flow-brand-logo" src="/atlas-nexus-logo.png" alt="Atlas Nexus">
    </NuxtLink>

    <main v-if="valid && profile" class="flow-panel">
      <span class="section-kicker">{{ roleLabel }} DEMO PROFILE</span>
      <h1>Your preview is ready.</h1>
      <p class="flow-intro">We’ve prepared this {{ roleLabel.toLowerCase() }} profile for the prototype. Continue to explore—no details needed.</p>

      <div class="prepared-profile">
        <span class="profile-avatar" aria-hidden="true">{{ initials(profile.name) }}</span>
        <span class="profile-details">
          <strong>{{ profile.name }}</strong>
          <small>{{ profile.email }}</small>
        </span>
        <span class="profile-role">{{ roleLabel }}</span>
      </div>

      <button class="button button-primary full-width continue-button" @click="continueDemo">
        Continue <span aria-hidden="true">→</span>
      </button>
      <p class="form-hint">This continues with a demo profile; it does not create a real account.</p>
      <NuxtLink class="flow-link" to="/get-started">← Choose another workspace</NuxtLink>
    </main>

    <main v-else class="flow-panel">
      <span class="section-kicker">ROLE UNAVAILABLE</span>
      <h1>That demo profile isn’t available.</h1>
      <p class="flow-intro">Choose Creator or Agency to continue.</p>
      <NuxtLink class="button button-primary" to="/get-started">Choose a workspace</NuxtLink>
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
.prepared-profile{display:flex;min-height:78px;align-items:center;gap:13px;margin:22px 0 0;padding:15px;border:1px solid var(--line);border-radius:10px;background:#fbfaff}
.profile-avatar{display:grid;width:40px;height:40px;flex:0 0 40px;place-items:center;border-radius:50%;background:#eee9fa;color:var(--violet);font-size:12px;font-weight:700}
.profile-details{min-width:0;flex:1}.profile-details strong{display:block;color:var(--ink);font-size:13px}.profile-details small{display:block;overflow:hidden;margin-top:4px;color:var(--muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.profile-role{padding:6px 9px;border-radius:999px;background:#f3f1f7;color:var(--ink-soft);font-size:10px;white-space:nowrap}
.continue-button{display:flex;justify-content:center;gap:8px;margin-top:17px}
.continue-button:focus-visible{outline:3px solid var(--violet);outline-offset:3px}
@media(max-width:520px){.flow-panel{padding:26px 20px}.prepared-profile{gap:10px;padding:12px}.profile-role{padding:5px 7px;font-size:9px}}
</style>
