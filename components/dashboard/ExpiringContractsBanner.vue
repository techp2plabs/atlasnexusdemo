<template>
  <div class="nx-attention" role="status">
    <div><strong>{{ total }} {{ total === 1 ? 'contract needs' : 'contracts need' }} your attention</strong><p>Expiring within 60 days. {{ subtitle }}</p></div>
    <div class="nx-button-group"><NuxtLink :to="contractsLink" class="nx-button">Review contracts</NuxtLink><button type="button" class="nx-button nx-button-quiet" @click="$emit('dismiss')">Dismiss</button></div>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    total: number
    /** Extra sentence after the expiring line (e.g. platform-wide hint for admins). */
    subtitle?: string
    contractsLink?: string
  }>(),
  {
    subtitle: 'Review them to renew or replace before they lapse.',
    contractsLink: '/app/contracts?expiring_soon=true',
  },
)

defineEmits<{
  dismiss: []
}>()
</script>
