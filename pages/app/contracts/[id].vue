<script setup lang="ts">
import { useContracts } from '~/composables/useContracts'
import type { Contract } from '~/types/contract'

definePageMeta({ layout: 'workspace' })
const route = useRoute()
const { fetchContract, loading } = useContracts()
const contract = ref<Contract | null>(null)
const failed = ref(false)

onMounted(async () => {
  try {
    const result = await fetchContract(String(route.params.id))
    contract.value = result && result.id ? result : null
  } catch {
    failed.value = true
  }
})

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : 'No end date'
const typeLabel = (type: string) => ({ platform_to_org: 'Platform to organization', org_to_mcn: 'Organization to MCN', mcn_to_channel: 'MCN to channel' }[type] || type)
const statusLabel = (status: string) => ({ active: 'Active', future: 'Upcoming', expired: 'Expired' }[status] || status)
</script>

<template>
  <main class="contract-detail-page">
    <NuxtLink class="back-link" to="/app/contracts"><span aria-hidden="true">←</span> All contracts</NuxtLink>
    <div v-if="loading" class="detail-state">Loading contract…</div>
    <section v-else-if="!contract" class="detail-state not-found"><div class="not-found-mark">?</div><h1>{{ failed ? 'Contract could not be loaded' : 'Contract not found' }}</h1><p>{{ failed ? 'The contract service did not return this agreement. Check your connection and try again.' : 'This agreement may have been removed or the link may be incorrect.' }}</p><NuxtLink to="/app/contracts">Return to contracts</NuxtLink></section>
    <template v-else>
      <header class="detail-heading">
        <div class="detail-title-line"><div><p class="detail-number">{{ contract.contract_number || 'Agreement' }}</p><h1>{{ contract.entity_name || contract.channel_title || contract.mcn_name || 'Partner agreement' }}</h1><p class="detail-context">{{ typeLabel(contract.contract_type) }} · {{ contract.organization_name || 'Organization unavailable' }}</p></div><span class="status-pill" :class="`status-${contract.status}`"><i />{{ statusLabel(contract.status) }}</span></div>
      </header>

      <section class="share-panel" aria-label="Current revenue share">
        <div class="share-caption"><span class="share-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 18 9 12l4 3 7-9M15 6h5v5" /></svg></span><div><p>Current revenue share</p><span>Applied to the agreement's covered revenue</span></div></div>
        <strong>{{ contract.current_revenue_share_pct }}<small>%</small></strong>
      </section>

      <div class="detail-columns">
        <section class="detail-section parties-section" aria-labelledby="parties-title"><div class="section-heading"><div><h2 id="parties-title">Parties</h2><p>Organizations covered by this agreement</p></div></div>
          <div class="party-list">
            <div class="party-row"><span class="party-symbol organization-symbol">O</span><div><small>Organization</small><strong>{{ contract.organization_name || 'Organization unavailable' }}</strong></div></div>
            <div v-if="contract.mcn_name" class="party-row"><span class="party-symbol network-symbol">N</span><div><small>Partner network</small><strong>{{ contract.mcn_name }}</strong></div></div>
            <div v-if="contract.channel_title" class="party-row"><span class="party-symbol channel-symbol">C</span><div><small>Channel</small><strong>{{ contract.channel_title }}</strong></div></div>
          </div>
        </section>
        <section class="detail-section terms-section" aria-labelledby="terms-title"><div class="section-heading"><div><h2 id="terms-title">Agreement terms</h2><p>Key dates and share terms</p></div></div>
          <dl class="terms-grid"><div><dt>Agreement type</dt><dd>{{ typeLabel(contract.contract_type) }}</dd></div><div><dt>Base revenue share</dt><dd>{{ contract.revenue_share_pct }}%</dd></div><div><dt>Effective from</dt><dd>{{ formatDate(contract.start_date) }}</dd></div><div><dt>Effective until</dt><dd>{{ formatDate(contract.end_date) }}</dd></div></dl>
        </section>
      </div>

      <section v-if="contract.notes" class="detail-section notes-section" aria-labelledby="notes-title"><div class="section-heading"><div><h2 id="notes-title">Notes</h2><p>Additional agreement context</p></div></div><p class="notes-copy">{{ contract.notes }}</p></section>
      <footer class="detail-footer"><span>Agreement record</span><span>Updated {{ formatDate(contract.updated_at) }}</span></footer>
    </template>
  </main>
</template>

