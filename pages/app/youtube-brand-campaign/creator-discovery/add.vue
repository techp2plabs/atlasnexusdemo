<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12">
      <h1 class="text-2xl font-bold text-foreground dark:text-white">Add creators</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Fetch channels by ID, URL, or @handle, then optionally add contact info, social media, and a rate card
        before saving them to the creator bank.
      </p>
    </div>

    <!-- Stepper — a genuine sequence, so numbering earns its place here. -->
    <div class="col-span-12">
      <ol class="flex items-center">
        <li v-for="(s, i) in STEPS" :key="s.key" class="flex flex-1 items-center last:flex-none">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg py-1 pr-2 text-left disabled:cursor-default"
            :disabled="stepStatus(s.key) !== 'done'"
            @click="stepStatus(s.key) === 'done' && goToStep(s.key)"
          >
            <span
              :class="[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                stepStatus(s.key) === 'done' ? 'bg-primary text-primary-foreground' : '',
                stepStatus(s.key) === 'current' ? 'border-2 border-brand-500 text-brand-600 dark:text-brand-400' : '',
                stepStatus(s.key) === 'upcoming' ? 'border-2 border-border text-gray-400 dark:border-gray-700' : '',
              ]"
            >
              <svg v-if="stepStatus(s.key) === 'done'" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"/></svg>
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span
              :class="[
                'text-sm font-medium',
                stepStatus(s.key) === 'upcoming' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white/90',
              ]"
            >{{ s.label }}</span>
          </button>
          <span v-if="i < STEPS.length - 1" class="mx-3 h-px flex-1" :class="stepStatus(STEPS[i + 1].key) === 'upcoming' ? 'bg-gray-200 dark:bg-gray-800' : 'bg-brand-500'" />
        </li>
      </ol>
    </div>

    <!-- Step 1: Fetch -->
    <div v-if="step === 'fetch'" class="col-span-12 rounded-xl border border-border bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Channel ID, URL, or @handle — one per line (max 50)</label>
        <span class="text-xs text-gray-400">{{ entryLines.length }} / 50 entries</span>
      </div>
      <textarea
        v-model="entriesText"
        rows="6"
        placeholder="UCxxxxxxx&#10;@handle&#10;https://www.youtube.com/@another"
        :disabled="fetching"
        class="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />

      <div v-if="rows.length" class="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="row in rows" :key="row.input" class="flex items-center justify-between py-2 text-sm">
          <span class="truncate text-gray-600 dark:text-gray-300">{{ row.input }}</span>
          <span :class="['text-xs font-medium', statusTone(row.status)]">{{ statusLabel(row.status) }}</span>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <NuxtLink to="/app/youtube-brand-campaign/creator-discovery" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          Cancel
        </NuxtLink>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
            :disabled="fetching || entryLines.length === 0 || entryLines.length > 50"
            @click="doFetch"
          >
            {{ fetching ? `Fetching… (${resolvedCount}/${entryLines.length})` : rows.length ? 'Fetch again' : 'Fetch' }}
          </button>
          <button
            type="button"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            :disabled="fetching || successRows.length === 0"
            @click="goToStep('enrich')"
          >
            Continue with {{ successRows.length }} creator{{ successRows.length === 1 ? '' : 's' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Add details -->
    <template v-if="step === 'enrich'">
      <div class="col-span-12 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white/90">Add details</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">Every field below is optional</span>
      </div>

      <div v-for="row in successRows" :key="row.input" class="col-span-12 rounded-xl border border-border bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-start gap-3">
          <img v-if="row.preview!.thumbnail_url" :src="row.preview!.thumbnail_url" class="h-12 w-12 shrink-0 rounded-full object-cover" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-gray-800 dark:text-white/90">{{ row.preview!.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatCompactNumber(row.preview!.subscriber_count) }} subs · {{ row.preview!.custom_url || row.input }}
            </p>
          </div>
          <button type="button" class="shrink-0 text-xs text-gray-400 hover:text-error-600" @click="removeRow(row)">Remove</button>
        </div>

        <button type="button" class="mt-3 text-xs font-medium text-brand-600 hover:underline" @click="row.expanded = !row.expanded">
          {{ row.expanded ? 'Hide' : 'Add' }} contact &amp; social info
        </button>

        <div v-if="row.expanded" class="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Contact</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
              <input v-model="row.contact.email" type="email" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">WhatsApp / Phone</label>
              <input v-model="row.contact.whatsapp" type="text" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-1 flex items-center justify-between">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Other social media</label>
              <button type="button" class="text-xs text-brand-600 hover:underline" @click="row.socialLinks.push({ platform: '', handle_or_url: '', note: '' })">+ Add</button>
            </div>
            <div v-for="(s, i) in row.socialLinks" :key="i" class="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input v-model="s.platform" placeholder="Platform" class="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <input v-model="s.handle_or_url" placeholder="Handle / URL" class="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm sm:col-span-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <div class="flex gap-2">
                <input v-model="s.note" placeholder="Note" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                <button type="button" class="shrink-0 text-xs text-error-600" @click="row.socialLinks.splice(i, 1)">✕</button>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Rate card</p>
            <div class="mb-3 flex flex-wrap items-end gap-3">
              <div><label class="mb-1 block text-xs text-gray-500">Currency for all rates</label><select v-model="row.rateCard.currency" class="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"><option value="">Choose currency</option><option value="IDR">IDR</option><option value="USD">USD</option></select></div>
              <label class="flex items-center gap-2 text-xs text-gray-600"><input v-model="row.rateCard.currencyVerified" type="checkbox" :disabled="!row.rateCard.currency" /> I confirm the currency for these prices</label>
            </div>
            <p v-if="row.preview?.country === 'ID' && row.rateCard.currency === 'IDR'" class="mb-2 text-xs text-gray-500">IDR suggested from channel country; confirm the transaction currency above.</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p class="mb-1 text-xs text-gray-500 dark:text-gray-400">Shorts</p>
                <div class="flex gap-2">
                  <input v-model.number="row.rateCard.shorts.min" type="number" placeholder="Min" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  <input v-model.number="row.rateCard.shorts.max" type="number" placeholder="Max" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <input v-model="row.rateCard.shorts.note" placeholder="Note" class="mt-2 h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <p class="mb-1 text-xs text-gray-500 dark:text-gray-400">Long-form</p>
                <div class="flex gap-2">
                  <input v-model.number="row.rateCard.longform.min" type="number" placeholder="Min" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  <input v-model.number="row.rateCard.longform.max" type="number" placeholder="Max" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <input v-model="row.rateCard.longform.note" placeholder="Note" class="mt-2 h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 flex items-center justify-between">
        <button type="button" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" @click="goToStep('fetch')">
          Back to fetch
        </button>
        <button
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          :disabled="successRows.length === 0"
          @click="goToStep('submit')"
        >
          Review &amp; save
        </button>
      </div>
    </template>

    <!-- Step 3: Submit — progress, then success -->
    <template v-if="step === 'submit'">
      <div v-if="submitPhase !== 'done'" class="col-span-12 rounded-xl border border-border bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <h2 class="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Save to creator bank</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ successRows.length }} creator{{ successRows.length === 1 ? '' : 's' }} will be added, {{ enrichedCount }} with contact/social/rate-card details filled in.
        </p>

        <div v-if="submitPhase === 'saving'" class="mt-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
          Saving {{ successRows.length }} creator{{ successRows.length === 1 ? '' : 's' }} to the bank…
        </div>

        <div class="mt-4 flex items-center justify-between">
          <button type="button" class="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200" :disabled="submitPhase === 'saving'" @click="goToStep('enrich')">
            Back to details
          </button>
          <button
            type="button"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            :disabled="submitPhase === 'saving' || successRows.length === 0"
            @click="doSubmit"
          >
            {{ submitPhase === 'saving' ? 'Saving…' : `Save ${successRows.length} creator${successRows.length === 1 ? '' : 's'}` }}
          </button>
        </div>
      </div>

      <div v-else class="col-span-12 rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-500/30 dark:bg-success-500/10">
        <p class="text-sm font-medium text-success-700 dark:text-success-400">
          Added {{ createdCount }} creator{{ createdCount === 1 ? '' : 's' }}{{ duplicateCount ? `, updated ${duplicateCount} already in the bank` : '' }}.
        </p>
        <div class="mt-3 flex gap-2">
          <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/5" @click="startOver">
            Add more creators
          </button>
          <NuxtLink to="/app/youtube-brand-campaign/creator-discovery" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Done — view Creator Discovery
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import { useCreatorDiscovery, type CreatorLookupPreview, type BulkImportResultRow, type SocialLink } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import { formatCompactNumber } from '~/utils/youtubeBrandCampaignFormat'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'],
})

