<template>
  <div class="flow-shell">
    <NuxtLink class="marketing-wordmark" to="/" aria-label="Atlas Nexus home">
      <img class="flow-brand-logo" src="/atlas-nexus-logo.png" alt="Atlas Nexus">
    </NuxtLink>
    <main class="flow-panel">
      <span class="section-kicker">DEMO ACCESS</span>
      <h1>Welcome to Atlas Nexus.</h1>
      <p class="flow-intro">Choose a prepared profile, then continue to its workspace. No details to enter.</p>

      <div class="flow-options" role="group" aria-label="Choose a demo profile">
        <button
          v-for="item in options"
          :key="item.role"
          class="flow-option profile-option"
          :class="{ 'profile-option-selected': selectedRole === item.role }"
          :aria-pressed="selectedRole === item.role"
          @click="selectedRole = item.role"
        >
          <span class="profile-avatar" aria-hidden="true">{{ initials(item.name) }}</span>
          <span class="profile-details">
            <strong>{{ item.name }}</strong>
            <small>{{ item.email }}</small>
          </span>
          <span class="profile-role">{{ item.title }}</span>
        </button>
      </div>

      <button class="button button-primary full-width continue-button" @click="continueDemo">
        Continue as {{ selectedProfile?.title }} <span aria-hidden="true">→</span>
      </button>
      <p class="form-hint">These ready-made profiles are for the local prototype only.</p>
      <NuxtLink class="flow-link" to="/">← Back to home</NuxtLink>
    </main>
  </div>
</template>

<script setup lang="ts">
import { getDemoProfile, useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'marketing' })
const session = useSessionStore()
const profileOptions = [
  { role: 'admin', title: 'Super Admin' },
  { role: 'agency', title: 'Agency' },
  { role: 'creator', title: 'Creator' },
]
const options = profileOptions.map((item) => ({ ...item, ...getDemoProfile(item.role)! }))
const selectedRole = ref('agency')
const selectedProfile = computed(() => options.find((item) => item.role === selectedRole.value))
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

function continueDemo() {
  session.signIn(selectedRole.value)
  navigateTo('/app/home')
}
</script>

<style scoped>
.profile-option{width:100%;min-height:72px;justify-content:flex-start;background:#fff;text-align:left;cursor:pointer}
.profile-option-selected{border-color:var(--violet);background:#f8f6ff;box-shadow:inset 0 0 0 1px var(--violet)}
.profile-avatar{display:grid;width:38px;height:38px;flex:0 0 38px;place-items:center;border-radius:50%;background:#eee9fa;color:var(--violet);font-size:12px;font-weight:700}
.profile-details{min-width:0;flex:1}.profile-details strong{display:block;color:var(--ink);font-size:13px}.profile-details small{display:block;overflow:hidden;margin-top:4px;color:var(--muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.profile-role{padding:6px 9px;border-radius:999px;background:#f3f1f7;color:var(--ink-soft);font-size:10px;white-space:nowrap}
.continue-button{display:flex;justify-content:center;gap:8px;margin-top:20px}
.profile-option:focus-visible,.continue-button:focus-visible{outline:3px solid var(--violet);outline-offset:3px}
@media(max-width:520px){.flow-panel{padding:26px 20px}.profile-option{gap:10px;padding:12px}.profile-role{padding:5px 7px;font-size:9px}}
</style>
