<template>
  <div class="nx-loading" role="status" aria-live="polite" aria-busy="true">
    <span class="nx-muted">{{ label }}</span>
    <div class="nx-skeleton-grid" aria-hidden="true"><span v-for="n in 4" :key="n" class="nx-skeleton" /></div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Loading overview…' })
</script>
