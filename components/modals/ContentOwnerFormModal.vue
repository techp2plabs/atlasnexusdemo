<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="isEdit ? 'Edit Content Owner' : 'Create Content Owner'"
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

      <!-- Content Owner ID -->
      <div>
        <label
          for="content_owner_id"
          class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5"
        >
          Content Owner ID <span class="text-error-500">*</span>
        </label>
        <div class="space-y-2">
          <input
            id="content_owner_id"
            v-model="form.content_owner_id"
            type="text"
            :disabled="isEdit || isSubmitting"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-ring focus:ring-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            placeholder="Enter YouTube Content Owner ID"
            required
            :class="{ 'border-red-300 dark:border-red-600': errors.content_owner_id }"
            @blur="validateField('content_owner_id')"
          />
          <button
            v-if="!isEdit && form.content_owner_id?.trim()"
            type="button"
            @click="handleTestConnection"
            :disabled="isTesting || isSubmitting"
            class="text-sm text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isTesting ? 'Testing...' : 'Test Connection' }}
          </button>
          <div v-if="testResult" class="text-sm">
            <div
              v-if="testResult.isValid"
              class="flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ testResult.message }}</span>
            </div>
            <div
              v-else
              class="flex items-center gap-2 text-red-600 dark:text-red-400"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ testResult.error }}</span>
            </div>
          </div>
          <p v-if="errors.content_owner_id" class="text-sm text-red-600 dark:text-red-400">
            {{ errors.content_owner_id }}
          </p>
        </div>
      </div>

      <!-- Display Name -->
      <div>
        <label
          for="display_name"
          class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5"
        >
          Display Name
        </label>
        <input
          id="display_name"
          v-model="form.display_name"
          type="text"
          :disabled="isSubmitting"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-ring focus:ring-ring dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="Optional display name"
        />
      </div>

      <!-- Active Status -->
      <div class="flex items-center">
        <input
          id="is_active"
          v-model="form.is_active"
          type="checkbox"
          :disabled="isSubmitting"
          class="h-4 w-4 rounded border-gray-300 text-accent-foreground focus:ring-ring dark:border-gray-600"
        />
        <label for="is_active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Active
        </label>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="handleClose"
          :disabled="isSubmitting"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import { useContentOwners } from '~/composables/useContentOwners'
import { useContentOwnerID } from '~/composables/useContentOwnerID'
import type { ContentOwner, ContentOwnerCreate, ContentOwnerUpdate } from '~/types/content-owner'
import { useToast } from '~/composables/useToast'

interface Props {
  isOpen: boolean
  contentOwner?: ContentOwner | null
  prefillOrganizationId?: string
}

const props = withDefaults(defineProps<Props>(), {
  contentOwner: null,
  prefillOrganizationId: undefined,
})

const emit = defineEmits<{
  close: []
  success: [contentOwner: ContentOwner]
}>()

const { createContentOwner, updateContentOwner } = useContentOwners()
const { testContentOwnerIDConnection, isValidating: isTesting } = useContentOwnerID()
const { error: showErrorToast, success: showSuccessToast } = useToast()

const isSubmitting = ref(false)
const apiError = ref<string | null>(null)
const testResult = ref<{ isValid: boolean; message?: string; error?: string } | null>(null)

const form = ref({
  organization_id: '',
  content_owner_id: '',
  display_name: '',
  is_active: true,
})

const errors = ref<Record<string, string>>({})

const isEdit = computed(() => !!props.contentOwner)

const resetForm = () => {
  form.value = {
    organization_id: props.prefillOrganizationId || '',
    content_owner_id: '',
    display_name: '',
    is_active: true,
  }
  errors.value = {}
  apiError.value = null
  testResult.value = null
}

const loadContentOwnerData = () => {
  if (props.contentOwner) {
    form.value = {
      organization_id: props.contentOwner.organization_id,
      content_owner_id: props.contentOwner.content_owner_id,
      display_name: props.contentOwner.display_name || '',
      is_active: props.contentOwner.is_active,
    }
  } else {
    resetForm()
  }
}

const validateField = (field: string) => {
  if (field === 'content_owner_id') {
    if (!form.value.content_owner_id?.trim()) {
      errors.value.content_owner_id = 'Content Owner ID is required'
    } else {
      delete errors.value.content_owner_id
    }
  }
}

const handleTestConnection = async () => {
  if (!form.value.content_owner_id?.trim()) {
    return
  }

  const result = await testContentOwnerIDConnection(form.value.content_owner_id.trim())
  testResult.value = result

  if (!result.isValid && result.error) {
    errors.value.content_owner_id = result.error
  } else if (result.isValid) {
    delete errors.value.content_owner_id
    // Auto-fill display name if available
    if (result.displayName && !form.value.display_name) {
      form.value.display_name = result.displayName
    }
  }
}

const handleSubmit = async () => {
  if (!form.value.content_owner_id?.trim()) {
    errors.value.content_owner_id = 'Content Owner ID is required'
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    let result: ContentOwner

    if (isEdit.value && props.contentOwner) {
      const updateData: ContentOwnerUpdate = {}
      if (form.value.display_name !== props.contentOwner.display_name) {
        updateData.display_name = form.value.display_name || undefined
      }
      if (form.value.is_active !== props.contentOwner.is_active) {
        updateData.is_active = form.value.is_active
      }

      result = await updateContentOwner(props.contentOwner.id, updateData)
      showSuccessToast('Content owner updated successfully')
    } else {
      const createData: ContentOwnerCreate = {
        organization_id: form.value.organization_id,
        content_owner_id: form.value.content_owner_id.trim(),
        display_name: form.value.display_name?.trim() || undefined,
        is_active: form.value.is_active,
      }

      result = await createContentOwner(createData)
      showSuccessToast('Content owner created successfully')
    }

    emit('success', result)
    resetForm()
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'Failed to save content owner'
    showErrorToast(apiError.value)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadContentOwnerData()
  }
})

watch(() => props.contentOwner, () => {
  if (props.isOpen) {
    loadContentOwnerData()
  }
})
</script>

