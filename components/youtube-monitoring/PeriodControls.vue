<template>
  <div class="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-center gap-2">
      <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Period</label>
      <select
        v-model="period"
        class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        <option value="today">Today</option>
        <option value="last7">Last 7 Days</option>
        <option value="thisMonth">This Month</option>
        <option value="lastMonth">Last Month</option>
        <option value="custom">Custom Month</option>
      </select>
    </div>

    <div v-if="period === 'custom'" class="flex items-center gap-2">
      <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Month</label>
      <input
        v-model="customMonth"
        type="month"
        :max="currentMonthValue"
        class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      />
    </div>

    <div class="flex items-center gap-2">
      <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Granularity</label>
      <div class="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          :class="granularityBtnClass('hourly')"
          @click="granularity = 'hourly'"
        >Hourly</button>
        <button
          type="button"
          :class="granularityBtnClass('daily')"
          @click="granularity = 'daily'"
        >Daily</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Granularity } from '~/composables/useYoutubeMonitoring'

type Period = 'today' | 'last7' | 'thisMonth' | 'lastMonth' | 'custom'

const emit = defineEmits<{
  change: [{ startDate: string; endDate: string; granularity: Granularity }]
}>()

const period = ref<Period>('thisMonth')
const granularity = ref<Granularity>('daily')

const pad = (n: number) => String(n).padStart(2, '0')
const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const currentMonthValue = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
})
const customMonth = ref(currentMonthValue.value)

function granularityBtnClass(g: Granularity) {
  return [
    'px-3 py-1.5 text-sm font-medium transition-colors',
    granularity.value === g
      ? 'bg-brand-600 text-white'
      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  ]
}

function computeRange(): { startDate: string; endDate: string } {
  const now = new Date()
  if (period.value === 'today') {
    const s = toDateStr(now)
    return { startDate: s, endDate: s }
  }
  if (period.value === 'last7') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { startDate: toDateStr(start), endDate: toDateStr(now) }
  }
  if (period.value === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { startDate: toDateStr(start), endDate: toDateStr(now) }
  }
  if (period.value === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return { startDate: toDateStr(start), endDate: toDateStr(end) }
  }
  // custom month, e.g. "2026-06"
  const [year, month] = customMonth.value.split('-').map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  return { startDate: toDateStr(start), endDate: toDateStr(end) }
}

function applyDefaultGranularity() {
  granularity.value = period.value === 'today' || period.value === 'last7' ? 'hourly' : 'daily'
}

function emitChange() {
  const { startDate, endDate } = computeRange()
  emit('change', { startDate, endDate, granularity: granularity.value })
}

watch(period, () => {
  applyDefaultGranularity()
  emitChange()
})
watch([customMonth, granularity], emitChange)

emitChange()
</script>
