<template>
  <dialog ref="dialog" :aria-labelledby="titleId" class="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-xl bg-white p-5 text-gray-900 shadow-xl backdrop:bg-black/40 dark:bg-gray-900 dark:text-white" @cancel.prevent="close">
    <section v-if="modelValue">
      <div class="flex items-start justify-between gap-4">
        <div><h2 :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-white">Add {{ creatorName }} to a campaign</h2><p class="mt-1 text-sm text-gray-500">Choose a draft you can edit. Adding a creator does not launch the campaign.</p></div>
        <button type="button" aria-label="Close dialog" class="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10" @click="close">×</button>
      </div>
      <div v-if="loading" class="py-10 text-center text-sm text-gray-500" role="status">Loading accessible drafts…</div>
      <div v-else-if="loadError" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{{ loadError }} <button type="button" class="ml-2 font-medium underline" @click="loadDrafts">Try again</button></div>
      <div v-else-if="campaigns.length === 0" class="mt-4 rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">No editable draft campaigns are available. <NuxtLink :to="{ path: '/app/youtube-brand-campaign/campaigns/new', query: { discovery_creator: profileId } }" class="font-medium text-brand-700 underline" @click="close">Create a campaign</NuxtLink>.</div>
      <div v-else class="mt-5 space-y-2">
        <button v-for="campaign in campaigns" :key="campaign.id" type="button" :aria-pressed="selectedId === campaign.id" :disabled="submitting || !!result" class="w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-70" :class="selectedId === campaign.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 hover:border-brand-300 dark:border-gray-700'" @click="selectedId = campaign.id">
          <span class="block break-words font-medium text-gray-900 dark:text-white">{{ campaign.name }}</span><span class="mt-1 block text-sm text-gray-600 dark:text-gray-300">{{ campaign.brand_name }} · {{ campaign.start_date || 'No start date' }} – {{ campaign.end_date || 'No end date' }}</span><span class="mt-1 block text-xs text-gray-500">{{ campaign.organization_name || 'Organization name unavailable' }}<span v-if="campaign.mcn_name"> · {{ campaign.mcn_name }}</span> · Draft · {{ campaign.roster_count }} creators</span>
        </button>
      </div>
      <button v-if="hasMore && !loading" type="button" class="mt-3 text-sm text-brand-700 underline" @click="loadMore">Load more draft campaigns</button>
      <p v-if="membershipLoading" class="mt-3 text-sm text-gray-500" role="status">Checking roster…</p>
      <p v-else-if="alreadyAdded" class="mt-3 text-sm text-gray-600">This creator is already in the selected roster. <NuxtLink :to="rosterHref" class="font-medium underline">Open roster</NuxtLink></p>
      <p v-if="error" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <p v-if="result" class="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-500/10 dark:text-green-300" role="status">{{ result.message }} <NuxtLink v-if="result.href" :to="result.href" class="font-medium underline">Open roster</NuxtLink></p>
      <div v-if="campaigns.length" class="mt-5 flex justify-end gap-2">
        <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm" @click="close">{{ result ? 'Done' : 'Cancel' }}</button>
        <button v-if="!result && !alreadyAdded" type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50" :disabled="!selectedId || submitting || membershipLoading" @click="add">{{ submitting ? 'Adding…' : 'Add creator' }}</button>
      </div>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useCampaignsApi, type CampaignRecord } from '~/composables/youtubeBrandCampaign/useCampaignsApi'

const props = defineProps<{ modelValue: boolean; profileId: string; creatorName: string; initialCampaignId?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const api = useCampaignsApi()
const dialog = ref<HTMLDialogElement | null>(null)
const titleId = `creator-campaign-picker-${useId()}`
const campaigns = ref<CampaignRecord[]>([])
const selectedId = ref('')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const loadError = ref('')
const currentPage = ref(1)
const hasMore = ref(false)
const alreadyAdded = ref(false)
const membershipLoading = ref(false)
let requestVersion = 0
const rosterHref = computed(() => `/app/youtube-brand-campaign/campaigns/${selectedId.value}?tab=roster`)
const result = ref<{ message: string; href: string } | null>(null)

function close() { if (!submitting.value) emit('update:modelValue', false) }
async function loadDrafts() {
  const version = ++requestVersion
  loading.value = true; loadError.value = ''; error.value = ''; result.value = null
  try {
    const page = await api.list('draft', 1, 100)
    if (version !== requestVersion) return
    campaigns.value = page.items.filter((campaign) => campaign.status === 'draft')
    currentPage.value = 1; hasMore.value = page.total > campaigns.value.length
    if (!selectedId.value && props.initialCampaignId && campaigns.value.some((item) => item.id === props.initialCampaignId)) selectedId.value = props.initialCampaignId
  }
  catch { if (version === requestVersion) loadError.value = 'Could not load campaigns you can access. Try again.' }
  finally { loading.value = false }
}
async function loadMore() {
  if (loading.value) return
  loading.value = true
  try { const page = await api.list('draft', currentPage.value + 1, 100); campaigns.value.push(...page.items.filter((item) => !campaigns.value.some((existing) => existing.id === item.id))); currentPage.value++; hasMore.value = page.total > campaigns.value.length }
  catch { error.value = 'Could not load more drafts. Try again.' }
  finally { loading.value = false }
}
watch(selectedId, async (id) => {
  error.value = ''; alreadyAdded.value = false
  if (!id) return
  membershipLoading.value = true
  try { const roster = await api.listRoster(id); if (selectedId.value === id) alreadyAdded.value = roster.some((row) => row.creator_profile_id === props.profileId) }
  catch { if (selectedId.value === id) error.value = 'Could not check roster membership. Add creator will check again.' }
  finally { if (selectedId.value === id) membershipLoading.value = false }
})
async function add() {
  if (!selectedId.value || submitting.value || result.value) return
  submitting.value = true; error.value = ''
  const campaignId = selectedId.value
  try {
    const roster = await api.listRoster(campaignId)
    const existing = roster.find((row) => row.creator_profile_id === props.profileId && !['removed', 'withdrawn'].includes(row.status))
    if (existing) { result.value = { message: `Already in ${campaigns.value.find((item) => item.id === campaignId)?.name}.`, href: `/app/youtube-brand-campaign/campaigns/${campaignId}?tab=roster` }; return }
    await api.addCreators(campaignId, [props.profileId])
    result.value = { message: `Added to ${campaigns.value.find((item) => item.id === campaignId)?.name}.`, href: `/app/youtube-brand-campaign/campaigns/${campaignId}?tab=roster` }
  } catch (cause: any) {
    const detail = cause?.response?.data?.detail
    if (typeof detail === 'string' && detail.includes('already on this roster')) { alreadyAdded.value = true; result.value = { message: 'This creator is already in the selected campaign.', href: rosterHref.value } }
    else error.value = typeof detail === 'string' ? detail : 'Could not add this creator. Your campaign selection is preserved; try Add creator again.'
  }
  finally { submitting.value = false }
}
watch(() => props.modelValue, async (open) => {
  if (open) { await nextTick(); dialog.value?.showModal(); selectedId.value = ''; campaigns.value = []; alreadyAdded.value = false; void loadDrafts() }
  else { requestVersion++; dialog.value?.close(); result.value = null; error.value = '' }
}, { immediate: true })
onBeforeUnmount(() => { requestVersion++; dialog.value?.close() })
</script>
