<template>
  <div class="space-y-6">
    <!-- Estimated Monthly Revenue Card -->
    <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Estimated Monthly Revenue (Projected)</p>
          <p class="mt-2 text-3xl font-bold text-foreground">
            {{ formatCurrency(stats?.estimated_revenue || 0) }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Based on current view counts (CPM $2.50)
          </p>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
          <svg
            class="h-6 w-6 text-success-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Top 5 Channels by Subscribers -->
    <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-foreground">Top Channels by Subscribers</h3>
        <NuxtLink
          to="/app/channels"
          class="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          View All →
        </NuxtLink>
      </div>
      <div v-if="!stats?.top_channels || stats.top_channels.length === 0" class="py-8 text-center">
        <p class="text-sm text-gray-500">
          No channel data available. Sync channels to see top performers.
        </p>
      </div>
      <div v-else class="space-y-3">
        <button
          v-for="(channel, index) in stats.top_channels"
          :key="channel.id"
          @click="handleChannelClick(channel.id)"
          class="w-full rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-brand-200 hover:bg-brand-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600"
              >
                {{ index + 1 }}
              </span>
              <img
                v-if="channel.thumbnail_url"
                :src="channel.thumbnail_url"
                :alt="channel.title"
                class="ml-4 h-10 w-10 rounded-full object-cover"
              />
              <div class="ml-4">
                <p class="text-sm font-medium text-foreground">{{ channel.title }}</p>
                <p class="mt-1 text-xs text-gray-500 font-mono">{{ formatNumber(channel.subscriber_count) }} subscribers</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-foreground">
                {{ formatNumber(channel.view_count) }}
              </p>
              <p class="text-xs text-gray-500">Views</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats } from '~/types/dashboard'

interface Props {
  stats: DashboardStats | null
  loading?: boolean
}

defineProps<Props>()

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num)
}

const handleChannelClick = (channelId: string) => {
  navigateTo(`/app/channels/${channelId}`)
}
</script>
