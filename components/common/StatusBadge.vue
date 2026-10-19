<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
      toneClasses,
    ]"
  >
    <span v-if="dot" :class="['h-1.5 w-1.5 rounded-full', dotClasses]" />
    {{ label ?? status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'success' | 'warning' | 'error' | 'brand' | 'blue' | 'orange' | 'gray'

interface Props {
  status: string
  label?: string
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dot: true,
})

/**
 * Status enums per release-plan-20260827-youtube-brand-campaign-02-data-model.md §5
 * (campaigns, campaign_creators, campaign_applications, campaign_videos,
 * eligibility assessments, creator_bank_profiles).
 */
const STATUS_TONE: Record<string, Tone> = {
  // campaigns.status
  draft: 'gray',
  open: 'blue',
  active: 'success',
  paused: 'warning',
  completed: 'brand',
  cancelled: 'error',
  archived: 'gray',
  // campaign_creators.status
  selected: 'blue',
  confirmed: 'brand',
  withdrawn: 'gray',
  removed: 'error',
  // campaign_applications.status
  pending_brand: 'warning',
  approved: 'success',
  rejected: 'error',
  under_analysis: 'blue',
  eligible: 'success',
  needs_review: 'warning',
  not_eligible: 'error',
  // campaign_videos.status / metadata_status
  pending_upload: 'blue',
  pending_verification: 'warning',
  tracked: 'success',
  pending: 'gray',
  resolved: 'success',
  failed: 'error',
  // campaign_code_issuances.status (Phase 1)
  issued: 'brand',
  consumed: 'success',
  revoked: 'gray',
  expired: 'warning',
  // eligibility assessment status/verdict
  processing: 'blue',
  // creator_bank_profiles.safety_level
  safe: 'success',
  review: 'warning',
  unsafe: 'error',
}

const tone = computed<Tone>(() => STATUS_TONE[props.status] ?? 'gray')

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-500',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400',
  blue: 'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-500',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500',
  gray: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400',
}

const DOT_CLASSES: Record<Tone, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  brand: 'bg-brand-500',
  blue: 'bg-blue-light-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-400',
}

const toneClasses = computed(() => TONE_CLASSES[tone.value])
const dotClasses = computed(() => DOT_CLASSES[tone.value])
</script>
