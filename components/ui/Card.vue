<template>
  <NexusCard
    class="nx-shared-card gap-0 py-0 shadow-none"
    :class="[
      'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
      variant === 'metric'
        ? 'nx-metric-card p-5 md:p-6'
        : '',
      className,
    ]"
  >
    <!-- Card Header -->
    <div v-if="title || $slots.header" :class="variant === 'metric' ? '' : 'px-6 py-5'">
      <slot name="header">
        <h3
          v-if="title"
          :class="[
            'font-medium text-gray-800 dark:text-white/90',
            variant === 'metric' ? 'text-lg' : 'text-base',
          ]"
        >
          {{ title }}
        </h3>
        <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ description }}
        </p>
      </slot>
    </div>

    <!-- Card Body -->
    <div
      :class="[
        variant === 'metric' ? '' : 'p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6',
      ]"
    >
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
      <slot name="footer" />
    </div>
  </NexusCard>
</template>

<script setup lang="ts">
import { Card as NexusCard } from '~/components/shadcn/card'
interface Props {
  title?: string
  description?: string
  variant?: 'default' | 'metric'
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  className: '',
})
</script>

