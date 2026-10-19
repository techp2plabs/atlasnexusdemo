<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Edit User"
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

      <!-- Role (at top) -->
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Role <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.role"
          :disabled="isSubmitting"
          class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="atlas_superadmin">Atlas Superadmin</option>
          <option value="atlas_admin">Atlas Admin</option>
          <option value="org_owner">Organization Owner</option>
          <option value="org_admin">Organization Admin</option>
          <option value="mcn_operator">MCN Operator</option>
          <option value="creator">Creator</option>
        </select>
        <p v-if="errors.role" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.role }}</p>
      </div>

      <!-- Email (Display Only) -->
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          :value="user?.email"
          disabled
          class="h-10 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        />
      </div>

      <!-- Name (Display Only) -->
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          type="text"
          :value="user?.name"
          disabled
          class="h-10 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.status"
          :disabled="isSubmitting"
          class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="pending_verification">Pending Verification</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p v-if="errors.status" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.status }}</p>
      </div>

      <!-- Channel assignment (creators only) -->
      <div v-if="user?.role === 'creator' && user?.mcn_id" class="border-t border-border dark:border-gray-700 pt-4">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned channels</label>
        <p class="mb-2 text-theme-xs text-gray-500 dark:text-gray-400">
          Select channels to assign to this creator. Changes are saved on Update.
        </p>
        <div v-if="channelsLoading" class="text-sm text-gray-500 dark:text-gray-400">Loading channels...</div>
        <div v-else-if="editChannels.length === 0" class="rounded-lg border border-border bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          No channels in this MCN.
        </div>
        <div v-else class="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3 dark:border-gray-700">
          <label
            v-for="ch in editChannels"
            :key="ch.id"
            class="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <input
              v-model="selectedChannelIds"
              type="checkbox"
              :value="ch.id"
              :disabled="isSubmitting"
              class="h-4 w-4 rounded border-gray-300 text-accent-foreground focus:ring-ring dark:border-gray-600 dark:bg-gray-700"
            />
            <span class="text-sm text-foreground dark:text-white">{{ ch.title }}</span>
            <span v-if="ch.channel_id" class="text-xs text-gray-500 dark:text-gray-400">{{ ch.channel_id }}</span>
          </label>
        </div>
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
          <span v-if="isSubmitting">Updating...</span>
          <span v-else>Update User</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import type { User, UserUpdate } from '~/types/user'

interface Props {
  isOpen: boolean
  user: User | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [user: User]
}>()

const { updateUser } = useUsers()
const { channels, loading: channelsLoading, fetchChannels, updateChannel } = useChannels()

const form = ref<UserUpdate>({
  role: undefined,
  status: undefined,
})

const selectedChannelIds = ref<string[]>([])
const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)

const editChannels = computed(() => channels.value)

const isFormValid = computed(() => {
  return form.value.role !== undefined && form.value.status !== undefined && Object.keys(errors.value).length === 0
})

const resetForm = () => {
  form.value = {
    role: undefined,
    status: undefined,
  }
  selectedChannelIds.value = []
  errors.value = {}
  apiError.value = null
}

const loadUserData = () => {
  if (props.user) {
    form.value = {
      role: props.user.role,
      status: props.user.status,
    }
    selectedChannelIds.value = []
  } else {
    resetForm()
  }
}

const loadChannelsForCreator = async () => {
  if (props.user?.role === 'creator' && props.user?.mcn_id) {
    await fetchChannels({ mcn_id: props.user.mcn_id, page_size: 100 })
    await nextTick()
    // Pre-check channels currently assigned to this user
    if (props.user) {
      selectedChannelIds.value = channels.value
        .filter(ch => ch.creator_user_id === props.user!.id)
        .map(ch => ch.id)
    }
  }
}

const handleSubmit = async () => {
  if (!props.user || !isFormValid.value) {
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    if (form.value.status && form.value.status !== props.user.status) {
      await updateUser(props.user.id, { status: form.value.status })
    }

    // Update channel assignments for creators
    if (props.user.role === 'creator' && props.user.mcn_id) {
      const targetIds = new Set(selectedChannelIds.value)
      for (const ch of editChannels.value) {
        const shouldAssign = targetIds.has(ch.id)
        const currentlyAssigned = ch.creator_user_id === props.user.id
        if (shouldAssign && !currentlyAssigned) {
          await updateChannel(ch.id, { creator_user_id: props.user.id })
        } else if (!shouldAssign && currentlyAssigned) {
          await updateChannel(ch.id, { creator_user_id: null })
        }
      }
    }

    const updatedUser: User = {
      ...props.user,
      role: form.value.role || props.user.role,
      status: form.value.status || props.user.status,
    }

    emit('success', updatedUser)
    resetForm()
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'An error occurred while updating the user'
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

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      loadUserData()
      await loadChannelsForCreator()
    }
  },
  { immediate: true }
)

watch(
  () => props.user,
  async () => {
    if (props.isOpen) {
      loadUserData()
      await loadChannelsForCreator()
    }
  }
)
</script>

