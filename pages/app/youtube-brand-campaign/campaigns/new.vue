<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12 lg:col-span-8 lg:col-start-3">
      <div class="rounded-xl border border-border bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <h1 class="mb-1 text-xl font-bold text-foreground dark:text-white">New Campaign</h1>
        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Only what's needed to create a draft. Investment mix, products, and forecast live in the campaign workspace once created.
          A unique campaign code is auto-generated at launch — you don't type it.
        </p>

        <form class="space-y-4" @submit.prevent="submit">
          <div v-if="showOrgPicker">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Organization *</label>
            <select
              v-model="form.organization_id"
              required
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="" disabled>Select an organization…</option>
              <option v-for="o in organizations" :key="o.id" :value="o.id">{{ o.brand_name || o.name }}</option>
            </select>
            <p v-if="organizations.length === 0 && !loadingOrgs" class="mt-1 text-xs text-gray-400">No organizations found.</p>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              MCN Partner{{ mcnRequired ? ' *' : '' }}
            </label>
            <select
              v-model="form.mcn_id"
              :required="mcnRequired"
              :disabled="!effectiveOrganizationId || loadingMcns"
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/50"
            >
              <option value="">{{ mcnRequired ? 'Select an MCN Partner…' : 'No MCN Partner' }}</option>
              <option v-for="m in mcns" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <p v-if="showOrgPicker && !effectiveOrganizationId" class="mt-1 text-xs text-gray-400">Select an organization first.</p>
            <p v-else-if="!loadingMcns && mcns.length === 0" class="mt-1 text-xs text-gray-400">
              No MCN Partners configured for this organization — the campaign will be created without one.
            </p>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign name *</label>
            <input v-model="form.name" type="text" required class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Brand *</label>
            <input v-model="form.brand" type="text" required class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div v-if="currencyEnabled">
            <label for="campaign-currency" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign currency *</label>
            <select id="campaign-currency" v-model="form.currency" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="USD">USD — US Dollar</option>
              <option value="IDR">IDR — Indonesian Rupiah</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Total budget ({{ form.currency }}) *</label>
            <input v-model.number="form.budget_total" type="number" min="0" required class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Start date *</label>
              <input v-model="form.start_date" type="date" required class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">End date *</label>
              <input v-model="form.end_date" type="date" required class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <p v-if="error" class="text-sm text-error-600 dark:text-error-500">{{ error }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <NuxtLink to="/app/youtube-brand-campaign/campaigns" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5">
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="!isValid || submitting"
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ submitting ? 'Creating…' : 'Create & Continue →' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import { useCampaignsApi } from '~/composables/youtubeBrandCampaign/useCampaignsApi'
import { useMcns } from '~/composables/useMcns'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'],
})

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Campaigns', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'New Campaign' },
]

const { create, listOrganizationsForCreate } = useCampaignsApi()
const authStore = useAuthStore()
const route = useRoute()
const { get: apiGet } = useApi()
const currencyEnabled = ref(false)
async function loadCurrencyDefault() {
  if (!currencyEnabled.value || !effectiveOrganizationId.value) return
  try {
    const { data } = await apiGet<{ default_campaign_currency?: string | null }>(`/api/v1/organizations/${effectiveOrganizationId.value}`)
    form.currency = data.default_campaign_currency || 'USD'
  } catch {
    form.currency = 'USD'
  }
}
onMounted(async () => {
  try {
    await apiGet('/api/v1/fx/currencies')
    currencyEnabled.value = true
    form.currency = 'USD'
    await loadCurrencyDefault()
  } catch {
    currencyEnabled.value = false
  }
})

// atlas_admin/atlas_superadmin have no organization of their own — see
// campaign_service._effective_organization_id. Every other agency role's own
// organization is assigned server-side, so no picker is shown for them.
const showOrgPicker = computed(() => authStore.isAdmin)
const organizations = ref<{ id: string; name: string; brand_name: string }[]>([])
const loadingOrgs = ref(false)
onMounted(async () => {
  if (!showOrgPicker.value) return
  loadingOrgs.value = true
  try {
    organizations.value = await listOrganizationsForCreate()
  } finally {
    loadingOrgs.value = false
  }
})

const form = reactive({
  name: '',
  brand: '',
  currency: 'IDR',
  budget_total: null as number | null,
  start_date: '',
  end_date: '',
  organization_id: '',
  mcn_id: '',
})

// org_owner/org_admin have their organization fixed server-side (no picker,
// see showOrgPicker above) — their MCN Partner list still needs an org id to
// cascade off, so fall back to the user's own organization.
const effectiveOrganizationId = computed(() =>
  showOrgPicker.value ? form.organization_id : authStore.user?.organization_id || '',
)

const { mcns, loading: loadingMcns, fetchMcns } = useMcns()
// Only required once the resolved organization actually has MCN Partners —
// an organization with none configured must still be able to create a
// campaign (release-plan-20260922-...-mcn-partner-picker.md §6).
const mcnRequired = computed(() => mcns.value.length > 0)

watch(
  effectiveOrganizationId,
  async (orgId) => {
    form.mcn_id = ''
    if (!orgId) {
      mcns.value = []
      return
    }
    await fetchMcns({ organization_id: orgId, page_size: 100 })
    await loadCurrencyDefault()
  },
  { immediate: true },
)

const isValid = computed(
  () =>
    form.name.trim() &&
    form.brand.trim() &&
    form.budget_total &&
    form.budget_total > 0 &&
    form.start_date &&
    form.end_date &&
    (!showOrgPicker.value || form.organization_id) &&
    (!mcnRequired.value || form.mcn_id),
)

const submitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  error.value = null
  try {
    const campaign = await create({
      name: form.name,
      brand_name: form.brand,
      currency: currencyEnabled.value ? form.currency : undefined,
      total_budget: form.budget_total!,
      start_date: form.start_date,
      end_date: form.end_date,
      organization_id: showOrgPicker.value ? form.organization_id : undefined,
      mcn_id: form.mcn_id || undefined,
    })
    const discoveryCreator = route.query.discovery_creator
    if (typeof discoveryCreator === 'string' && /^[0-9a-f-]{36}$/i.test(discoveryCreator)) {
      navigateTo({ path: `/app/youtube-brand-campaign/creator-discovery/${discoveryCreator}`, query: { campaign: campaign.id } })
    } else navigateTo(`/app/youtube-brand-campaign/campaigns/${campaign.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Failed to create campaign'
  } finally {
    submitting.value = false
  }
}
</script>
