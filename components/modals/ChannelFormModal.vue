<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="isEdit ? 'Edit Channel' : 'Add Channel'"
    size="lg"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- API Error Message -->
      <div
        v-if="apiError"
        class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
      >
        <p class="text-sm text-red-800 dark:text-red-300">{{ apiError }}</p>
      </div>

      <!-- MCN Partner Assignment (First Row) -->
      <div>
        <div class="mb-1.5 flex items-center gap-2">
          <label
            :for="mcnSelectId"
            class="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            MCN Partner Assignment
            <span class="text-error-500">*</span>
          </label>
        </div>
        <Select
          :id="mcnSelectId"
          v-model="form.mcn_id"
          :options="mcnOptions"
          placeholder="Select an MCN Partner"
          :required="true"
          :error="!!errors.mcn_id"
          :errorMessage="errors.mcn_id"
          :disabled="isSubmitting || isMcnDisabled"
          @update:modelValue="handleMcnChange"
          @blur="validateField('mcn_id')"
        />
      </div>

      <!-- YouTube Channel ID -->
      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label
            for="channel-id-input"
            class="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            YouTube Channel
            <span class="text-error-500">*</span>
          </label>
          <button
            type="button"
            @click="handleTestConnection"
            :disabled="!form.channel_id?.trim() || isSubmitting || isValidatingChannel || isEdit"
            class="text-xs font-medium text-accent-foreground hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <span v-if="isValidatingChannel" class="flex items-center gap-1">
              <svg class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verification...
            </span>
            <span v-else>Verify</span>
          </button>
        </div>
        <Input
          id="channel-id-input"
          v-model="form.channel_id"
          placeholder="Enter YouTube Channel ID, URL, or @username (e.g., @DedenSembada)"
          required
          :error="!!errors.channel_id"
          :errorMessage="errors.channel_id"
          :disabled="isSubmitting || isEdit || !!channelTestResult?.isValid"
          @blur="validateField('channel_id')"
        />
        <!-- Channel Test Result -->
        <div v-if="channelTestResult" class="mt-2">
          <div
            v-if="channelTestResult.isValid"
            class="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
          >
            <div class="flex items-start gap-2">
              <svg class="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium text-green-800 dark:text-green-300">
                  {{ channelTestResult.message || 'Channel is valid and accessible' }}
                </p>
                <div v-if="channelTestResult.title" class="mt-2 space-y-1 text-xs text-green-700 dark:text-green-400">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">Title:</span>
                    <span>{{ channelTestResult.title }}</span>
                  </div>
                  <div v-if="channelTestResult.subscriberCount !== undefined" class="flex items-center gap-2">
                    <span class="font-medium">Subscribers:</span>
                    <span>{{ channelTestResult.subscriberCount.toLocaleString() }}</span>
                  </div>
                  <div v-if="channelTestResult.videoCount !== undefined" class="flex items-center gap-2">
                    <span class="font-medium">Videos:</span>
                    <span>{{ channelTestResult.videoCount.toLocaleString() }}</span>
                  </div>
                  <div v-if="channelTestResult.viewCount !== undefined" class="flex items-center gap-2">
                    <span class="font-medium">Total Views:</span>
                    <span>{{ channelTestResult.viewCount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else-if="channelTestResult.error"
            class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
          >
            <div class="flex items-start gap-2">
              <svg class="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-800 dark:text-red-300">{{ channelTestResult.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Auto-filled Fields (shown after verification) -->
      <div v-if="channelTestResult?.isValid || isEdit" class="space-y-4 border-t border-border pt-4 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-foreground dark:text-white">Channel Information</h3>
        
        <!-- Channel ID (Read-only) -->
        <Input
          v-model="form.channel_id"
          label="Channel ID"
          placeholder="Channel ID"
          :error="!!errors.channel_id"
          :errorMessage="errors.channel_id"
          :disabled="true"
          readonly
        />

        <!-- Channel Name -->
        <Input
          v-model="form.title"
          label="Channel Name"
          placeholder="Channel name"
          :error="!!errors.title"
          :errorMessage="errors.title"
          :disabled="isSubmitting"
          @blur="validateField('title')"
        />

        <!-- Channel Type (optional) -->
        <Select
          v-model="form.channel_type"
          label="Channel Type (optional)"
          :options="[
            { value: 'music_recording', label: 'Music Recording' },
            { value: 'publishing', label: 'Publishing' },
            { value: 'owned_operated', label: 'Owned & Operated' },
            { value: 'affiliate', label: 'Affiliate' },
          ]"
          placeholder="Select channel type (optional)"
          :disabled="isSubmitting"
        />
        
        <!-- Subscriber Count -->
        <Input
          :modelValue="form.subscriber_count?.toString() || '0'"
          @update:modelValue="form.subscriber_count = parseInt(String($event)) || 0"
          label="Subscriber Count"
          type="number"
          placeholder="0"
          :error="!!errors.subscriber_count"
          :errorMessage="errors.subscriber_count"
          :disabled="isSubmitting"
        />

        <!-- Video Count -->
        <Input
          :modelValue="form.video_count?.toString() || '0'"
          @update:modelValue="form.video_count = parseInt(String($event)) || 0"
          label="Video Count"
          type="number"
          placeholder="0"
          :error="!!errors.video_count"
          :errorMessage="errors.video_count"
          :disabled="isSubmitting"
        />

        <!-- View Count -->
        <Input
          :modelValue="form.view_count?.toString() || '0'"
          @update:modelValue="form.view_count = parseInt(String($event)) || 0"
          label="View Count"
          type="number"
          placeholder="0"
          :error="!!errors.view_count"
          :errorMessage="errors.view_count"
          :disabled="isSubmitting"
        />

        <!-- Thumbnail URL -->
        <Input
          :modelValue="form.thumbnail_url || ''"
          @update:modelValue="form.thumbnail_url = String($event) || null"
          label="Thumbnail URL"
          placeholder="https://..."
          :error="!!errors.thumbnail_url"
          :errorMessage="errors.thumbnail_url"
          :disabled="isSubmitting"
        />

        <!-- Custom URL -->
        <Input
          :modelValue="form.custom_url || ''"
          @update:modelValue="form.custom_url = String($event) || null"
          label="Custom URL (@username)"
          placeholder="@username"
          :error="!!errors.custom_url"
          :errorMessage="errors.custom_url"
          :disabled="isSubmitting"
        />

        <!-- Description -->
        <Textarea
          :modelValue="form.description || ''"
          @update:modelValue="form.description = String($event) || null"
          label="Description"
          placeholder="Channel description"
          :error="!!errors.description"
          :errorMessage="errors.description"
          :disabled="isSubmitting"
          :rows="4"
        />

        <!-- Published Date -->
        <Input
          :modelValue="(form.published_at as string) || ''"
          @update:modelValue="form.published_at = String($event) || ''"
          label="Published Date"
          type="datetime-local"
          placeholder="Published date"
          :error="!!errors.published_at"
          :errorMessage="errors.published_at"
          :disabled="isSubmitting"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="handleClose"
          :disabled="isSubmitting"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          @click="handleSubmit"
          :disabled="isSubmitting || !isFormValid"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>{{ isEdit ? 'Update' : 'Create' }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import Input from '~/components/forms/Input.vue'
import Select from '~/components/forms/Select.vue'
import Textarea from '~/components/forms/Textarea.vue'
import type { YouTubeChannel, ChannelCreate, ChannelUpdate } from '~/types/channel'
import type { SelectOption } from '~/components/forms/Select.vue'
import { useChannelTest, type ChannelTestResult } from '~/composables/useChannelTest'

interface Props {
  isOpen: boolean
  channel?: YouTubeChannel | null
  /** When opening from MCN detail, pass so the dropdown includes the current MCN and it can be auto-selected */
  prefillMcnId?: string | null
  prefillOrganizationId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [channel: YouTubeChannel]
}>()

const authStore = useAuthStore()
const { createChannel, updateChannel } = useChannels()
const { mcns, fetchMcns, loading: mcnsLoading } = useMcns()
const { organizations, fetchOrganizations } = useOrganizations()
const { testChannelConnection, isValidating: isValidatingChannel, extractChannelId } = useChannelTest()

const isEdit = computed(() => !!props.channel)

const form = ref<ChannelCreate & { revenueShare: string; contractStartDate: string; contractEndDate: string; contractNotes: string }>({
  channel_id: '',
  mcn_id: '',
  creator_user_id: null,
  title: '',
  subscriber_count: 0,
  video_count: 0,
  view_count: 0,
  thumbnail_url: null,
  custom_url: null,
  description: null,
  published_at: null,
  content_owner_id: null,
  revenueShare: '70',
  contractStartDate: '',
  contractEndDate: '',
  contractNotes: '',
})

const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)
const channelTestResult = ref<ChannelTestResult | null>(null)
const thumbnailLoaded = ref(false)
const thumbnailError = ref(false)

const mcnSelectId = computed(() => `channel-mcn-select-${Math.random().toString(36).substr(2, 9)}`)

// MCN dropdown logic
const isMcnDisabled = computed(() => {
  const role = authStore.user?.role
  // MCN operators can only use their own MCN
  if (role === 'mcn_operator') {
    return true
  }
  return false
})

const mcnOptions = computed<SelectOption[]>(() => {
  // For MCN operators, show only their MCN
  if (authStore.user?.role === 'mcn_operator' && authStore.user?.mcn_id) {
    const mcn = mcns.value.find(m => m.id === authStore.user?.mcn_id)
    if (mcn) {
      return [{ value: mcn.id, label: mcn.name }]
    }
    return []
  }
  // For others, show all accessible MCNs
  return mcns.value.map(mcn => ({
    value: mcn.id,
    label: mcn.name,
  }))
})


const isFormValid = computed(() => {
  return (
    form.value.channel_id?.trim().length > 0 &&
    form.value.mcn_id &&
    form.value.title?.trim().length > 0 &&
    Object.keys(errors.value).length === 0
  )
})

const validateField = (fieldName: keyof typeof form.value) => {
  const value = form.value[fieldName] || ''
  
  switch (fieldName) {
    case 'channel_id':
      if (!value || !value.toString().trim()) {
        errors.value.channel_id = 'YouTube Channel ID is required'
      } else if (value.toString().trim().length < 2) {
        errors.value.channel_id = 'Channel ID must be at least 2 characters'
      } else {
        delete errors.value.channel_id
      }
      break
    case 'mcn_id':
      if (!value || !value.toString().trim()) {
        errors.value.mcn_id = 'MCN is required'
      } else {
        delete errors.value.mcn_id
      }
      break
    case 'title':
      if (!value || value.toString().trim().length < 1) {
        errors.value.title = 'Channel name is required'
      } else if (value.toString().trim().length > 500) {
        errors.value.title = 'Channel name must be less than 500 characters'
      } else {
        delete errors.value.title
      }
      break
  }
}

const validateForm = () => {
  errors.value = {}
  validateField('channel_id')
  validateField('mcn_id')
  validateField('title')
  // creator_user_id is optional, so skip validation
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  form.value = {
    channel_id: '',
    mcn_id: '',
    creator_user_id: null,
    title: '',
    subscriber_count: 0,
    video_count: 0,
    view_count: 0,
    thumbnail_url: null,
    custom_url: null,
    description: null,
    published_at: '',
    content_owner_id: null,
    channel_type: null,
    revenueShare: '70',
    contractStartDate: '',
    contractEndDate: '',
    contractNotes: '',
  }
  errors.value = {}
  apiError.value = null
  channelTestResult.value = null
}

const loadChannelData = () => {
  if (props.channel) {
    form.value = {
      channel_id: props.channel.channel_id,
      mcn_id: props.channel.mcn_id,
      creator_user_id: props.channel.creator_user_id || null,
      title: props.channel.title,
      subscriber_count: props.channel.subscriber_count,
      video_count: props.channel.video_count,
      view_count: props.channel.view_count,
      thumbnail_url: props.channel.thumbnail_url,
      custom_url: props.channel.custom_url || null,
      description: props.channel.description || null,
      published_at: props.channel.published_at ? (() => {
        try {
          const date = new Date(props.channel.published_at)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        } catch {
          return props.channel.published_at
        }
      })() : '',
      content_owner_id: props.channel.content_owner_id,
      channel_type: props.channel.channel_type || null,
      revenueShare: '70',
      contractStartDate: '',
      contractEndDate: '',
      contractNotes: '',
    }

  } else {
    resetForm()
    // Pre-fill MCN if provided
    if (props.prefillMcnId) {
      form.value.mcn_id = props.prefillMcnId
    } else if (authStore.user?.role === 'mcn_operator' && authStore.user?.mcn_id) {
      // Auto-select MCN for MCN operators
      form.value.mcn_id = authStore.user.mcn_id
    }
  }
}

const handleMcnChange = async () => {
  // MCN changed, no need to fetch users anymore
}

const handleImageError = (event: Event) => {
  // Image failed to load - could be CORS issue or invalid URL
  thumbnailError.value = true
  thumbnailLoaded.value = false
  console.warn('Thumbnail image failed to load:', form.value.thumbnail_url)
}

const handleImageLoad = () => {
  // Image loaded successfully
  thumbnailLoaded.value = true
  thumbnailError.value = false
}

const handleTestConnection = async () => {
  if (!form.value.channel_id?.trim()) {
    return
  }

  channelTestResult.value = null
  
  // Extract channel ID from URL if needed
  const extractedId = extractChannelId(form.value.channel_id.trim())
  if (!extractedId) {
    channelTestResult.value = {
      isValid: false,
      error: 'Invalid YouTube Channel ID or URL format',
    }
    errors.value.channel_id = 'Invalid YouTube Channel ID or URL format'
    return
  }
  
  // Update form with extracted ID if it was a URL
  if (extractedId !== form.value.channel_id.trim()) {
    form.value.channel_id = extractedId
  }
  
  const result = await testChannelConnection(extractedId, form.value.mcn_id || null)
  
  channelTestResult.value = result

  // If test is successful, auto-fill channel data
  if (result.isValid) {
    // Update channel_id with resolved ID from API response
    // The backend resolves usernames (@username) to actual channel IDs (UC...)
    if (result.channelId) {
      form.value.channel_id = result.channelId
    } else {
      // Fallback to extracted ID if channelId not in response
      form.value.channel_id = extractedId
    }
    
    // Auto-fill all fields from test result
    if (result.title) {
      form.value.title = result.title
    }
    if (result.subscriberCount !== undefined) {
      form.value.subscriber_count = result.subscriberCount
    }
    if (result.videoCount !== undefined) {
      form.value.video_count = result.videoCount
    }
    if (result.viewCount !== undefined) {
      form.value.view_count = result.viewCount
    }
    if (result.thumbnailUrl) {
      form.value.thumbnail_url = result.thumbnailUrl
    }
    if (result.customUrl !== undefined) {
      form.value.custom_url = result.customUrl || null
    }
    if (result.description !== undefined) {
      form.value.description = result.description || null
    }
    if (result.publishedAt) {
      // Convert ISO date string to datetime-local format
      try {
        const date = new Date(result.publishedAt)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        form.value.published_at = `${year}-${month}-${day}T${hours}:${minutes}`
      } catch (e) {
        form.value.published_at = result.publishedAt
      }
    }
    
    // Clear any channel_id errors
    delete errors.value.channel_id
  } else {
    // Set error if test failed
    errors.value.channel_id = result.error || 'Channel validation failed'
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    if (isEdit.value && props.channel) {
      const updateData: ChannelUpdate = {
        mcn_id: form.value.mcn_id,
        title: form.value.title.trim(),
        channel_type: form.value.channel_type || null,
      }
      const result = await updateChannel(props.channel.id, updateData)
      emit('success', result)
      resetForm()
    } else {
      // Use the channel_id from form (should already be resolved from test connection)
      // The channel_id should already be the actual YouTube channel ID (UC...)
      // If user didn't test connection, try to extract from URL/username
      let channelId = form.value.channel_id.trim()
      
      // Only extract if it doesn't look like a channel ID format
      // Channel IDs start with UC and are 24 characters long
      if (!/^UC[a-zA-Z0-9_-]{22}$/.test(channelId)) {
        const extracted = extractChannelId(channelId)
        if (extracted && /^UC[a-zA-Z0-9_-]{22}$/.test(extracted)) {
          channelId = extracted
        } else if (extracted && !extracted.startsWith('@')) {
          // If extracted ID is not a username, use it
          channelId = extracted
        }
      }
      
      const createData: ChannelCreate = {
        channel_id: channelId,
        mcn_id: form.value.mcn_id,
        creator_user_id: form.value.creator_user_id || undefined,
        title: form.value.title.trim(),
        subscriber_count: form.value.subscriber_count || 0,
        video_count: form.value.video_count || 0,
        view_count: form.value.view_count || 0,
        thumbnail_url: form.value.thumbnail_url,
        custom_url: form.value.custom_url || undefined,
        description: form.value.description || undefined,
        published_at: form.value.published_at || undefined,
        content_owner_id: form.value.content_owner_id,
        channel_type: form.value.channel_type || undefined,
      }
      const result = await createChannel(createData)
      emit('success', result)
      resetForm()
    }
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'An error occurred while saving the channel'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

// Watch for modal open and load data
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      // Fetch MCNs first (with org filter when prefilling from MCN detail) so dropdown includes current MCN
      await fetchOrganizations()
      if (props.prefillOrganizationId) {
        await fetchMcns({ organization_id: props.prefillOrganizationId, page_size: 100 })
      } else {
        await fetchMcns()
      }
      loadChannelData()
    }
  },
  { immediate: true }
)

watch(
  () => props.channel,
  () => {
    if (props.isOpen) {
      loadChannelData()
    }
  }
)

watch(
  () => props.prefillMcnId,
  () => {
    if (props.isOpen && !isEdit.value) {
      if (props.prefillMcnId) {
        form.value.mcn_id = props.prefillMcnId
        handleMcnChange()
      }
    }
  }
)
</script>

