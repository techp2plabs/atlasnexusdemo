<template>
  <div class="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <h4 class="text-sm font-semibold text-gray-800 dark:text-white/90">Commerce baseline</h4>
      <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        YouTube Shopping Affiliate
      </span>
      <InfoTooltip metric-key="net_gmv" />
      <button
        v-if="hasData"
        type="button"
        class="ml-auto rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        @click="openModal"
      >
        Upload commerce data
      </button>
    </div>
    <p class="mb-4 text-xs text-gray-400">
      Merchant-reported product sales attributed to this creator — not an official YouTube metric.
    </p>

    <div v-if="loading" class="py-6 text-center text-sm text-gray-400">Loading commerce baseline…</div>

    <EmptyState
      v-else-if="!hasData"
      title="No commerce data yet"
      description="Upload the monthly YouTube Studio → Earn → Shopping export to activate Monthly GMV & AOV."
      action-label="Upload commerce data"
      @action="openModal"
    />

    <template v-else-if="activePeriod">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <label class="text-xs text-gray-400">Period</label>
        <select
          v-model="selectedPeriod"
          class="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option v-for="p in summary!.periods" :key="p.period" :value="p.period">
            {{ formatPeriod(p.period) }}
          </option>
        </select>
        <span v-if="summary!.headline && summary!.headline.period_count > 1" class="text-xs text-gray-400">
          Headline is the average of {{ summary!.headline.period_count }} months
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricValue
          label="Avg. Monthly GMV"
          :value="money(summary!.headline?.avg_monthly_gmv ?? null, activePeriod.currency)"
          :hint="`YouTube Shopping · based on ${summary!.headline?.period_count ?? 1} month(s)`"
        />
        <MetricValue
          label="Monthly GMV"
          :value="money(activePeriod.monthly_gmv, activePeriod.currency)"
          :hint="`YouTube Shopping · ${formatPeriod(activePeriod.period)} · ${coverageLabel}`"
        />
        <MetricValue
          label="Average order value"
          :value="money(activePeriod.aov, activePeriod.currency)"
          :hint="`Reported sales / orders · ${formatPeriod(activePeriod.period)}`"
        />
        <MetricValue
          label="Avg. GMV / day"
          :value="money(activePeriod.avg_gmv_per_day, activePeriod.currency)"
          :hint="`Monthly GMV / ${activePeriod.days_in_period} days`"
        />
        <MetricValue
          v-if="activePeriod.conversion_rate !== null"
          label="Conversion rate"
          :value="`${(activePeriod.conversion_rate * 100).toFixed(2)}%`"
          hint="Orders / product clicks"
        />
        <MetricValue
          v-else
          label="Conversion rate"
          value="Insufficient data"
          :hint="`Clicks tracked for ${activePeriod.click_coverage_products} products only`"
        />
        <MetricValue
          label="Commission · realized"
          :value="money(activePeriod.realized_commission, activePeriod.currency)"
          hint="Approved commissions"
        />
        <MetricValue
          label="Commission · pipeline"
          :value="money(activePeriod.pipeline_commission, activePeriod.currency)"
          hint="Pending commissions (not yet settled)"
        />
      </div>
      <p class="mt-2 text-[11px] text-gray-400">
        Reported sales (as-reported, gross/net unconfirmed) · removed commissions {{ money(activePeriod.removed_commission, activePeriod.currency) }} shown as memo, never netted.
      </p>

      <div v-if="activePeriod.daily.length" class="mt-5">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Daily sales · {{ formatPeriod(activePeriod.period) }}</p>
        <div class="flex h-20 items-end gap-[2px]">
          <div
            v-for="d in activePeriod.daily"
            :key="d.date"
            class="min-w-0 flex-1 rounded-t bg-brand-400/70 dark:bg-brand-500/60"
            :style="{ height: `${barHeight(d.total_sales)}%` }"
            :title="`${d.date}: ${money(d.total_sales, activePeriod.currency)}`"
          />
        </div>
      </div>

      <div v-if="activePeriod.top_products.length" class="mt-5">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Top products ({{ activePeriod.product_count }} products, {{ coverageLabel }} sales covered)
        </p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-left text-sm">
            <thead class="text-xs text-gray-400">
              <tr><th class="pb-2">Product</th><th class="pb-2">Sales</th><th class="pb-2">Orders</th><th class="pb-2">AOV</th></tr>
            </thead>
            <tbody>
              <tr v-for="(t, i) in activePeriod.top_products" :key="i" class="border-t border-gray-100 dark:border-gray-800">
                <td class="max-w-xs truncate py-2 text-gray-700 dark:text-gray-300">{{ t.product_title ?? '—' }}</td>
                <td class="py-2 text-gray-500">{{ money(t.total_sales, activePeriod.currency) }}</td>
                <td class="py-2 text-gray-500">{{ t.orders }}</td>
                <td class="py-2 text-gray-500">{{ money(t.aov, activePeriod.currency) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="imports.length" class="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Import history</p>
        <div v-for="imp in imports" :key="imp.id" class="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ formatPeriod(imp.period_start.slice(0, 7)) }}</span>
          <span class="text-gray-400">{{ imp.file_names.join(', ') }}</span>
          <span v-if="imp.status === 'completed'" class="rounded-full bg-success-50 px-2 py-0.5 text-success-700 dark:bg-success-500/10 dark:text-success-400">completed</span>
          <span v-else class="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 dark:bg-white/5">{{ imp.status }}</span>
          <button
            v-if="imp.status === 'completed'"
            type="button"
            class="text-error-600 hover:underline disabled:opacity-50"
            :disabled="reverting === imp.id"
            @click="doRevert(imp.id)"
          >
            {{ reverting === imp.id ? 'Reverting…' : 'Revert' }}
          </button>
        </div>
        <p class="mt-1 text-[11px] text-gray-400">Re-uploading the same period is rejected — revert the existing import first to replace it.</p>
      </div>
    </template>

    <Modal :is-open="modalOpen" title="Upload commerce data" size="lg" @close="closeModal">
      <div v-if="step === 1">
        <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">1 · Source template</p>
        <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-300 bg-brand-50/50 p-3 dark:border-brand-500/40 dark:bg-brand-500/5">
          <input type="radio" checked class="mt-1" />
          <span>
            <span class="block text-sm font-medium text-gray-800 dark:text-white/90">YouTube Shopping Affiliate v1</span>
            <span class="block text-xs text-gray-500 dark:text-gray-400">
              Monthly export from YouTube Studio → Earn → Shopping. Expected files: totals (Date, Total sales) +
              table (Product, Orders) required, chart (Date, Product daily) optional. Totals + table are reconciled on import.
            </span>
          </span>
        </label>
        <div class="mt-4 flex justify-end">
          <button type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" @click="step = 2">
            Continue
          </button>
        </div>
      </div>

      <div v-else>
        <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">2 · Files & period</p>
        <div class="grid grid-cols-1 gap-3">
          <div v-for="slot in slots" :key="slot.role" class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div class="mb-1 flex items-center gap-2">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ slot.label }}</span>
              <span v-if="!slot.required" class="text-[11px] text-gray-400">(optional)</span>
              <span v-if="sniff[slot.role]" class="ml-auto text-[11px] text-gray-400">
                detected: {{ sniff[slot.role]!.role }} · {{ sniff[slot.role]!.rows }} rows
              </span>
            </div>
            <input
              type="file"
              accept=".csv"
              class="w-full text-xs text-gray-500"
              @change="onFile(slot.role, ($event.target as HTMLInputElement).files?.[0] ?? null)"
            />
            <p v-if="sniff[slot.role]?.error" class="mt-1 text-xs text-error-600">{{ sniff[slot.role]!.error }}</p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500">Period start</label>
            <input v-model="periodStart" type="date" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500">Period end</label>
            <input v-model="periodEnd" type="date" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
        </div>
        <p class="mt-1 text-[11px] text-gray-400">Period is auto-detected from the totals file — adjust only if the file dates are wrong.</p>

        <div v-if="validationReport" class="mt-3 rounded-lg bg-gray-50 p-3 text-xs dark:bg-white/5">
          <p class="mb-1 font-medium text-gray-700 dark:text-gray-200">Validation report</p>
          <ul class="list-disc space-y-0.5 pl-4 text-gray-500 dark:text-gray-400">
            <li v-for="(line, i) in validationReport" :key="i">{{ line }}</li>
          </ul>
        </div>
        <p v-if="uploadError" class="mt-3 rounded-lg bg-error-50 p-3 text-xs text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {{ uploadError }}
        </p>

        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300" @click="step = 1">
            Back
          </button>
          <button
            type="button"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            :disabled="uploading || !canConfirm"
            @click="doUpload"
          >
            {{ uploading ? 'Uploading…' : 'Confirm import' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import EmptyState from '~/components/common/EmptyState.vue'
import MetricValue from '~/components/common/MetricValue.vue'
import Modal from '~/components/ui/Modal.vue'
import InfoTooltip from '~/components/youtubeBrandCampaign/InfoTooltip.vue'
import {
  useCreatorDiscovery,
  type CommercePeriod,
  type CommerceSummary,
  type CommerceImport,
} from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import { formatCurrency } from '~/utils/youtubeBrandCampaignFormat'

const props = defineProps<{ profileId: string }>()
const { commerceSummary, commerceImports, uploadCommerce, revertCommerceImport } = useCreatorDiscovery()

const loading = ref(true)
const summary = ref<CommerceSummary | null>(null)
const imports = ref<CommerceImport[]>([])
const selectedPeriod = ref('')
const reverting = ref<string | null>(null)

const hasData = computed(() => (summary.value?.periods.length ?? 0) > 0)
const activePeriod = computed<CommercePeriod | null>(() => {
  if (!summary.value?.periods.length) return null
  return summary.value.periods.find((p) => p.period === selectedPeriod.value)
    ?? summary.value.periods[summary.value.periods.length - 1]
})
const coverageLabel = computed(() => {
  const r = activePeriod.value?.coverage_sales_ratio
  return r === null || r === undefined ? 'coverage unknown' : `${Math.round(r * 100)}% sales covered`
})

function money(v: number | null | undefined, currency: string): string {
  return formatCurrency(v ?? null, currency || 'USD')
}
function formatPeriod(p: string): string {
  const [y, m] = p.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
function barHeight(v: number | null): number {
  const max = Math.max(...(activePeriod.value?.daily.map((d) => d.total_sales ?? 0) ?? [0]), 0)
  if (!max || v === null) return 2
  return Math.max(2, Math.round((v / max) * 100))
}

async function reload() {
  loading.value = true
  try {
    const [s, imps] = await Promise.all([
      commerceSummary(props.profileId),
      commerceImports(props.profileId),
    ])
    summary.value = s
    imports.value = imps
    if (s.periods.length && !selectedPeriod.value) selectedPeriod.value = s.periods[s.periods.length - 1].period
  } catch {
    summary.value = { periods: [], headline: null }
  } finally {
    loading.value = false
  }
}

async function doRevert(importId: string) {
  if (!window.confirm('Revert this commerce import? Its facts will be deleted.')) return
  reverting.value = importId
  try {
    await revertCommerceImport(props.profileId, importId)
    await reload()
  } catch (e: any) {
    window.alert(e?.response?.data?.detail || 'Failed to revert import')
  } finally {
    reverting.value = null
  }
}

// ── Upload modal ──────────────────────────────────────────────────────────
const modalOpen = ref(false)
const step = ref(1)
const uploading = ref(false)
const uploadError = ref('')
const periodStart = ref('')
const periodEnd = ref('')
const slots = [
  { role: 'totals', label: 'Totals file — Date, Total sales', required: true },
  { role: 'table', label: 'Table file — Product, Orders', required: true },
  { role: 'chart', label: 'Chart file — Date, Product daily', required: false },
] as const
type SlotRole = (typeof slots)[number]['role']
const picked = reactive<Record<SlotRole, File | null>>({ totals: null, table: null, chart: null })
const sniff = reactive<Record<SlotRole, { role: string; rows: number; error?: string } | null>>({
  totals: null, table: null, chart: null,
})

function openModal() {
  modalOpen.value = true
  step.value = 1
  uploadError.value = ''
}
function closeModal() {
  modalOpen.value = false
}

function detectRole(header: string[]): string | null {
  const cols = new Set(header.map((h) => h.trim().toLowerCase()))
  if (cols.has('date') && cols.has('total sales (usd)') && !cols.has('product')) return 'totals'
  if (cols.has('date') && cols.has('product')) return 'chart'
  if (cols.has('product title') && cols.has('orders') && !cols.has('date')) return 'table'
  return null
}

async function onFile(role: SlotRole, file: File | null) {
  picked[role] = file
  sniff[role] = null
  if (!file) return
  try {
    const text = await file.text()
    const lines = text.replace(/^\uFEFF/, '').split('\n').filter((l) => l.trim() !== '')
    if (lines.length < 2) {
      sniff[role] = { role: 'empty', rows: 0, error: `'${file.name}' has no data rows` }
      return
    }
    const header = lines[0].split(',')
    const detected = detectRole(header)
    if (!detected) {
      sniff[role] = { role: 'unknown', rows: 0, error: `'${file.name}': unrecognized header — expected a totals, chart, or table export` }
      return
    }
    if (detected !== role && ((role === 'totals' && detected !== 'totals') || (role === 'table' && detected !== 'table'))) {
      sniff[role] = { role: detected, rows: lines.length - 1, error: `'${file.name}' looks like a ${detected} file, but was placed in the ${role} slot` }
      return
    }
    sniff[role] = { role: detected, rows: lines.length - 1 }
    if (detected === 'totals') {
      const dates = lines.slice(1).map((l) => l.split(',')[0]?.trim()).filter(Boolean).sort()
      if (dates.length) {
        periodStart.value = dates[0]
        periodEnd.value = dates[dates.length - 1]
      }
    }
  } catch {
    sniff[role] = { role: 'unreadable', rows: 0, error: `Could not read '${file.name}'` }
  }
}

const validationReport = computed<string[] | null>(() => {
  if (!picked.totals || !picked.table) return null
  const lines = [
    `Files: ${picked.totals.name} (${sniff.totals?.rows ?? '?'} rows) + ${picked.table.name} (${sniff.table?.rows ?? '?'} rows)`
      + (picked.chart ? ` + ${picked.chart.name} (${sniff.chart?.rows ?? '?'} rows)` : ''),
    `Period: ${periodStart.value || '?'} → ${periodEnd.value || '?'} (must be one calendar month, USD only)`,
  ]
  if (sniff.totals?.error || sniff.table?.error || sniff.chart?.error) lines.push('Fix the file errors above before confirming.')
  else lines.push('Server will reconcile sum(totals) against the table Total row (±0.01) on import.')
  return lines
})
const canConfirm = computed(() => !!picked.totals && !!picked.table && !sniff.totals?.error && !sniff.table?.error && !sniff.chart?.error)

async function doUpload() {
  uploadError.value = ''
  uploading.value = true
  try {
    const files = [picked.totals!, picked.table!, ...(picked.chart ? [picked.chart] : [])]
    await uploadCommerce(props.profileId, files, {
      periodStart: periodStart.value || undefined,
      periodEnd: periodEnd.value || undefined,
    })
    closeModal()
    picked.totals = picked.table = picked.chart = null
    sniff.totals = sniff.table = sniff.chart = null
    await reload()
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    const errors = e?.response?.data?.errors
    uploadError.value = Array.isArray(errors) && errors.length
      ? `${detail ?? 'Import failed'}: ${errors.slice(0, 5).map((r: any) => r.reason).join(' · ')}`
      : (detail || 'Import failed')
  } finally {
    uploading.value = false
  }
}

onMounted(reload)
</script>
