<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="stepTitle"
    size="3xl"
  >
    <div class="mt-4">
      <!-- Step 1: Initial / Error -->
      <div v-if="step === 'initial' || (step === 'error' && !fetchResult)">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          This will fetch all channels associated with the Content Owner ID <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">{{ contentOwnerId }}</code>.
          After fetching, click the "Mapping" button to assign channels to MCN Partners. It may take a few moments depending on the number of channels.
        </p>
        
        <div class="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h4 class="text-sm font-medium text-blue-800 dark:text-blue-300">Before you continue:</h4>
          <ul class="mt-2 list-disc pl-5 text-sm text-blue-700 dark:text-blue-400">
            <li>Ensure the Content Owner ID is correct.</li>
            <li>
              Your YouTube CMS admin must grant Atlas access: the reporting service account for your environment
              must appear as a user on this Content Owner (see error message below if a fetch fails).
            </li>
            <li>This only reads channel metadata from YouTube; nothing is mapped until you use Mapping.</li>
            <li>After a successful fetch, use the "Mapping" button to assign channels to MCN Partners.</li>
          </ul>
        </div>

        <div v-if="error" class="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Could not load channels from YouTube</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-400">{{ error }}</div>
              <p
                v-if="errorHint"
                class="mt-3 border-t border-red-200 pt-3 text-sm text-red-700 dark:border-red-800 dark:text-red-300"
              >
                {{ errorHint }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Fetching -->
      <div v-else-if="step === 'fetching'" class="flex flex-col items-center justify-center py-12">
        <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
        <p class="text-lg font-medium text-foreground dark:text-white">Connecting to YouTube...</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Fetching managed channels...</p>
      </div>

      <!-- Step 3: Preview -->
      <div v-else-if="step === 'preview' && fetchResult">
        <div class="mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Found <span class="font-bold text-foreground dark:text-white">{{ fetchResult.total_count }}</span> channels.
            Review the channels below before syncing to the database.
          </p>
        </div>

        <div class="max-h-60 overflow-x-auto overflow-y-auto rounded-lg border border-border dark:border-gray-800">
          <table class="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-800">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" class="w-[65%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Channel</th>
                <th scope="col" class="w-[17.5%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subscribers</th>
                <th scope="col" class="w-[17.5%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Views</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              <tr v-for="channel in fetchResult.channels" :key="channel.channel_id">
                <td class="min-w-0 px-6 py-4 align-top">
                  <div class="flex min-w-0 items-start gap-3">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img
                        v-if="channel.thumbnail_url"
                        :src="channel.thumbnail_url"
                        class="h-10 w-10 rounded-full"
                        alt=""
                      />
                      <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <YoutubeIcon variant="black" class="h-6 w-6" />
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium text-foreground dark:text-white">{{ channel.title }}</div>
                      <div class="break-all text-xs text-gray-500 dark:text-gray-400">{{ channel.channel_id }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ formatNumber(channel.subscriber_count) }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ formatNumber(channel.view_count) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="error" class="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Step 4: Saving -->
      <div v-else-if="step === 'saving'" class="flex flex-col items-center justify-center py-12">
        <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
        <p class="text-lg font-medium text-foreground dark:text-white">Syncing channels...</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Saving to database and assigning creators...</p>
      </div>

      <!-- Step 5: Success -->
      <div v-else-if="step === 'success' && syncResult" class="py-4 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-foreground dark:text-white">Sync Complete!</h3>
        <div class="mt-4 grid grid-cols-3 gap-4 text-center">
          <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p class="text-xs text-gray-500 dark:text-gray-400">Total Processed</p>
            <p class="text-xl font-bold text-foreground dark:text-white">{{ syncResult.total_processed }}</p>
          </div>
          <div class="rounded-lg bg-green-50 p-3 dark:bg-green-900/10">
            <p class="text-xs text-green-600 dark:text-green-400">Added</p>
            <p class="text-xl font-bold text-green-600 dark:text-green-400">{{ syncResult.added }}</p>
          </div>
          <div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
            <p class="text-xs text-blue-600 dark:text-blue-400">Updated</p>
            <p class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ syncResult.updated }}</p>
          </div>
        </div>
        <div v-if="syncResult.skipped > 0 || syncResult.errors.length > 0" class="mt-4 rounded-lg bg-yellow-50 p-3 text-left text-sm dark:bg-yellow-900/10">
          <p class="font-medium text-yellow-800 dark:text-yellow-300">Notes:</p>
          <ul class="list-disc pl-5 text-yellow-700 dark:text-yellow-400">
            <li v-if="syncResult.skipped > 0">{{ syncResult.skipped }} channels skipped/failed.</li>
            <li v-for="(err, idx) in syncResult.errors.slice(0, 3)" :key="idx">{{ err }}</li>
            <li v-if="syncResult.errors.length > 3">And {{ syncResult.errors.length - 3 }} more errors...</li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          v-if="step !== 'success' && step !== 'saving' && step !== 'fetching'"
          @click="handleClose"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        
        <button
          v-if="step === 'initial' || (step === 'error' && !fetchResult)"
          @click="handleFetch"
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Start Fetching
        </button>

        <button
          v-if="step === 'preview'"
          @click="handleSync"
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Done
        </button>

        <button
          v-if="step === 'success'"
          @click="handleSuccessClose"
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { useFetchChannels } from '~/composables/useFetchChannels'
import type { ChannelFetchResponse, ChannelSyncResponse } from '~/types/channel'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'

