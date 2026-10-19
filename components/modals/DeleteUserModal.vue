<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Delete User"
    size="md"
  >
    <div class="space-y-4">
      <!-- Warning Message -->
      <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">Warning: Soft Delete</p>
            <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              This will set the user's status to "inactive". The user will not be able to access the platform, but their data will be preserved.
            </p>
          </div>
        </div>
      </div>

      <!-- User Information -->
      <div class="rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <dl class="space-y-2">
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
            <dd class="mt-1 text-sm text-foreground dark:text-white">{{ user?.name }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
            <dd class="mt-1 text-sm text-foreground dark:text-white">{{ user?.email }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
            <dd class="mt-1 text-sm text-foreground dark:text-white">{{ formatRoleName(user?.role || '') }}</dd>
          </div>
        </dl>
      </div>

      <!-- API Error Message -->
      <div
        v-if="apiError"
        class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
      >
        <p class="text-sm text-red-800 dark:text-red-300">{{ apiError }}</p>
      </div>
    </div>

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
          type="button"
          @click="handleConfirm"
          :disabled="isSubmitting"
          class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span v-if="isSubmitting">Deleting...</span>
          <span v-else>Delete User</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import type { User } from '~/types/user'

interface Props {
  isOpen: boolean
  user: User | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const { deleteUser } = useUsers()

const apiError = ref<string | null>(null)
const isSubmitting = ref(false)

const formatRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    atlas_superadmin: 'Atlas Superadmin',
    atlas_admin: 'Atlas Admin',
    org_owner: 'Organization Owner',
    org_admin: 'Organization Admin',
    mcn_operator: 'MCN Operator',
    creator: 'Creator',
  }
  return roleMap[role] || role
}

const handleConfirm = async () => {
  if (!props.user) {
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    await deleteUser(props.user.id)
    emit('success')
    apiError.value = null
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'An error occurred while deleting the user'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    apiError.value = null
    emit('close')
  }
}
</script>

