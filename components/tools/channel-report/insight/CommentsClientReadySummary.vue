<template>
  <div class="rounded-lg border border-purple-200 bg-purple-50/50 p-6 shadow-sm dark:border-purple-900/40 dark:bg-purple-950/10">
    <div class="mb-2 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Client Ready Summary</h2>
      <button
        type="button"
        @click="copy"
        class="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <p class="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{{ text || 'Not available' }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ text: string }>()

const copied = ref(false)
const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {}
}
</script>