const { lookup, saveBatch } = useCreatorDiscovery()
const route = useRoute()
const router = useRouter()

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Creator Discovery', to: '/app/youtube-brand-campaign/creator-discovery' },
  { label: 'Add Creators' },
]

// ── Step routing — the current step lives in ?step=, so the browser's
// back/forward buttons move between steps and a step link can be shared.
// Fetched rows stay in this component's memory (not the URL): the flow is
// a single page, so switching ?step= never remounts and never loses them.
type Step = 'fetch' | 'enrich' | 'submit'
const STEPS: { key: Step; label: string }[] = [
  { key: 'fetch', label: 'Fetch channels' },
  { key: 'enrich', label: 'Add details' },
  { key: 'submit', label: 'Save to bank' },
]

const step = computed<Step>(() => {
  const q = route.query.step
  return q === 'enrich' || q === 'submit' ? q : 'fetch'
})

function goToStep(target: Step) {
  router.push({ query: { ...route.query, step: target } })
}

function stepStatus(key: Step): 'done' | 'current' | 'upcoming' {
  const order: Step[] = ['fetch', 'enrich', 'submit']
  const idx = order.indexOf(key)
  const curIdx = order.indexOf(step.value)
  if (key === step.value) return 'current'
  return idx < curIdx ? 'done' : 'upcoming'
}

