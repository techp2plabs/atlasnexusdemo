<template>
  <div class="rounded-xl border border-border bg-gradient-to-br from-gray-50 to-white p-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-xl">💰</span>
        <h3 class="text-lg font-semibold text-foreground dark:text-white">Revenue Simulator</h3>
      </div>
      <span 
        v-if="loading" 
        class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
      >
        <span class="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
        Calculating...
      </span>
    </div>

    <!-- Input -->
    <div class="mb-5">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Estimated Monthly Revenue
      </label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
        <input
          v-model.number="grossAmount"
          type="number"
          min="0"
          step="100"
          class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-8 pr-4 text-sm focus:border-ring focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="1000"
          @input="debouncedFetch"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 mb-4">
      {{ error }}
    </div>

    <!-- Revenue Breakdown -->
    <div v-if="revenueSplit && !error" class="space-y-4">
      <!-- Visual Bar Chart -->
      <div class="relative h-10 rounded-lg overflow-hidden flex">
        <div
          v-for="(party, index) in revenueSplit.parties"
          :key="party.party_type"
          :class="[getPartyColor(party.party_type), 'transition-all duration-500 ease-out']"
          :style="{ width: getPartyWidth(party) + '%' }"
          class="relative group cursor-pointer"
        >
          <div 
            v-if="getPartyWidth(party) > 8"
            class="absolute inset-0 flex items-center justify-center text-xs font-medium text-white"
          >
            {{ formatActualPercent(party.share_amount) }}
          </div>
          <!-- Tooltip -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
            {{ party.party_name || getPartyTypeLabel(party.party_type) }}: {{ formatCurrency(party.share_amount) }}
          </div>
        </div>
      </div>

      <!-- Legend and Details -->
      <div class="space-y-2">
        <div
          v-for="party in revenueSplit.parties"
          :key="party.party_type"
          class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-center gap-3">
            <span :class="[getPartyColor(party.party_type), 'w-3 h-3 rounded-full']"></span>
            <div>
              <span class="text-sm font-medium text-foreground dark:text-white">
                {{ party.party_name || getPartyTypeLabel(party.party_type) }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({{ getPartyTypeLabel(party.party_type) }})
              </span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-semibold text-foreground dark:text-white">
              {{ formatCurrency(party.share_amount) }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatActualPercent(party.share_amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="revenueSplit.warnings.length > 0" class="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
        <div class="flex items-start gap-2">
          <span class="text-yellow-500">⚠️</span>
          <ul class="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <li v-for="(warning, index) in revenueSplit.warnings" :key="index">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Total Summary -->
      <div class="mt-4 pt-4 border-t border-border dark:border-gray-700">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Total Gross Revenue</span>
          <span class="text-lg font-bold text-foreground dark:text-white">{{ formatCurrency(grossAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && !error" class="text-center py-6 text-gray-500 dark:text-gray-400">
      <p class="text-sm">Enter an amount to see the revenue breakdown</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RevenueSplit } from '~/types/contract'

const props = defineProps<{
  contractId?: string
  channelId?: string
  initialAmount?: number
}>()

const { fetchRevenuePreview, fetchChannelRevenueSplit, getPartyTypeLabel, loading, error } = useContracts()

const grossAmount = ref(props.initialAmount || 1000)
const revenueSplit = ref<RevenueSplit | null>(null)

let debounceTimer: NodeJS.Timeout | null = null

const fetchRevenue = async () => {
  if (grossAmount.value <= 0) {
    revenueSplit.value = null
    return
  }

  try {
    if (props.contractId) {
      revenueSplit.value = await fetchRevenuePreview(props.contractId, grossAmount.value)
    } else if (props.channelId) {
      revenueSplit.value = await fetchChannelRevenueSplit(props.channelId, grossAmount.value)
    }
  } catch (err) {
    // Error is already handled by the composable
    revenueSplit.value = null
  }
}

const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchRevenue, 300)
}

const getPartyColor = (partyType: string): string => {
  const colors: Record<string, string> = {
    'channel': 'bg-blue-500',
    'mcn': 'bg-brand-500',
    'organization': 'bg-green-500',
    'platform': 'bg-orange-500',
  }
  return colors[partyType] || 'bg-gray-500'
}

const getPartyWidth = (party: { share_amount: number }): number => {
  if (!revenueSplit.value || grossAmount.value <= 0) return 0
  return (party.share_amount / grossAmount.value) * 100
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}

const formatActualPercent = (shareAmount: number): string => {
  if (!grossAmount.value || grossAmount.value <= 0) return '0%'
  const percent = (shareAmount / grossAmount.value) * 100
  return `${percent.toFixed(1)}%`
}

// Initial fetch
onMounted(() => {
  if (props.contractId || props.channelId) {
    fetchRevenue()
  }
})

// Watch for prop changes
watch(() => props.contractId, () => {
  if (props.contractId) fetchRevenue()
})

watch(() => props.channelId, () => {
  if (props.channelId) fetchRevenue()
})
</script>
