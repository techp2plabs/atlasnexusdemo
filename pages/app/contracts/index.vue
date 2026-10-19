<script setup lang="ts">
import { useContracts } from '~/composables/useContracts'
import type { Contract } from '~/types/contract'

definePageMeta({ layout: 'workspace' })
const { fetchContracts, contracts, loading, error } = useContracts()
const query = ref('')
const status = ref('all')

onMounted(() => fetchContracts({ page: 1, page_size: 100 }))

const visibleContracts = computed(() => {
  const term = query.value.trim().toLowerCase()
  return contracts.value.filter((contract: Contract) => {
    const matchesStatus = status.value === 'all' || contract.status === status.value
    const matchesQuery = !term || [contract.contract_number, contract.entity_name, contract.organization_name, contract.mcn_name, contract.channel_title]
      .some(value => String(value || '').toLowerCase().includes(term))
    return matchesStatus && matchesQuery
  })
})
const activeCount = computed(() => contracts.value.filter(contract => contract.status === 'active').length)
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'No end date'
const typeLabel = (type: string) => ({ platform_to_org: 'Platform to organization', org_to_mcn: 'Organization to MCN', mcn_to_channel: 'MCN to channel' }[type] || type)
</script>

<template>
  <main class="contracts-page">
    <header class="contracts-heading">
      <div><h1>Contracts</h1><p>Revenue share agreements across your partner network.</p></div>
      <div class="heading-count"><strong>{{ contracts.length }}</strong><span>agreements</span></div>
    </header>

    <section class="contract-register" aria-labelledby="register-title">
      <div class="register-top">
        <div class="register-title-wrap"><div class="register-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M9 13h6M9 17h6" /></svg></div><div><h2 id="register-title">Agreement register</h2><p>{{ activeCount }} currently active</p></div></div>
        <label class="contract-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input v-model="query" type="search" placeholder="Search agreements" aria-label="Search agreements"></label>
      </div>
      <div class="register-controls" aria-label="Filter contracts by status">
        <button v-for="filter in [{ value: 'all', label: 'All contracts' }, { value: 'active', label: 'Active' }, { value: 'future', label: 'Upcoming' }, { value: 'expired', label: 'Expired' }]" :key="filter.value" type="button" :class="{ selected: status === filter.value }" @click="status = filter.value">{{ filter.label }}<span v-if="filter.value === 'all'">{{ contracts.length }}</span></button>
      </div>
      <div v-if="loading" class="register-state">Loading contracts…</div>
      <div v-else-if="error" class="register-state register-error">{{ error }}</div>
      <div v-else-if="!visibleContracts.length" class="register-state">No contracts match this search.</div>
      <div v-else class="table-scroll">
        <table><thead><tr><th>Agreement</th><th>Partner</th><th>Type</th><th>Revenue share</th><th>Term</th><th>Status</th><th><span class="sr-only">Open</span></th></tr></thead>
          <tbody><tr v-for="contract in visibleContracts" :key="contract.id" @click="navigateTo(`/app/contracts/${contract.id}`)">
            <td><NuxtLink class="agreement-link" :to="`/app/contracts/${contract.id}`"><strong>{{ contract.contract_number || 'Untitled agreement' }}</strong><span>{{ contract.organization_name || 'Organization unavailable' }}</span></NuxtLink></td>
            <td><span class="partner-name">{{ contract.entity_name || contract.channel_title || contract.mcn_name || 'Partner unavailable' }}</span><span class="partner-sub">{{ contract.mcn_name || contract.channel_title || 'Partner' }}</span></td>
            <td><span class="type-label">{{ typeLabel(contract.contract_type) }}</span></td>
            <td><strong class="share-value">{{ contract.current_revenue_share_pct }}%</strong></td>
            <td><span class="term-start">{{ formatDate(contract.start_date) }}</span><span class="term-end">to {{ formatDate(contract.end_date) }}</span></td>
            <td><span class="status-pill" :class="`status-${contract.status}`"><i />{{ contract.status === 'future' ? 'Upcoming' : contract.status }}</span></td>
            <td><NuxtLink class="row-open" :to="`/app/contracts/${contract.id}`" :aria-label="`Open ${contract.contract_number}`">↗</NuxtLink></td>
          </tr></tbody>
        </table>
      </div>
      <footer v-if="!loading && visibleContracts.length" class="register-footer"><span>Showing {{ visibleContracts.length }} of {{ contracts.length }} agreements</span><span>Amounts shown as agreed revenue share</span></footer>
    </section>
  </main>
</template>

