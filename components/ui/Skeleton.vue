<template>
  <NexusSkeleton
    :class="[
      'animate-pulse rounded bg-gray-200 dark:bg-gray-700',
      className
    ]"
    :style="{
      width: width,
      height: height
    }"
  />
</template>

<script setup lang="ts">
import { Skeleton as NexusSkeleton } from '~/components/shadcn/skeleton'
interface Props {
  width?: string
  height?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  className: '',
})
</script>
