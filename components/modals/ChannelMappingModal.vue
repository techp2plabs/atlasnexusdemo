<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Map Channels to MCN Partners"
    size="xl"
  >
    <div class="mt-4">
      <div v-if="unmappedChannels.length === 0 && mappedChannels.length === 0" class="py-8 text-center">
        <p class="text-gray-500 dark:text-gray-400">No channels to map.</p>
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            Content Owner ID: <code class="rounded bg-blue-100 px-1.5 py-0.5 text-xs dark:bg-blue-800">{{ contentOwnerId }}</code>
          </p>
          <p class="mt-1 text-sm text-blue-700 dark:text-blue-400">
            {{ unmappedChannels.length }} unmapped • {{ mappedChannels.length }} mapped
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-2 border-b border-border dark:border-gray-700">
          <button
            type="button"
            @click="activeTab = 'unmapped'"
            :class="[
              'px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'unmapped'
                ? 'border-b-2 border-brand-600 text-accent-foreground dark:text-brand-300'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
            ]"
          >
            Unmapped ({{ unmappedChannels.length }})
          </button>
          <button
            type="button"
            @click="activeTab = 'mapped'"
            :class="[
              'px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'mapped'
                ? 'border-b-2 border-brand-600 text-accent-foreground dark:text-brand-300'
                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
            ]"
          >
            Mapped ({{ mappedChannels.length }})
          </button>
        </div>

        <!-- Loading MCNs indicator -->
        <div v-if="mcnsLoading" class="rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-brand-600 border-r-transparent"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Loading MCN Partners...</p>
          </div>
        </div>

        <!-- No MCNs warning -->
        <div v-else-if="!mcnsLoading && availableMcns.length === 0" class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div class="flex items-start gap-2">
            <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">No MCN Partners Found</p>
              <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                No MCN Partners are available for this organization. Please create an MCN Partner first before mapping channels.
              </p>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="h-4 w-4 rounded border-gray-300 text-accent-foreground focus:ring-ring dark:border-gray-700"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({{ selectedChannels.length }} selected)
                </span>
              </label>
              <div v-if="selectedChannels.length > 0" class="flex items-center gap-2">
                <label class="text-sm text-gray-600 dark:text-gray-400">Assign to:</label>
                <select
                  v-model="bulkMcnId"
                  class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  :disabled="assigning"
                >
                  <option value="">-- Select MCN Partner --</option>
                  <option v-for="mcn in availableMcns" :key="mcn.id" :value="mcn.id">
                    {{ mcn.name }} {{ mcn.alias ? `(${mcn.alias})` : '' }}
                  </option>
                </select>
                <button
                  @click="activeTab === 'unmapped' ? handleBulkMap() : handleBulkAssignMapped()"
                  :disabled="!bulkMcnId || assigning"
                  class="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ assigning ? 'Assigning...' : 'Assign Selected' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Unmapped Channels List (staged) -->
        <div v-if="activeTab === 'unmapped'" class="max-h-96 overflow-y-auto space-y-2">
          <div
            v-for="channel in unmappedChannels"
            :key="channel.channel_id"
            class="flex items-center gap-4 rounded-lg border border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            :class="{ 'bg-accent dark:bg-brand-900/10': selectedChannels.includes(channel.channel_id) }"
          >
            <input
              type="checkbox"
              :checked="selectedChannels.includes(channel.channel_id)"
              @change="toggleChannel(channel.channel_id)"
              class="h-4 w-4 rounded border-gray-300 text-accent-foreground focus:ring-ring dark:border-gray-700"
            />
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center">
              <img
                v-if="channel.thumbnail_url"
                :src="channel.thumbnail_url"
                :alt="channel.title || channel.channel_id"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <YoutubeIcon variant="black" class="h-5 w-5" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-foreground dark:text-white">{{ channel.title || '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ channel.channel_id }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ formatNumber(channel.subscriber_count) }} subscribers • {{ formatNumber(channel.view_count) }} views
              </p>
            </div>
            <div class="w-64">
              <select
                :value="channelMappings[channel.channel_id] || ''"
                @change="handleUnmappedSelect(channel.channel_id, ($event.target as HTMLSelectElement).value)"
                :disabled="assigningChannels[channel.channel_id] || assigning"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
              >
                <option value="">-- Select MCN Partner --</option>
                <option v-for="mcn in availableMcns" :key="mcn.id" :value="mcn.id">
                  {{ mcn.name }} {{ mcn.alias ? `(${mcn.alias})` : '' }}
                </option>
              </select>
              <p v-if="assigningChannels[channel.channel_id]" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mapping...
              </p>
            </div>
          </div>
        </div>

        <!-- Mapped Channels List (in DB) -->
        <div v-if="activeTab === 'mapped'" class="max-h-96 overflow-y-auto space-y-2">
          <div
            v-for="channel in mappedChannels"
            :key="channel.channel_id"
            class="flex items-center gap-4 rounded-lg border border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            :class="{ 'bg-accent dark:bg-brand-900/10': selectedChannels.includes(channel.channel_id) }"
          >
            <input
              type="checkbox"
              :checked="selectedChannels.includes(channel.channel_id)"
              @change="toggleChannel(channel.channel_id)"
              class="h-4 w-4 rounded border-gray-300 text-accent-foreground focus:ring-ring dark:border-gray-700"
            />
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center">
              <img
                v-if="channel.thumbnail_url"
                :src="channel.thumbnail_url"
                :alt="channel.title"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <YoutubeIcon variant="black" class="h-5 w-5" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-foreground dark:text-white">{{ channel.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ channel.channel_id }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ formatNumber(channel.subscriber_count) }} subscribers • {{ formatNumber(channel.view_count) }} views
              </p>
            </div>
            <div class="w-64">
              <select
                :value="channelMappings[channel.channel_id] || channel.mcn_id || ''"
                @change="handleChannelAssign(channel, ($event.target as HTMLSelectElement).value)"
                :disabled="assigningChannels[channel.channel_id] || assigning"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
              >
                <option value="">-- Select MCN Partner --</option>
                <option v-for="mcn in availableMcns" :key="mcn.id" :value="mcn.id">
                  {{ mcn.name }} {{ mcn.alias ? `(${mcn.alias})` : '' }}
                </option>
              </select>
              <p v-if="assigningChannels[channel.channel_id]" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Assigning...
              </p>
              <p v-else-if="channel.mcn_name" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Currently: {{ channel.mcn_name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="handleClose"
          :disabled="assigning"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'
import { useChannels } from '~/composables/useChannels'
import { useMcns } from '~/composables/useMcns'
import { useToast } from '~/composables/useToast'
import { useApi } from '~/composables/useApi'
import type { YouTubeChannel, FetchedYouTubeChannel } from '~/types/channel'
import type { MCN } from '~/types/mcn'

const props = defineProps<{
  isOpen: boolean
  contentOwnerId: string
  organizationId?: string
  unmappedChannels: FetchedYouTubeChannel[]
  mappedChannels: YouTubeChannel[]
  mcns?: MCN[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { updateChannel } = useChannels()
const { post } = useApi()
const mcnComposable = useMcns()
const localMcns = ref<MCN[]>([])
const mcnsLoading = ref(false)
const { success: showSuccessToast, error: showErrorToast } = useToast()

const selectedChannels = ref<string[]>([])
const channelMappings = ref<Record<string, string>>({})
const assigningChannels = ref<Record<string, boolean>>({})
const bulkMcnId = ref<string>('')
const assigning = ref(false)
const activeTab = ref<'unmapped' | 'mapped'>('unmapped')

// Initialize channel mappings from existing channels
watch(
  () => [props.unmappedChannels, props.mappedChannels],
  () => {
    // Reset mappings; mapped channels take their existing MCN as default
    const next: Record<string, string> = {}
    for (const ch of props.mappedChannels || []) {
      if (ch.mcn_id) next[ch.channel_id] = ch.mcn_id
    }
    channelMappings.value = next
  },
  { immediate: true }
)

// Use MCNs from prop if provided, otherwise use locally fetched MCNs
const allMcns = computed(() => {
  if (props.mcns && props.mcns.length > 0) {
    return props.mcns
  }
  return localMcns.value
})

const availableMcns = computed(() => {
  if (!props.organizationId) {
    return []
  }
  const orgId = String(props.organizationId).trim()
  const mcnsArray = allMcns.value
  
  if (!Array.isArray(mcnsArray) || mcnsArray.length === 0) {
    return []
  }
  
  return mcnsArray.filter((mcn: MCN) => {
    const mcnOrgId = String(mcn.organization_id || '').trim()
    return mcnOrgId === orgId
  })
})

const allSelected = computed(() => {
  const list = activeTab.value === 'unmapped' ? props.unmappedChannels : props.mappedChannels
  return list.length > 0 && selectedChannels.value.length === list.length
})

watch(
  () => activeTab.value,
  () => {
    selectedChannels.value = []
    bulkMcnId.value = ''
  }
)

// Watch for modal open to fetch MCNs if not provided via prop
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.organizationId) {
    // Only fetch if MCNs were not passed as a prop
    if (!props.mcns || props.mcns.length === 0) {
      mcnsLoading.value = true
      try {
        await mcnComposable.fetchMcns({ 
          organization_id: String(props.organizationId).trim(),
          page: 1,
          page_size: 100
        })
        await nextTick()
        // Copy fetched MCNs to local ref
        localMcns.value = [...mcnComposable.mcns.value]
      } catch (error) {
        console.error('ChannelMappingModal: Failed to fetch MCNs', error)
        showErrorToast('Failed to load MCN Partners. Please try again.')
      } finally {
        mcnsLoading.value = false
      }
    }
    // Reset selections
    selectedChannels.value = []
    bulkMcnId.value = ''
  }
})

// Also watch organizationId prop in case it changes
watch(() => props.organizationId, async (newOrgId) => {
  if (props.isOpen && newOrgId && (!props.mcns || props.mcns.length === 0)) {
    mcnsLoading.value = true
    try {
      await mcnComposable.fetchMcns({ 
        organization_id: String(newOrgId).trim(),
        page: 1,
        page_size: 100
      })
      await nextTick()
      localMcns.value = [...mcnComposable.mcns.value]
    } catch (error) {
      console.error('ChannelMappingModal: Failed to fetch MCNs', error)
      showErrorToast('Failed to load MCN Partners. Please try again.')
    } finally {
      mcnsLoading.value = false
    }
  }
})

const toggleChannel = (channelId: string) => {
  const index = selectedChannels.value.indexOf(channelId)
  if (index > -1) {
    selectedChannels.value.splice(index, 1)
  } else {
    selectedChannels.value.push(channelId)
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedChannels.value = []
  } else {
    const list = activeTab.value === 'unmapped' ? props.unmappedChannels : props.mappedChannels
    selectedChannels.value = list.map((c: any) => c.channel_id)
  }
}

const handleUnmappedSelect = async (channelId: string, mcnId: string) => {
  if (!mcnId) {
    delete channelMappings.value[channelId]
    return
  }
  channelMappings.value[channelId] = mcnId

  if (!props.organizationId) {
    showErrorToast('Organization not provided. Please refresh and try again.')
    return
  }

  assigningChannels.value[channelId] = true
  try {
    await post(`/api/v1/organizations/${props.organizationId}/map-fetched-channels`, {
      content_owner_id: props.contentOwnerId,
      mcn_id: mcnId,
      channel_ids: [channelId],
    })
    showSuccessToast('Channel mapped successfully')
    // Clear selection for this row if selected
    const idx = selectedChannels.value.indexOf(channelId)
    if (idx > -1) selectedChannels.value.splice(idx, 1)
    emit('success')
  } catch (err: any) {
    console.error('Failed to map fetched channel:', err)
    showErrorToast(err.response?.data?.detail || 'Failed to map channel')
  } finally {
    assigningChannels.value[channelId] = false
  }
}

const handleChannelAssign = async (channel: YouTubeChannel, mcnId: string) => {
  if (!mcnId) {
    // If mcnId is empty, don't do anything (user cleared selection)
    return
  }
  
  const wasAlreadyMapped = !!channel.mcn_id
  assigningChannels.value[channel.channel_id] = true
  try {
    // Update channel's MCN assignment
    await updateChannel(channel.id, { mcn_id: mcnId })
    channelMappings.value[channel.channel_id] = mcnId
    // Update the channel object locally for immediate UI update
    channel.mcn_id = mcnId
    
    showSuccessToast(`Channel "${channel.title}" ${wasAlreadyMapped ? 'reassigned' : 'assigned'} successfully`)
    
    // Remove from selected if it was selected
    const index = selectedChannels.value.indexOf(channel.channel_id)
    if (index > -1) {
      selectedChannels.value.splice(index, 1)
    }
    
    emit('success')
  } catch (err: any) {
    console.error('Failed to assign channel:', err)
    showErrorToast(`Failed to assign channel: ${err.message || 'Unknown error'}`)
  } finally {
    assigningChannels.value[channel.channel_id] = false
  }
}

const handleBulkMap = async () => {
  if (!props.organizationId) {
    showErrorToast('Organization not provided. Please refresh and try again.')
    return
  }
  if (!bulkMcnId.value || selectedChannels.value.length === 0) return

  assigning.value = true
  try {
    await post(`/api/v1/organizations/${props.organizationId}/map-fetched-channels`, {
      content_owner_id: props.contentOwnerId,
      mcn_id: bulkMcnId.value,
      channel_ids: selectedChannels.value,
    })
    showSuccessToast(`Mapped ${selectedChannels.value.length} channel(s)`)
    selectedChannels.value = []
    bulkMcnId.value = ''
    emit('success')
  } catch (err: any) {
    console.error('Failed to bulk map channels:', err)
    showErrorToast(err.response?.data?.detail || 'Failed to map channels')
  } finally {
    assigning.value = false
  }
}

const handleBulkAssignMapped = async () => {
  if (!bulkMcnId.value || selectedChannels.value.length === 0) return

  assigning.value = true
  try {
    const channelsToAssign = props.mappedChannels.filter(c => selectedChannels.value.includes(c.channel_id))
    await Promise.all(channelsToAssign.map(channel => updateChannel(channel.id, { mcn_id: bulkMcnId.value })))
    showSuccessToast(`Successfully assigned ${channelsToAssign.length} channel(s)`)
    selectedChannels.value = []
    bulkMcnId.value = ''
    emit('success')
  } catch (err: any) {
    console.error('Failed to bulk assign mapped channels:', err)
    showErrorToast(err.response?.data?.detail || 'Failed to assign channels')
  } finally {
    assigning.value = false
  }
}

const handleClose = () => {
  if (assigning.value) return
  emit('close')
}

const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}
</script>