<style scoped>
.contracts-page{width:min(100%,1240px);margin:0 auto;padding:20px 30px 54px;color:#252236}.contracts-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin:0 0 25px}.contracts-heading h1{margin:0;font-size:30px;font-weight:500;letter-spacing:-.035em;line-height:1.2}.contracts-heading p{margin:8px 0 0;color:#6c687c;font-size:14px;line-height:1.5}.heading-count{display:flex;align-items:baseline;gap:7px;color:#6c687c;font-size:12px}.heading-count strong{color:#252236;font-size:22px;font-weight:500;letter-spacing:-.04em}.contract-register{overflow:hidden;border:1px solid #e5e2ed;border-radius:12px;background:#fff}.register-top{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 22px}.register-title-wrap{display:flex;align-items:center;gap:12px}.register-mark{display:grid;width:40px;height:40px;place-items:center;border:1px solid #e9e5f2;border-radius:10px;background:#f7f5fb;color:#6041b4}.register-mark svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.register-title-wrap h2{margin:0;font-size:14px;font-weight:550;line-height:1.35}.register-title-wrap p{margin:4px 0 0;color:#777286;font-size:11px}.contract-search{display:flex;width:min(280px,42vw);height:38px;align-items:center;gap:8px;padding:0 11px;border:1px solid #e5e2ed;border-radius:7px;background:#fff;color:#777286}.contract-search:focus-within{border-color:#9e8bd5;box-shadow:0 0 0 3px rgba(114,80,206,.1)}.contract-search svg{width:16px;height:16px;flex:0 0 16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}.contract-search input{width:100%;border:0;outline:0;background:transparent;color:#252236;font:400 12px Outfit,ui-sans-serif,system-ui,sans-serif}.contract-search input::placeholder{color:#9692a2}.register-controls{display:flex;gap:5px;padding:0 22px;border-bottom:1px solid #e5e2ed}.register-controls button{display:flex;align-items:center;gap:7px;margin-bottom:-1px;padding:10px 10px;border:0;border-bottom:2px solid transparent;background:transparent;color:#777286;font:400 12px Outfit,ui-sans-serif,system-ui,sans-serif;cursor:pointer}.register-controls button:hover{color:#403956}.register-controls button.selected{border-bottom-color:#7250ce;color:#6041b4;font-weight:500}.register-controls button span{padding:2px 6px;border-radius:10px;background:#f0edf8;color:#6041b4;font-size:10px}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}thead{background:#fcfbfd}th{padding:11px 14px;border-bottom:1px solid #e9e6ee;color:#777286;font-size:10px;font-weight:500}th:first-child,td:first-child{padding-left:22px}th:last-child,td:last-child{padding-right:18px}td{padding:14px;border-bottom:1px solid #f0eef3;color:#403956;font-size:12px}tbody tr{cursor:pointer;transition:background-color .12s}tbody tr:hover{background:#faf9fc}tbody tr:last-child td{border-bottom:0}.agreement-link,.partner-name,.term-start{display:block}.agreement-link{color:inherit;text-decoration:none}.agreement-link strong{display:block;color:#403956;font-size:12px;font-weight:550}.agreement-link span,.partner-sub,.term-end{display:block;margin-top:4px;color:#898596;font-size:10px}.agreement-link:hover strong{color:#6041b4;text-decoration:underline;text-underline-offset:3px}.partner-name{max-width:190px;overflow:hidden;color:#403956;text-overflow:ellipsis}.type-label{color:#686477;font-size:11px}.share-value{color:#252236;font-size:13px;font-weight:550}.term-start{color:#403956}.status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:20px;background:#edf7f1;color:#387653;font-size:10px;text-transform:capitalize}.status-pill i{width:5px;height:5px;border-radius:50%;background:currentColor}.status-future{background:#fbf5e7;color:#92702a}.status-expired{background:#f2f1f4;color:#777286}.row-open{display:grid;width:26px;height:26px;place-items:center;border-radius:6px;color:#777286;text-decoration:none}.row-open:hover{background:#f0edf8;color:#6041b4}.register-state{padding:38px 22px;color:#777286;font-size:13px;text-align:center}.register-error{color:#9d403c}.register-footer{display:flex;justify-content:space-between;gap:18px;padding:12px 22px;border-top:1px solid #e9e6ee;background:#fcfbfd;color:#898596;font-size:10px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:760px){.contracts-page{padding:17px 18px 40px}.contracts-heading{align-items:flex-start}.contracts-heading h1{font-size:26px}.heading-count{padding-top:5px}.register-top{align-items:flex-start;flex-direction:column;padding:17px}.contract-search{width:100%}.register-controls{overflow-x:auto;padding-inline:12px}.register-controls button{flex:0 0 auto;padding-inline:9px}.register-footer{align-items:flex-start;flex-direction:column;gap:5px;padding-inline:17px}}
</style>
