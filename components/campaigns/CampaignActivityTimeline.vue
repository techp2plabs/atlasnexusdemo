<template>
  <div class="flex flex-col gap-3">
    <div v-if="loading" class="py-8 text-center text-sm text-gray-400">Loading activity…</div>
    <EmptyState v-else-if="events.length === 0" title="No activity yet" description="Status changes, roster edits, and launches will appear here." />
    <ol v-else class="flex flex-col gap-3">
      <li v-for="e in events" :key="e.id" class="flex gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <div class="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-gray-700 dark:text-gray-200">
            <span class="font-medium">{{ e.event_type }}</span>
            <template v-if="e.from_status && e.to_status"> — {{ e.from_status }} → {{ e.to_status }}</template>
          </p>
          <p v-if="e.meta?.reason" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Reason: {{ e.meta.reason }}</p>
          <p class="mt-0.5 text-xs text-gray-400">{{ formatDate(e.created_at) }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import EmptyState from '~/components/common/EmptyState.vue'
import { useCampaignsApi, type ActivityEventRecord } from '~/composables/youtubeBrandCampaign/useCampaignsApi'

interface Props {
  campaignId: string
}
const props = defineProps<Props>()

const { activity } = useCampaignsApi()
const events = ref<ActivityEventRecord[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    events.value = await activity(props.campaignId)
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(load)
watch(() => props.campaignId, load)

defineExpose({ reload: load })
</script>
