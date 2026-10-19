<template>
  <div class="flex flex-col gap-0.5">
    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ label }}</span>
    <span class="flex items-baseline gap-1.5">
      <span class="text-lg font-semibold text-gray-800 dark:text-white/90">{{ value }}</span>
      <span
        v-if="trend"
        :class="[
          'text-xs font-medium',
          trend.direction === 'up'
            ? 'text-success-600 dark:text-success-500'
            : trend.direction === 'down'
              ? 'text-error-600 dark:text-error-500'
              : 'text-gray-400',
        ]"
      >
        {{ trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '' }} {{ trend.label }}
      </span>
    </span>
    <span v-if="hint" class="text-xs text-gray-400 dark:text-gray-500">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
interface Trend {
  direction: 'up' | 'down' | 'flat'
  label: string
}

interface Props {
  label: string
  value: string | number
  hint?: string
  trend?: Trend
}

defineProps<Props>()
</script>
