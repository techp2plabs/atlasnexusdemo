<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Invite Organization Owner"
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

      <!-- Organization -->
      <Select
        v-model="form.organization_id"
        label="Organization"
        :options="organizationOptions"
        placeholder="Select an organization"
        :disabled="isOrganizationDisabled || isSubmitting"
        required
        :error="!!errors.organization_id"
        :errorMessage="errors.organization_id"
        @blur="validateField('organization_id')"
      />

      <!-- Organization Owner Email -->
      <Input
        v-model="form.email"
        label="Organization Owner Email"
        type="email"
        placeholder="owner@example.com"
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
          Organization Owner
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
import type { SelectOption } from '~/components/forms/Select.vue'

interface Props {
  isOpen: boolean
  prefillOrganizationId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const { createInvite } = useInvites()
const { organizations, fetchOrganizations } = useOrganizations()
const { success: showSuccessToast } = useToast()

const form = ref<InviteCreate>({
  email: '',
  role: 'org_owner',
  organization_id: null,
})

const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)

// Organization dropdown logic
const isOrganizationDisabled = computed(() => {
  const role = authStore.user?.role
  return role === 'org_owner' || role === 'org_admin'
})

const organizationOptions = computed<SelectOption[]>(() => {
  if (isOrganizationDisabled.value && authStore.user?.organization_id) {
    // For org_owner/org_admin, show only their organization
    const org = organizations.value.find(org => org.id === authStore.user?.organization_id)
    if (org) {
      return [{ value: org.id, label: org.name }]
    }
    return []
  }
  // For atlas_superadmin/atlas_admin, show all organizations
  return organizations.value.map(org => ({
    value: org.id,
    label: org.name,
  }))
})

const isFormValid = computed(() => {
  return (
    form.value.organization_id &&
    form.value.email.trim().length > 0 &&
    isValidEmail(form.value.email) &&
    Object.keys(errors.value).length === 0
  )
})

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateField = (fieldName: keyof typeof form.value) => {
  const value = form.value[fieldName] || ''
  
  switch (fieldName) {
    case 'organization_id':
      if (!value || !value.toString().trim()) {
        errors.value.organization_id = 'Organization is required'
      } else {
        delete errors.value.organization_id
      }
      break
    case 'email':
      const email = value.toString().trim()
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
  validateField('email')
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  form.value = {
    email: '',
    role: 'org_owner',
    organization_id: null,
  }
  errors.value = {}
  apiError.value = null
}

const loadFormData = () => {
  resetForm()
  
  // Pre-fill organization if provided
  if (props.prefillOrganizationId) {
    form.value.organization_id = props.prefillOrganizationId
  } else if (isOrganizationDisabled.value && authStore.user?.organization_id) {
    // Auto-select organization for org_owner/org_admin
    form.value.organization_id = authStore.user.organization_id
  }
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
      role: 'org_owner',
      organization_id: form.value.organization_id || null,
    }

    await createInvite(data)

    emit('success')
    showSuccessToast(`Invitation sent to ${data.email}`)
    resetForm()
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'An error occurred while sending the invitation'
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

// Load organizations when modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      // Fetch organizations if not already loaded
      if (organizations.value.length === 0) {
        await fetchOrganizations()
      }
      loadFormData()
    }
  },
  { immediate: true }
)

// Update form when prefillOrganizationId changes
watch(
  () => props.prefillOrganizationId,
  () => {
    if (props.isOpen) {
      loadFormData()
    }
  }
)
</script>

