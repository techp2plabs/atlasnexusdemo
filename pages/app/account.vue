<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'
definePageMeta({ layout: 'workspace' })

const demo = useDemoStore()
const session = useSessionStore()
const profileName = computed(() => session.session?.name || 'Demo user')
const profileEmail = computed(() => session.session?.email || 'Email unavailable')
const initials = computed(() => profileName.value.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase())

function resetDemoData() {
  demo.run({ type: 'demo:reset' }, session.session || {})
}

function switchDemoRole() {
  session.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="account-page">
    <header class="account-heading">
      <h1>Account</h1>
      <p>Review the demo profile and sample data used in this browser.</p>
    </header>

    <section class="account-profile" aria-labelledby="account-profile-title">
      <div class="account-profile-top">
        <span class="account-avatar" aria-hidden="true">{{ initials }}</span>
        <div class="account-identity">
          <h2 id="account-profile-title">{{ profileName }}</h2>
          <p>{{ profileEmail }}</p>
        </div>
        <span class="account-role">{{ session.roleLabel }}</span>
      </div>

      <dl class="account-details">
        <div>
          <dt>Workspace</dt>
          <dd>Sample fixture data</dd>
        </div>
        <div>
          <dt>Data storage</dt>
          <dd>This browser</dd>
        </div>
        <div>
          <dt>Account type</dt>
          <dd>Demo profile</dd>
        </div>
      </dl>
    </section>

    <section class="account-data" aria-labelledby="account-data-title">
      <div class="account-section-heading">
        <h2 id="account-data-title">Demo data</h2>
        <p>Changes to sample campaigns and reports stay in this browser.</p>
      </div>

      <div class="account-action-row">
        <div>
          <h3>Reset sample data</h3>
          <p>Restore channels, campaigns, and reports to their original examples. Your profile stays signed in.</p>
        </div>
        <button class="account-button account-button-secondary" type="button" @click="resetDemoData">Reset sample data</button>
      </div>

      <div class="account-action-row">
        <div>
          <h3>Switch demo role</h3>
          <p>Choose another prepared profile and open its workspace.</p>
        </div>
        <button class="account-button account-button-primary" type="button" @click="switchDemoRole">Switch demo role</button>
      </div>
    </section>

    <aside class="account-note" aria-labelledby="prototype-note-title">
      <h2 id="prototype-note-title">About this prototype</h2>
      <p>Business data is simulated. AI insights use sample results unless a server-side Gemini key is configured.</p>
      <p class="account-note-caution">Do not enter confidential or personal information.</p>
    </aside>
  </div>
</template>

<style scoped>
.account-page{width:min(100%,960px);margin:0 auto;padding:18px 24px 48px;color:#252236}
.account-heading{margin:0 0 24px}
.account-heading h1{margin:0;font-size:30px;font-weight:500;line-height:1.2;letter-spacing:-.035em}
.account-heading p{margin:8px 0 0;color:#6c687c;font-size:14px;line-height:1.6}
.account-profile{overflow:hidden;border:1px solid #e5e2ed;border-radius:14px;background:#fff}
.account-profile-top{display:flex;align-items:center;gap:15px;padding:24px 26px}
.account-avatar{display:grid;width:52px;height:52px;flex:0 0 52px;place-items:center;border-radius:14px;background:#eee9fa;color:#6041b4;font-size:15px;font-weight:600}
.account-identity{min-width:0;flex:1}
.account-identity h2{margin:0;color:#252236;font-size:18px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}
.account-identity p{margin:5px 0 0;color:#6c687c;font-size:13px;overflow-wrap:anywhere}
.account-role{flex:0 0 auto;padding:6px 10px;border-radius:7px;background:#f0edf8;color:#6041b4;font-size:12px;font-weight:500}
.account-details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:18px 26px 20px;border-top:1px solid #e5e2ed;background:#fcfbfd}
.account-details div{min-width:0;padding:0 18px;border-left:1px solid #e5e2ed}
.account-details div:first-child{padding-left:0;border-left:0}
.account-details dt{color:#6c687c;font-size:12px}
.account-details dd{margin:5px 0 0;color:#252236;font-size:13px;font-weight:500;overflow-wrap:anywhere}
.account-data{margin-top:30px}
.account-section-heading{margin-bottom:8px}
.account-section-heading h2,.account-note h2{margin:0;color:#252236;font-size:17px;font-weight:600;letter-spacing:-.015em}
.account-section-heading p{margin:5px 0 0;color:#6c687c;font-size:13px;line-height:1.55}
.account-action-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:20px 0;border-bottom:1px solid #e5e2ed}
.account-action-row h3{margin:0;color:#252236;font-size:14px;font-weight:600}
.account-action-row p{max-width:570px;margin:5px 0 0;color:#6c687c;font-size:13px;line-height:1.55}
.account-button{display:inline-flex;min-height:40px;flex:0 0 auto;align-items:center;justify-content:center;padding:9px 14px;border:1px solid transparent;border-radius:8px;font:500 13px Outfit,ui-sans-serif,system-ui,sans-serif;transition:background-color .15s ease,border-color .15s ease,color .15s ease;cursor:pointer}
.account-button-primary{background:#252236;color:#fff}
.account-button-primary:hover{background:#403956}
.account-button-secondary{border-color:#d9d5e2;background:#fff;color:#403956}
.account-button-secondary:hover{border-color:#aaa2bb;background:#faf9fc}
.account-button:focus-visible{outline:3px solid #a58de8;outline-offset:3px}
.account-note{margin-top:28px;padding:16px 18px;border-left:3px solid #7250ce;background:#f0edf8}
.account-note h2{font-size:14px}
.account-note p{margin:7px 0 0;color:#575267;font-size:12px;line-height:1.6}
.account-note .account-note-caution{color:#6c687c}
@media(max-width:700px){.account-page{padding:8px 18px 36px}.account-heading{margin-bottom:18px}.account-heading h1{font-size:26px}.account-profile-top{gap:12px;padding:18px}.account-avatar{width:46px;height:46px;flex-basis:46px}.account-identity h2{font-size:16px}.account-details{grid-template-columns:1fr;padding:5px 18px}.account-details div,.account-details div:first-child{padding:12px 0;border-left:0;border-bottom:1px solid #e5e2ed}.account-details div:last-child{border-bottom:0}.account-action-row{align-items:flex-start;flex-direction:column;gap:13px;padding:17px 0}.account-button{width:100%}}
@media(max-width:390px){.account-profile-top{flex-wrap:wrap}.account-role{margin-left:58px}}
@media(prefers-reduced-motion:reduce){.account-button{transition:none}}
</style>