// A direct/refreshed load of ?step=enrich or ?step=submit with nothing
// fetched yet has no data to enrich or save — send it back to the start
// instead of rendering an empty step.
watch(step, (s) => {
  if (s !== 'fetch' && successRows.value.length === 0) {
    router.replace({ query: { ...route.query, step: 'fetch' } })
  }
}, { immediate: true })

interface Row {
  input: string
  status: 'pending' | 'success' | 'not_found' | 'error'
  preview: CreatorLookupPreview | null
  expanded: boolean
  contact: { email: string; whatsapp: string }
  socialLinks: SocialLink[]
  rateCard: {
    currency: string
    currencyVerified: boolean
    shorts: { min?: number; max?: number; note: string }
    longform: { min?: number; max?: number; note: string }
  }
}

function emptyRateCard() {
  return {
    currency: '',
    currencyVerified: false,
    shorts: { min: undefined, max: undefined, note: '' },
    longform: { min: undefined, max: undefined, note: '' },
  }
}

const STATUS_LABELS: Record<Row['status'], string> = {
  pending: 'Fetching…',
  success: 'Fetched',
  not_found: 'Not found',
  error: 'Quota exceeded',
}
function statusLabel(status: Row['status']) {
  return STATUS_LABELS[status]
}
function statusTone(status: Row['status']) {
  if (status === 'pending') return 'text-gray-400'
  if (status === 'success') return 'text-success-600'
  return 'text-error-600'
}

const entriesText = ref('')
const entryLines = computed(() => entriesText.value.split('\n').map((l) => l.trim()).filter(Boolean))

