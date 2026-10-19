<template>
  <div
    v-if="grossComponentLines.length"
    class="mb-6 rounded-lg border border-amber-200 bg-amber-50/80 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30"
  >
    <h3 class="text-sm font-semibold text-amber-950 dark:text-amber-100">Gross components (split base)</h3>
    <p class="mt-1 text-xs text-amber-900/80 dark:text-amber-200/90">Amounts that sum to split gross for this MCN owner type.</p>
    <ul class="mt-2 space-y-1 text-sm">
      <li v-for="line in grossComponentLines" :key="line.key" class="flex justify-between gap-4 font-mono text-xs text-amber-950 dark:text-amber-100">
        <span>{{ line.key }}</span>
        <span>${{ formatNumber(line.amount) }}</span>
      </li>
    </ul>
  </div>

  <div
    v-if="subtypeLines.length"
    class="mb-6 rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
  >
    <h3 class="text-sm font-semibold text-foreground dark:text-white">Subtype detail</h3>
    <ul class="mt-2 space-y-1 text-sm">
      <li v-for="line in subtypeLines" :key="line.key" class="flex justify-between gap-4 font-mono text-xs text-gray-700 dark:text-gray-300">
        <span>{{ line.key }}</span>
        <span>${{ formatNumber(line.amount) }}</span>
      </li>
    </ul>
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div
      v-for="item in typeCards"
      :key="item.type"
      class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg"
          :class="item.iconBg"
        >
          <svg class="h-6 w-6" :class="item.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path v-if="item.type === 'ads'" stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path v-if="item.type === 'ads'" stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path v-if="item.type === 'subscriptions'" stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            <path v-if="item.type === 'shorts'" stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            <path v-if="item.type === 'taxes'" stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-foreground dark:text-white">{{ item.label }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.description }}</p>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-baseline justify-between">
          <span class="text-3xl font-bold text-foreground dark:text-white">
            ${{ formatNumber(item.amount) }}
          </span>
          <span class="text-sm font-medium" :class="item.percentColor">
            {{ item.percentage }}% of total
          </span>
        </div>

        <!-- Progress bar -->
        <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="item.barColor"
            :style="{ width: `${Math.min(100, Math.abs(parseFloat(item.percentage)))}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RevenueByType } from '~/composables/useRevenueDetail'

const props = defineProps<{
  byType: RevenueByType
  gross: number
  bySubtype?: Record<string, number> | null
  grossComponents?: Record<string, number> | null
}>()

const grossComponentLines = computed(() => {
  const m = props.grossComponents
  if (!m) return []
  return Object.entries(m)
    .map(([key, amount]) => ({ key, amount: Number(amount) || 0 }))
    .filter((l) => l.amount !== 0)
})

const subtypeLines = computed(() => {
  const m = props.bySubtype
  if (!m) return []
  return Object.entries(m)
    .map(([key, amount]) => ({ key, amount: Number(amount) || 0 }))
    .filter((l) => l.amount !== 0)
})

const formatNumber = (value: number | string) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

const typeCards = computed(() => {
  const gross = Number(props.gross) || 1

  return [
    {
      type: 'ads',
      label: 'Ads Revenue',
      description: 'Revenue from video advertisements',
      amount: Number(props.byType.ads) || 0,
      percentage: ((Number(props.byType.ads) / gross) * 100).toFixed(1),
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      percentColor: 'text-blue-600 dark:text-blue-400',
      barColor: 'bg-blue-500',
    },
    {
      type: 'subscriptions',
      label: 'Subscriptions',
      description: 'YouTube Premium revenue share',
      amount: Number(props.byType.subscriptions) || 0,
      percentage: ((Number(props.byType.subscriptions) / gross) * 100).toFixed(1),
      iconBg: 'bg-accent dark:bg-brand-900/30',
      iconColor: 'text-accent-foreground dark:text-brand-400',
      percentColor: 'text-accent-foreground dark:text-brand-400',
      barColor: 'bg-brand-500',
    },
    {
      type: 'shorts',
      label: 'Shorts',
      description: 'Revenue from YouTube Shorts',
      amount: Number(props.byType.shorts) || 0,
      percentage: ((Number(props.byType.shorts) / gross) * 100).toFixed(1),
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      percentColor: 'text-green-600 dark:text-green-400',
      barColor: 'bg-green-500',
    },
    {
      type: 'taxes',
      label: 'Tax Withheld',
      description: 'Tax withholding amounts',
      amount: Number(props.byType.taxes) || 0,
      percentage: ((Number(props.byType.taxes) / gross) * 100).toFixed(1),
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      percentColor: 'text-red-600 dark:text-red-400',
      barColor: 'bg-red-500',
    },
    {
      type: 'audio_tier',
      label: 'Audio tier',
      description: 'Music-label audio tier revenue (when present)',
      amount: Number(props.byType.audio_tier) || 0,
      percentage: ((Number(props.byType.audio_tier || 0) / gross) * 100).toFixed(1),
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-800 dark:text-amber-200',
      percentColor: 'text-amber-800 dark:text-amber-200',
      barColor: 'bg-amber-500',
    },
  ].filter((c) => c.type !== 'audio_tier' || c.amount !== 0)
})
</script>
