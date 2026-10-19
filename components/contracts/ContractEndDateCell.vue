<template>
  <div class="flex flex-col gap-1">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ endDisplay }}
    </p>
    <span
      v-if="row.is_expiring_soon"
      class="inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
      :aria-label="ariaLabel"
    >
      {{ shortLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Contract } from '~/types/contract'

const props = defineProps<{
  row: Contract
}>()

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const endDisplay = computed(() => {
  if (!props.row.end_date) return 'Open-ended'
  return formatDate(props.row.end_date)
})

const shortLabel = computed(() => {
  const d = props.row.days_until_end
  if (d === 0) return 'Ends today'
  if (d != null && d > 0) return `Expires in ${d}d`
  return 'Expiring soon'
})

const ariaLabel = computed(() => {
  if (!props.row.end_date) return ''
  return `Contract end date ${formatDate(props.row.end_date)}. ${shortLabel.value}.`
})
</script>
