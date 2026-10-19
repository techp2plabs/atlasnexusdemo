<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Top Keywords</h2>
    <div v-if="items.length" class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <th class="py-2 pr-3">#</th>
            <th class="py-2 pr-3">Keyword</th>
            <th class="py-2">Context</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in sorted" :key="k.rank" class="border-b border-gray-50 dark:border-gray-800/50">
            <td class="py-2 pr-3 text-gray-500 dark:text-gray-400">{{ k.rank }}</td>
            <td class="py-2 pr-3 font-medium text-gray-900 dark:text-white">{{ k.keyword }}</td>
            <td class="py-2 text-gray-600 dark:text-gray-400">{{ k.context }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsTopKeyword } from '~/composables/useCampaignReportInsight'

const props = defineProps<{ items: CommentsTopKeyword[] }>()

const sorted = computed(() => [...props.items].sort((a, b) => a.rank - b.rank))
</script>
