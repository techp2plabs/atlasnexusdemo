<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Review Contract Changes"
    size="lg"
  >
    <div class="py-4 space-y-4">
      <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          Please review the changes below before updating the contract. These changes will be automatically recorded in the contract history.
        </p>
      </div>

      <!-- Changes List -->
      <div v-if="changes.length > 0" class="space-y-3">
        <h3 class="text-sm font-medium text-foreground dark:text-white">Field Changes:</h3>
        <div
          v-for="change in changes"
          :key="change.field"
          class="rounded-lg border border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground dark:text-white mb-2">
                {{ getFieldLabel(change.field) }}
              </p>
              <div class="space-y-1">
                <div v-if="change.oldValue !== null && change.oldValue !== undefined" class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Old:</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400 line-through">{{ formatValue(change.field, change.oldValue) }}</span>
                </div>
                <div v-if="change.newValue !== null && change.newValue !== undefined" class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 dark:text-gray-400">New:</span>
                  <span class="text-sm font-medium text-foreground dark:text-white">{{ formatValue(change.field, change.newValue) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">No changes detected.</p>
      </div>

      <!-- Optional Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
        </label>
        <textarea
          v-model="notes"
          rows="3"
          placeholder="Add any notes about these changes..."
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        ></textarea>
      </div>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          @click="handleClose"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          type="button"
          :disabled="saving"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {{ saving ? 'Updating...' : 'Confirm Update' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'

interface FieldChange {
  field: string
  oldValue: any
  newValue: any
}

const props = defineProps<{
  isOpen: boolean
  changes: FieldChange[]
  onConfirm: (notes?: string) => Promise<void>
}>()

const emit = defineEmits<{
  close: []
}>()

const notes = ref('')
const saving = ref(false)
const error = ref<string | null>(null)

const handleClose = () => {
  notes.value = ''
  error.value = null
  emit('close')
}

const handleConfirm = async () => {
  saving.value = true
  error.value = null
  try {
    await props.onConfirm(notes.value.trim() || undefined)
    handleClose()
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to update contract'
  } finally {
    saving.value = false
  }
}

const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    revenue_share_pct: 'Revenue Share %',
    start_date: 'Start Date',
    end_date: 'End Date',
    notes: 'Notes',
  }
  return labels[field] || field
}

const formatValue = (field: string, value: any): string => {
  if (value === null || value === undefined) return '—'
  
  if (field === 'revenue_share_pct') {
    return `${value}%`
  }
  
  if (field === 'start_date' || field === 'end_date') {
    if (!value) return '—'
    try {
      const date = new Date(value)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return String(value)
    }
  }
  
  return String(value)
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    notes.value = ''
    error.value = null
  }
})
</script>

