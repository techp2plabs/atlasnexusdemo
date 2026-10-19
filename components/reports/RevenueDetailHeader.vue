<template>
  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <img
          v-if="channel?.thumbnail_url"
          :src="channel.thumbnail_url"
          :alt="channel.title"
          class="h-16 w-16 rounded-full object-cover"
        />
        <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <span class="text-xl font-bold text-gray-500 dark:text-gray-400">
            {{ channel?.title?.charAt(0) || '?' }}
          </span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-foreground dark:text-white">
            {{ channel?.title || 'Channel Revenue Detail' }}
          </h1>
          <p v-if="channel?.channel_id" class="text-sm text-gray-500 dark:text-gray-400">
            {{ channel.channel_id }}
          </p>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
        <input
          :value="month"
          @input="$emit('update:month', ($event.target as HTMLInputElement).value)"
          type="month"
          class="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelInfo } from '~/composables/useRevenueDetail'

defineProps<{
  channel: ChannelInfo | null
  month: string
  loading?: boolean
}>()

defineEmits<{
  (e: 'update:month', value: string): void
}>()
</script>
