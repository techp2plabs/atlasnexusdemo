<template>
  <div class="space-y-4">
    <!-- Gross Revenue -->
    <div class="rounded-lg border-2 border-gray-900 bg-gray-100 p-4 dark:border-gray-100 dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-foreground dark:text-white">GROSS REVENUE</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Sum of all report types for this channel</p>
        </div>
        <span class="text-2xl font-bold text-foreground dark:text-white">
          ${{ formatNumber(cascade.gross) }}
        </span>
      </div>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Gross Revenue reflects YouTube-reported earnings. Split percentages and amounts below are
        configured in your organization's contracts — an Atlas business calculation, not data
        provided by YouTube.
      </p>
    </div>

    <!-- Cascade Levels -->
    <div v-for="(level, index) in visibleLevelsWithCalc" :key="level.party" class="relative">
      <!-- Connector -->
      <div class="absolute left-1/2 -top-4 h-4 w-0.5 -translate-x-1/2 bg-gray-300 dark:bg-gray-600" />

      <!-- Level Card -->
      <div
        class="rounded-lg border p-4"
        :class="levelStyles[level.party] || 'border-border bg-white dark:border-gray-700 dark:bg-gray-900'"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-semibold text-foreground dark:text-white">{{ level.label }}</h4>
            <p v-if="level.contract_number" class="text-sm text-gray-500 dark:text-gray-400">
              Contract: {{ level.contract_number }}
            </p>
          </div>
          <div class="text-right">
            <span class="text-2xl font-bold text-foreground dark:text-white">
              ${{ formatNumber(level.amount_usd) }}
            </span>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ level.contractRate.toFixed(0) }}% × ${{ formatNumber(level.inputAmount) }} {{ level.inputLabel }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Remainder -->
    <div v-if="cascade.hidden_remainder" class="relative">
      <div class="absolute left-1/2 -top-4 h-4 w-0.5 -translate-x-1/2 bg-gray-300 dark:bg-gray-600" />

      <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-semibold text-gray-600 dark:text-gray-300">
              {{ cascade.hidden_remainder.label }}
            </h4>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              (Details not visible to your role)
            </p>
          </div>
          <div class="text-right">
            <span class="text-2xl font-bold text-gray-600 dark:text-gray-300">
              ${{ formatNumber(cascade.hidden_remainder.amount_usd) }}
            </span>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              {{ Number(cascade.hidden_remainder.share_pct).toFixed(2) }}% of gross
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Verification -->
    <div class="mt-6 rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold text-gray-700 dark:text-gray-300">Total Distributed</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Sum of all shares (should equal gross)
          </p>
        </div>
        <div class="text-right">
          <span class="text-xl font-bold" :class="totalMatches ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            ${{ formatNumber(totalDistributed) }}
          </span>
          <p class="text-sm" :class="totalMatches ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ totalMatches ? '✓ Matches gross' : '✗ Does not match gross' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SplitCascade, SplitLevel } from '~/composables/useRevenueDetail'

interface LevelWithCalc extends SplitLevel {
  contractRate: number
  inputAmount: number
  inputLabel: string
}

const props = defineProps<{
  cascade: SplitCascade
}>()

const formatNumber = (value: number | string) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

const visibleLevelsWithCalc = computed((): LevelWithCalc[] => {
  const gross = Number(props.cascade.gross) || 0
  const levels = props.cascade.levels.filter((level) => level.visible)

  const result: LevelWithCalc[] = []
  let remaining = gross

  for (const level of levels) {
    const amount = Number(level.amount_usd) || 0
    const inputAmount = remaining
    const contractRate = inputAmount > 0 ? (amount / inputAmount) * 100 : 0

    let inputLabel = ''
    if (level.party === 'channel') {
      inputLabel = '(gross)'
    } else if (level.party === 'mcn') {
      inputLabel = '(MCN share)'
    } else if (level.party === 'organization') {
      inputLabel = '(Org share)'
    } else if (level.party === 'platform') {
      inputLabel = '(remaining)'
    }

    result.push({
      ...level,
      contractRate,
      inputAmount,
      inputLabel,
    })

    remaining -= amount
  }

  return result
})

const totalDistributed = computed(() => {
  let total = 0
  for (const level of props.cascade.levels) {
    total += Number(level.amount_usd) || 0
  }
  if (props.cascade.hidden_remainder) {
    total += Number(props.cascade.hidden_remainder.amount_usd) || 0
  }
  return total
})

const totalMatches = computed(() => {
  const gross = Number(props.cascade.gross) || 0
  const diff = Math.abs(totalDistributed.value - gross)
  return diff < 0.01
})

const levelStyles: Record<string, string> = {
  channel: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
  mcn: 'border-border bg-accent dark:border-brand-800 dark:bg-brand-900/20',
  organization: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
  platform: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20',
}
</script>
