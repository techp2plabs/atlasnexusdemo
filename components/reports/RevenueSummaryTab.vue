<template>
  <div class="space-y-6">
    <p v-if="ownerType" class="text-sm text-gray-600 dark:text-gray-400">
      MCN owner type: <span class="font-mono text-foreground dark:text-gray-200">{{ ownerType }}</span>
    </p>

    <div
      v-if="grossComponentEntries.length"
      class="rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Gross components (split base)</h3>
      <ul class="mt-2 space-y-1 text-sm text-gray-800 dark:text-gray-200">
        <li v-for="[k, v] in grossComponentEntries" :key="k" class="flex justify-between gap-4">
          <span class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ k }}</span>
          <span>${{ formatNumber(v) }}</span>
        </li>
      </ul>
    </div>

    <!-- Total Revenue Card -->
    <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Gross Revenue</h3>
      <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">
        ${{ formatNumber(summary.gross_revenue_usd) }}
      </p>
    </div>

    <div
      v-if="subtypeEntries.length"
      class="rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Subtype breakdown</h3>
      <ul class="mt-2 space-y-1 text-sm text-gray-800 dark:text-gray-200">
        <li v-for="[k, v] in subtypeEntries" :key="k" class="flex justify-between gap-4">
          <span class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ k }}</span>
          <span>${{ formatNumber(v) }}</span>
        </li>
      </ul>
    </div>

    <!-- Revenue by Type Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in revenueTypes"
        :key="item.type"
        class="rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ item.label }}</h4>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            :class="item.colorClass"
          >
            {{ item.percentage }}%
          </span>
        </div>
        <p class="mt-2 text-xl font-semibold text-foreground dark:text-white">
          ${{ formatNumber(item.amount) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DetailRevenueSummary } from '~/composables/useRevenueDetail'

const props = defineProps<{
  summary: DetailRevenueSummary
  ownerType?: string
}>()

const subtypeEntries = computed(() => {
  const m = props.summary.by_subtype
  if (!m || typeof m !== 'object') return []
  return Object.entries(m).filter(([, v]) => Number(v) !== 0)
})

const grossComponentEntries = computed(() => {
  const m = props.summary.gross_components
  if (!m || typeof m !== 'object') return []
  return Object.entries(m).filter(([, v]) => Number(v) !== 0)
})

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const revenueTypes = computed(() => {
  const gross = Number(props.summary.gross_revenue_usd) || 1
  const byType = props.summary.by_report_type

  return [
    {
      type: 'ads',
      label: 'Ads Revenue',
      amount: Number(byType.ads) || 0,
      percentage: ((Number(byType.ads) / gross) * 100).toFixed(1),
      colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
      type: 'subscriptions',
      label: 'Subscriptions',
      amount: Number(byType.subscriptions) || 0,
      percentage: ((Number(byType.subscriptions) / gross) * 100).toFixed(1),
      colorClass: 'bg-accent text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
    },
    {
      type: 'shorts',
      label: 'Shorts',
      amount: Number(byType.shorts) || 0,
      percentage: ((Number(byType.shorts) / gross) * 100).toFixed(1),
      colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    {
      type: 'taxes',
      label: 'Tax Withheld',
      amount: Number(byType.taxes) || 0,
      percentage: ((Number(byType.taxes) / gross) * 100).toFixed(1),
      colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    },
    {
      type: 'audio_tier',
      label: 'Audio tier',
      amount: Number(byType.audio_tier) || 0,
      percentage: ((Number(byType.audio_tier || 0) / gross) * 100).toFixed(1),
      colorClass: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
    },
  ].filter((row) => row.type !== 'audio_tier' || row.amount !== 0)
})
</script>
