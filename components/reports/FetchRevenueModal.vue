<template>
  <div v-if="open" class="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-foreground dark:text-white">Legacy monthly fetch</h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Legacy flow to fetch by month. Prefer Raw Fetch page for daily window + affected-month auto-recalculate.
          </p>
        </div>
        <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
          <input
            v-model="local.month"
            type="month"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select one month for legacy monthly fetch.
          </p>
        </div>

        <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {{ error }}
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          :disabled="syncing"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          class="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="syncing || !local.month"
          @click="submit"
        >
          {{ syncing ? 'Syncing…' : 'Run legacy fetch' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  open: boolean
  syncing: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { month_from: number; month_to?: number }): void
}>()

const local = reactive<{ month: string }>({
  month: '',
})

const toYYYYMM = (v: string) => {
  if (!v) return undefined
  const [y, m] = v.split('-')
  if (!y || !m) return undefined
  return Number(`${y}${m}`)
}

const setDefaultMonth = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  local.month = `${y}-${m}`
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      setDefaultMonth()
    }
  },
  { immediate: true }
)

const submit = () => {
  const month = toYYYYMM(local.month)
  if (!month) return
  emit('submit', {
    month_from: month,
  })
}
</script>

