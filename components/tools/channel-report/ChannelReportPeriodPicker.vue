<template>
  <div class="flex gap-2">
    <select
      :value="month"
      @change="$emit('update:month', Number(($event.target as HTMLSelectElement).value))"
      class="w-1/2 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <option v-for="m in MONTH_OPTIONS" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <select
      :value="year"
      @change="$emit('update:year', Number(($event.target as HTMLSelectElement).value))"
      class="w-1/2 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { MONTH_OPTIONS } from '~/composables/useChannelReport'

defineProps<{
  month: number
  year: number
}>()

defineEmits<{
  'update:month': [value: number]
  'update:year': [value: number]
}>()

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i)
</script>
