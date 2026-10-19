<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-25 px-6 py-12 text-center dark:border-gray-800 dark:bg-white/[0.02]">
    <div
      v-if="$slots.icon"
      class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5"
    >
      <slot name="icon" />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ title }}</p>
      <p v-if="description" class="max-w-sm text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
    </div>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  actionLabel?: string
}

defineProps<Props>()
const emit = defineEmits<{ action: [] }>()
</script>
