<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Add Contract History Entry"
    size="md"
  >
    <form @submit.prevent="handleSubmit" class="py-4 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Change Type <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.change_type"
          class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="field_update">Field Update</option>
          <option value="notes_update">Notes Update</option>
          <option value="other">Other</option>
        </select>
        <p v-if="errors.change_type" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.change_type }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Field Name
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
        </label>
        <input
          v-model="form.field_name"
          type="text"
          placeholder="e.g., revenue_share_pct, start_date"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Old Value
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
        </label>
        <input
          v-model="form.old_value"
          type="text"
          placeholder="Previous value"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          New Value
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
        </label>
        <input
          v-model="form.new_value"
          type="text"
          placeholder="New value"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Change Description <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.change_description"
          rows="3"
          placeholder="Describe the change..."
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        ></textarea>
        <p v-if="errors.change_description" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.change_description }}</p>
      </div>

      <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
        <p class="text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
      </div>
    </form>

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
          @click="handleSubmit"
          type="button"
          :disabled="saving"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Add Entry' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import type { ContractHistoryCreate } from '~/types/contract'

const props = defineProps<{
  isOpen: boolean
  contractId: string
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const { createContractHistoryEntry } = useContractFiles()

const form = reactive<ContractHistoryCreate & { change_type: string }>({
  change_type: 'field_update',
  field_name: '',
  old_value: '',
  new_value: '',
  change_description: '',
})

const errors = reactive({
  change_type: '',
  change_description: '',
})

const saving = ref(false)
const submitError = ref<string | null>(null)

const handleClose = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.change_type = 'field_update'
  form.field_name = ''
  form.old_value = ''
  form.new_value = ''
  form.change_description = ''
  errors.change_type = ''
  errors.change_description = ''
  submitError.value = null
}

const validateForm = (): boolean => {
  let isValid = true
  
  errors.change_type = ''
  errors.change_description = ''
  
  if (!form.change_type) {
    errors.change_type = 'Change type is required'
    isValid = false
  }
  
  if (!form.change_description.trim()) {
    errors.change_description = 'Change description is required'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  saving.value = true
  submitError.value = null
  
  try {
    const data: ContractHistoryCreate = {
      change_type: form.change_type,
      field_name: form.field_name || undefined,
      old_value: form.old_value || undefined,
      new_value: form.new_value || undefined,
      change_description: form.change_description.trim(),
    }
    
    await createContractHistoryEntry(props.contractId, data)
    emit('success')
    resetForm()
  } catch (err: any) {
    submitError.value = err.response?.data?.detail || 'Failed to create history entry'
  } finally {
    saving.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetForm()
  }
})
</script>

