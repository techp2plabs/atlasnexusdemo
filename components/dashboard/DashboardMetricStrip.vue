<template>
  <div class="nx-metrics" :aria-label="label">
    <component :is="metric.to ? NuxtLink : 'div'" v-for="metric in metrics" :key="metric.label"
      :to="metric.to" class="nx-metric" :class="{ 'nx-metric-link': metric.to }">
      <span class="nx-metric-label"><span class="nx-metric-icon"><component :is="metricIcons[metric.label] || BarChart3" :size="17" aria-hidden="true" /></span>{{ metric.label }}<ArrowUpRight v-if="metric.to" :size="14" aria-hidden="true" /></span>
      <strong class="nx-metric-value" :title="String(metric.value ?? 'Unavailable')">{{ metric.value == null ? '—' : typeof metric.value === 'number' ? metric.value.toLocaleString('en-US') : metric.value }}</strong>
      <span v-if="metric.hint" class="nx-metric-hint" :class="{ 'nx-warning-text': metric.warning }">{{ metric.hint }}</span>
    </component>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpRight, Building2, Network, Video, Users, BarChart3 } from 'lucide-vue-next'
import { NuxtLink } from '#components'
const metricIcons: Record<string, any> = { Organizations: Building2, 'Partner networks': Network, Channels: Video, Users }

defineProps<{
  label?: string
  metrics: { label: string; value: number | string | null | undefined; hint?: string; to?: string; warning?: boolean }[]
}>()
</script>