const rows = ref<Row[]>([])
const fetching = ref(false)
const resolvedCount = ref(0)

const successRows = computed(() => rows.value.filter((r) => r.status === 'success'))
const enrichedCount = computed(() => successRows.value.filter((r) =>
  r.contact.email || r.contact.whatsapp || r.socialLinks.length ||
  r.rateCard.shorts.min || r.rateCard.shorts.max || r.rateCard.shorts.note ||
  r.rateCard.longform.min || r.rateCard.longform.max || r.rateCard.longform.note,
).length)

async function doFetch() {
  fetching.value = true
  resolvedCount.value = 0
  rows.value = entryLines.value.map((input) => ({
    input,
    status: 'pending',
    preview: null,
    expanded: false,
    contact: { email: '', whatsapp: '' },
    socialLinks: [],
    rateCard: emptyRateCard(),
  }))
  try {
    // Sequential, not Promise.all: fills results in progressively and keeps a
    // slow/quota-exhausted entry from blocking the ones queued after it.
    for (const row of rows.value) {
      try {
        row.preview = await lookup(row.input)
        row.rateCard.currency = row.preview.country?.toUpperCase() === 'ID' ? 'IDR' : ''
        row.status = 'success'
      } catch (e: any) {
        const detail = String(e?.response?.data?.detail || '')
        row.status = detail.toLowerCase().includes('quota') ? 'error' : 'not_found'
      } finally {
        resolvedCount.value += 1
      }
    }
  } finally {
    fetching.value = false
  }
}

function removeRow(row: Row) {
  const idx = rows.value.indexOf(row)
  if (idx >= 0) rows.value.splice(idx, 1)
}

const submitPhase = ref<'idle' | 'saving' | 'done'>('idle')
const submitResults = ref<BulkImportResultRow[]>([])
const createdCount = computed(() => submitResults.value.filter((r) => r.status === 'created').length)
const duplicateCount = computed(() => submitResults.value.filter((r) => r.status === 'duplicate').length)

async function doSubmit() {
  if (successRows.value.some(row => {
    const card = row.rateCard
    const priced = [card.shorts.min, card.shorts.max, card.longform.min, card.longform.max].some(value => value != null)
    return priced && (!card.currency || !card.currencyVerified)
  })) {
    window.alert('Choose and confirm the currency for every creator with a rate card.')
    return
  }
  submitPhase.value = 'saving'
  try {
    const items = successRows.value.map((row) => ({
      ...row.preview!,
      contact: row.contact.email || row.contact.whatsapp
        ? { email: row.contact.email || undefined, whatsapp: row.contact.whatsapp || undefined }
        : undefined,
      social_links: row.socialLinks.filter((s) => s.platform && s.handle_or_url),
      rate_card: ([row.rateCard.shorts.min, row.rateCard.shorts.max, row.rateCard.longform.min, row.rateCard.longform.max].some(value => value != null)
        || row.rateCard.shorts.note || row.rateCard.longform.note)
        ? { currency: row.rateCard.currency || undefined, currency_verified: row.rateCard.currencyVerified,
            shorts: { min: row.rateCard.shorts.min == null ? undefined : String(row.rateCard.shorts.min), max: row.rateCard.shorts.max == null ? undefined : String(row.rateCard.shorts.max), note: row.rateCard.shorts.note },
            longform: { min: row.rateCard.longform.min == null ? undefined : String(row.rateCard.longform.min), max: row.rateCard.longform.max == null ? undefined : String(row.rateCard.longform.max), note: row.rateCard.longform.note } }
        : undefined,
    }))
    submitResults.value = await saveBatch(items)
    submitPhase.value = 'done'
  } catch (e) {
    submitPhase.value = 'idle'
    throw e
  }
}

function startOver() {
  rows.value = []
  entriesText.value = ''
  submitPhase.value = 'idle'
  submitResults.value = []
  goToStep('fetch')
}
</script>