<style scoped>
.contract-detail-page{width:min(100%,1120px);margin:0 auto;padding:17px 30px 52px;color:#252236}.back-link{display:inline-flex;align-items:center;gap:8px;color:#6c687c;font-size:12px;text-decoration:none}.back-link span{font-size:17px;line-height:1}.back-link:hover{color:#6041b4}.detail-heading{margin:23px 0 20px}.detail-title-line{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.detail-number{margin:0 0 6px;color:#777286;font-size:11px}.detail-heading h1{margin:0;color:#252236;font-size:27px;font-weight:500;letter-spacing:-.035em;line-height:1.25;overflow-wrap:anywhere}.detail-context{margin:8px 0 0;color:#777286;font-size:12px;line-height:1.5}.status-pill{display:inline-flex;align-items:center;gap:7px;flex:0 0 auto;margin-top:6px;padding:6px 10px;border-radius:20px;background:#edf7f1;color:#387653;font-size:11px}.status-pill i{width:6px;height:6px;border-radius:50%;background:currentColor}.status-future{background:#fbf5e7;color:#92702a}.status-expired{background:#f2f1f4;color:#777286}.share-panel{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:21px 23px;border:1px solid #e5e2ed;border-radius:12px;background:#fff}.share-caption{display:flex;align-items:center;gap:12px}.share-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:10px;background:#f0edf8;color:#6041b4}.share-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.share-caption p{margin:0;color:#403956;font-size:13px;font-weight:500}.share-caption div>span{display:block;margin-top:4px;color:#898596;font-size:11px}.share-panel>strong{color:#6041b4;font-size:32px;font-weight:500;letter-spacing:-.045em}.share-panel>strong small{font-size:18px}.detail-columns{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:16px;margin-top:16px}.detail-section{min-width:0;padding:20px 21px;border:1px solid #e5e2ed;border-radius:12px;background:#fff}.section-heading{display:flex;justify-content:space-between;gap:12px}.section-heading h2{margin:0;color:#252236;font-size:14px;font-weight:550}.section-heading p{margin:5px 0 0;color:#898596;font-size:11px}.party-list{display:grid;gap:0;margin-top:14px}.party-row{display:flex;align-items:center;gap:11px;padding:12px 0;border-top:1px solid #f0eef3}.party-symbol{display:grid;width:30px;height:30px;flex:0 0 30px;place-items:center;border-radius:8px;font-size:11px;font-weight:600}.organization-symbol{background:#f0edf8;color:#6041b4}.network-symbol{background:#edf4fa;color:#416f98}.channel-symbol{background:#fbf5e7;color:#92702a}.party-row small,.party-row strong{display:block}.party-row small{margin-bottom:4px;color:#898596;font-size:10px}.party-row strong{color:#403956;font-size:12px;font-weight:500;overflow-wrap:anywhere}.terms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 18px;margin:15px 0 0}.terms-grid div{min-width:0;padding:12px 0;border-top:1px solid #f0eef3}.terms-grid dt{color:#898596;font-size:10px}.terms-grid dd{margin:5px 0 0;color:#403956;font-size:12px;font-weight:500;line-height:1.4;overflow-wrap:anywhere}.notes-section{margin-top:16px}.notes-copy{margin:14px 0 0;padding-top:13px;border-top:1px solid #f0eef3;color:#686477;font-size:12px;line-height:1.7}.detail-footer{display:flex;justify-content:space-between;gap:18px;margin-top:15px;color:#898596;font-size:10px}.detail-state{padding:60px 20px;color:#777286;font-size:13px;text-align:center}.not-found{max-width:520px;margin:32px auto;padding:34px 24px;border:1px solid #e5e2ed;border-radius:12px;background:#fff}.not-found-mark{display:grid;width:40px;height:40px;margin:0 auto 15px;place-items:center;border-radius:50%;background:#f2f1f4;color:#777286;font-size:18px}.not-found h1{margin:0;color:#252236;font-size:19px;font-weight:500}.not-found p{margin:9px 0 18px;color:#777286;font-size:12px;line-height:1.6}.not-found>a{color:#6041b4;font-size:12px;text-decoration:none}.not-found>a:hover{text-decoration:underline;text-underline-offset:3px}
@media(max-width:760px){.contract-detail-page{padding:15px 18px 40px}.detail-heading{margin-top:19px}.detail-heading h1{font-size:23px}.detail-title-line{gap:12px}.share-panel{align-items:flex-start;padding:17px}.share-caption{gap:9px}.share-caption div>span{max-width:190px;line-height:1.5}.share-panel>strong{font-size:27px}.detail-columns{grid-template-columns:1fr;gap:12px;margin-top:12px}.detail-section{padding:17px}.terms-grid{gap:0 12px}.detail-footer{flex-direction:column;gap:5px}}
</style>
