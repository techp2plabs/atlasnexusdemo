<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Delete Content Owner"
    size="md"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Are you sure you want to delete this content owner? This action cannot be undone.
      </p>

      <div v-if="contentOwner" class="rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="space-y-2">
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Content Owner ID:</span>
            <code class="ml-2 rounded bg-gray-100 px-2 py-1 text-xs text-foreground dark:bg-gray-700 dark:text-white">
              {{ contentOwner.content_owner_id }}
            </code>
          </div>
          <div v-if="contentOwner.display_name">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name:</span>
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ contentOwner.display_name }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="handleClose"
          :disabled="isDeleting"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleDelete"
          :disabled="isDeleting"
          class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import { useContentOwners } from '~/composables/useContentOwners'
import type { ContentOwner } from '~/types/content-owner'
import { useToast } from '~/composables/useToast'

interface Props {
  isOpen: boolean
  contentOwner: ContentOwner | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const { deleteContentOwner } = useContentOwners()
const { error: showErrorToast, success: showSuccessToast } = useToast()

const isDeleting = ref(false)

const handleDelete = async () => {
  if (!props.contentOwner) return

  isDeleting.value = true

  try {
    await deleteContentOwner(props.contentOwner.id)
    showSuccessToast('Content owner deleted successfully')
    emit('success')
    handleClose()
  } catch (err: any) {
    // Error is handled by composable
    showErrorToast(err.response?.data?.detail || 'Failed to delete content owner')
  } finally {
    isDeleting.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

