<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Invite MCN Partner Admin"
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

      <!-- Organization: read-only when prefilled, else dropdown -->
      <template v-if="isPrefilled">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Organization</label>
          <div class="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {{ prefilledOrganizationLabel || '—' }}
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">MCN Partner</label>
          <div class="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {{ prefillMcnName || '—' }}
          </div>
        </div>
      </template>
      <template v-else>
        <Select
          v-model="selectedOrganizationId"
          label="Organization"
          :options="organizationOptions"
          placeholder="Select an organization"
          :disabled="isOrganizationDisabled || isSubmitting"
          required
          :error="!!errors.organization_id"
          :errorMessage="errors.organization_id"
          @blur="validateField('organization_id')"
        />
        <Select
          v-model="selectedMcnId"
          label="MCN Partner"
          :options="mcnSelectOptions"
          :placeholder="mcnPlaceholder"
          :disabled="isMcnDisabled || isSubmitting"
          required
          :error="!!errors.mcn_id"
          :errorMessage="errors.mcn_id"
          @blur="validateField('mcn_id')"
        />
      </template>

      <!-- MCN Admin Email -->
      <Input
        v-model="form.email"
        label="MCN Admin Email"
        type="email"
        placeholder="admin@example.com"
        required
        :error="!!errors.email"
        :errorMessage="errors.email"
        :disabled="isSubmitting"
        @blur="validateField('email')"
      />

      <!-- Role (Display Only) -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Role
        </label>
        <div class="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          MCN Admin
        </div>
        <p class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
          This role is automatically assigned to the invited user
        </p>
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
          <span v-if="isSubmitting">Sending...</span>
          <span v-else>Send Invitation</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import Input from '~/components/forms/Input.vue'
import Select from '~/components/forms/Select.vue'
import type { InviteCreate } from '~/types/invite'
import { useCascadingDropdowns } from '~/composables/useCascadingDropdowns'

interface Props {
  isOpen: boolean
  prefillOrganizationId?: string | null
  prefillMcnId?: string | null
  prefillMcnName?: string | null
}

const props = defineProps<Props>()

const { fetchOrganization } = useOrganizations()
const prefilledOrg = ref<{ brand_name?: string; name: string } | null>(null)

const isPrefilled = computed(() => !!(props.prefillOrganizationId && props.prefillMcnId))

const prefilledOrganizationLabel = computed(() => {
  if (!prefilledOrg.value) return ''
  const org = prefilledOrg.value
  return org.brand_name ? `${org.brand_name} - ${org.name}` : org.name
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const { createInvite } = useInvites()
const { success: showSuccessToast } = useToast()
const cascadingComposable = useCascadingDropdowns(props.prefillOrganizationId, props.prefillMcnId)

// Destructure refs for proper unwrapping in template
const {
  selectedOrganizationId,
  selectedMcnId,
  organizationOptions,
  mcnOptions,
  isOrganizationDisabled,
  isMcnDisabled,
  loadingMcns,
  initialize: initializeCascading
} = cascadingComposable

const form = ref<InviteCreate>({
  email: '',
  role: 'org_admin',
  organization_id: null,
  mcn_id: null,
})

const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)

const mcnPlaceholder = computed(() => {
  if (!selectedOrganizationId.value) {
    return 'Please select an organization first'
  }
  if (loadingMcns.value) {
    return 'Loading MCNs...'
  }
  if (mcnOptions.value.length === 0) {
    return 'No MCNs found in this organization'
  }
  return 'Select an MCN'
})

const mcnSelectOptions = computed(() => {
  return mcnOptions.value
})

const isFormValid = computed(() => {
  return (
    selectedOrganizationId.value &&
    selectedMcnId.value &&
    form.value.email.trim().length > 0 &&
    isValidEmail(form.value.email) &&
    Object.keys(errors.value).length === 0
  )
})

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateField = (fieldName: keyof typeof form.value | 'organization_id' | 'mcn_id') => {
  switch (fieldName) {
    case 'organization_id':
      if (!selectedOrganizationId.value) {
        errors.value.organization_id = 'Organization is required'
      } else {
        delete errors.value.organization_id
      }
      break
    case 'mcn_id':
      if (!selectedMcnId.value) {
        errors.value.mcn_id = 'MCN is required'
      } else {
        delete errors.value.mcn_id
      }
      break
    case 'email':
      const email = form.value.email.trim()
      if (!email) {
        errors.value.email = 'Email is required'
      } else if (!isValidEmail(email)) {
        errors.value.email = 'Please enter a valid email address'
      } else {
        delete errors.value.email
      }
      break
  }
}

const validateForm = () => {
  errors.value = {}
  validateField('organization_id')
  validateField('mcn_id')
  validateField('email')
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  form.value = {
    email: '',
    role: 'org_admin',
    organization_id: null,
    mcn_id: null,
  }
  errors.value = {}
  apiError.value = null
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    const data: InviteCreate = {
      email: form.value.email.trim(),
      role: 'org_admin',
      organization_id: selectedOrganizationId.value || null,
      mcn_id: selectedMcnId.value || null,
    }

    await createInvite(data)

    emit('success')
    showSuccessToast(`Invitation sent to ${data.email}`)
    // Reset form after success
    await nextTick()
    resetForm()
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'An error occurred while sending the invitation'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    // Don't reset form when closing - let the watch handle it when modal opens again
    // This prevents the error during component unmounting
    emit('close')
  }
}

// Initialize when modal opens (pass current props so prefill is applied)
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      try {
        prefilledOrg.value = null
        await initializeCascading({
          organizationId: props.prefillOrganizationId ?? undefined,
          mcnId: props.prefillMcnId ?? undefined,
        })
        // When prefilled, fetch the single organization so we can show "Brand - Organization" in read-only field
        if (props.prefillOrganizationId) {
          try {
            const org = await fetchOrganization(props.prefillOrganizationId)
            if (props.isOpen) prefilledOrg.value = org
          } catch {
            prefilledOrg.value = null
          }
        }
        // Wait for DOM to be ready before resetting
        await nextTick()
        // Double-check modal is still open before resetting
        if (props.isOpen) {
          resetForm()
        }
      } catch (error) {
        // Silently handle errors during initialization
        console.error('Error initializing modal:', error)
      }
    } else {
      prefilledOrg.value = null
    }
  },
  { immediate: true }
)

// Update when prefill props change
watch(
  () => [props.prefillOrganizationId, props.prefillMcnId],
  async () => {
    if (props.isOpen) {
      await initializeCascading({
        organizationId: props.prefillOrganizationId ?? undefined,
        mcnId: props.prefillMcnId ?? undefined,
      })
      if (props.prefillOrganizationId) {
        try {
          const org = await fetchOrganization(props.prefillOrganizationId)
          if (props.isOpen) prefilledOrg.value = org
        } catch {
          prefilledOrg.value = null
        }
      } else {
        prefilledOrg.value = null
      }
    }
  }
)
</script>

