<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">{{ title }}</h3>
    <p v-if="description" class="mb-4 text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
    <slot>
      <p class="rounded-lg border border-dashed border-gray-200 bg-gray-25 px-4 py-6 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-white/[0.02]">
        Wired to mock data as the module is built out — see release-plan-09.
      </p>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>