const props = defineProps<{
  isOpen: boolean
  contentOwnerId: string
  organizationId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
  (e: 'map-channels', data: { contentOwnerId: string, organizationId: string | undefined, channels: ChannelFetchResponse[] }): void
}>()

const {
  fetching,
  saving,
  error,
  errorHint,
  fetchResult,
  fetchChannelsFromYouTube,
  saveFetchedChannels,
  resetState
} = useFetchChannels()

const syncResult = ref<ChannelSyncResponse | null>(null)
const step = ref<'initial' | 'fetching' | 'preview' | 'saving' | 'success' | 'error'>('initial')

const stepTitle = computed(() => {
  switch (step.value) {
    case 'initial':
      return 'Fetch Channels from YouTube'
    case 'fetching':
      return 'Fetching Channels...'
    case 'preview':
      return 'Review Found Channels'
    case 'saving':
      return 'Syncing Channels...'
    case 'success':
      return 'Sync Complete'
    case 'error':
      return 'Fetch blocked or failed'
    default:
      return 'Fetch Channels'
  }
})

// Watch for modal open to reset state
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetState()
    syncResult.value = null
    step.value = 'initial'
  }
})

// Watch errors
watch(error, (newVal) => {
  if (newVal && (step.value === 'fetching' || step.value === 'saving')) {
    if (step.value === 'fetching') {
      step.value = 'error'
    } 
    if (step.value === 'saving') {
      step.value = 'preview'
    }
  }
})

const handleFetch = async () => {
  if (!props.contentOwnerId || !props.organizationId) return
  
  step.value = 'fetching'
  try {
    // Use the first MCN Owner as a temporary MCN ID for fetching (API requirement)
    // The actual assignment will happen in the mapping view
    await fetchChannelsFromYouTube(props.organizationId, props.contentOwnerId)
    step.value = 'preview'
  } catch (e) {
    step.value = 'error'
  }
}

const handleSync = async () => {
  if (!fetchResult.value || !props.contentOwnerId) return
  
  // Just emit the channels data - sync happens in parent
  emit('map-channels', {
    contentOwnerId: props.contentOwnerId,
    organizationId: props.organizationId,
    channels: fetchResult.value.channels
  })
  emit('close')
}

const handleClose = () => {
  if (saving.value || fetching.value) return // Prevent closing while processing
  emit('close')
}

const handleSuccessClose = () => {
  emit('success')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}
</script>

