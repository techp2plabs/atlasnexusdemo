<template>
  <div
    class="fixed right-0 top-0 z-[100000] h-full w-full max-w-md border-l border-border bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
  >
    <div class="flex items-start justify-between gap-4 border-b border-border px-5 py-4 dark:border-gray-800">
      <div>
        <div class="text-sm font-semibold text-foreground dark:text-white">
          {{ title }}
        </div>
        <div v-if="subtitle" class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {{ subtitle }}
        </div>
      </div>
      <button
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>

    <div class="h-[calc(100%-64px)] overflow-y-auto p-5">
      <div v-if="!contracts || totalCount === 0" class="text-sm text-gray-600 dark:text-gray-400">
        No contracts found.
      </div>

      <div v-else class="space-y-4">
        <ContractGroup title="Active" :items="contracts.active" />
        <ContractGroup title="Future" :items="contracts.future" />
        <ContractGroup title="Expired" :items="contracts.expired" />

        <div
          v-if="contracts.contracts_truncated"
          class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200"
        >
          Some contract lists were truncated. Refine filters to narrow results.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import type { ContractGroups, ContractSummary } from '~/composables/useContractTree'

const props = defineProps<{
  title: string
  subtitle?: string
  contracts: ContractGroups | null
}>()

defineEmits<{ (e: 'close'): void }>()

const formatPct = (n: number) => `${Number(n).toFixed(2)}%`

const totalCount = computed(() => {
  return (
    (props.contracts?.active?.length || 0) +
    (props.contracts?.future?.length || 0) +
    (props.contracts?.expired?.length || 0)
  )
})

const ContractGroup = defineComponent({
  name: 'ContractGroup',
  props: {
    title: { type: String, required: true },
    items: { type: Array as () => ContractSummary[], required: true },
  },
  setup() {
    return { formatPct }
  },
  template: `
    <div v-if="items.length">
      <div class="text-xs font-semibold text-gray-700 dark:text-gray-200">{{ title }}</div>
      <div class="mt-2 space-y-2">
        <NuxtLink
          v-for="c in items"
          :key="c.id"
          :to="'/app/contracts/' + c.id"
          class="block rounded-lg border border-border bg-white p-3 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-foreground dark:text-white">
                {{ c.contract_number || c.id }}
              </div>
              <div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Start: {{ c.start_date }}<span v-if="c.end_date"> • End: {{ c.end_date }}</span>
                <span v-if="c.effective_date"> • Effective: {{ c.effective_date }}</span>
              </div>
            </div>
            <div class="shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-200">
              {{ formatPct(c.revenue_share_pct) }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  `,
})
</script>

