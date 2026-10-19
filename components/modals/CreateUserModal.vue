<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="createdUser ? 'User Created' : 'Create User'"
    size="lg"
  >
    <!-- Success state: show credentials once, since no email is sent -->
    <div v-if="createdUser" class="space-y-4">
      <div class="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
        <p class="text-sm text-green-800 dark:text-green-300">
          <strong>{{ createdUser.name }}</strong> was created as
          <strong>{{ ROLE_LABELS[createdUser.role] || createdUser.role }}</strong> and is already active —
          no invitation email was sent.
        </p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email</label>
        <div class="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {{ createdUser.email }}
        </div>
      </div>

      <div v-if="createdUser.temporary_password">
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Temporary Password</label>
        <div class="flex items-center gap-2">
          <div class="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 font-mono text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            {{ createdUser.temporary_password }}
          </div>
          <button
            type="button"
            @click="copyPassword"
            class="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <p class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
          Shown only once — share it with the user through a secure channel. They should change it after first login.
        </p>
      </div>
    </div>

    <!-- Create form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <!-- API Error Message -->
      <div
        v-if="apiError"
        class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
      >
        <p class="text-sm text-red-800 dark:text-red-300">{{ apiError }}</p>
      </div>

      <p class="text-sm text-gray-500 dark:text-gray-400">
        Creates an active user right away, already assigned into the selected org/MCN/channel
        hierarchy. No invitation email is sent.
      </p>

      <!-- Role -->
      <Select
        v-model="selectedRole"
        label="Role"
        :options="roleOptions"
        placeholder="Select a role"
        :disabled="isSubmitting"
        required
        :error="!!errors.role"
        :errorMessage="errors.role"
        @blur="validateField('role')"
      />

      <!-- Name -->
      <Input
        v-model="form.name"
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        required
        :error="!!errors.name"
        :errorMessage="errors.name"
        :disabled="isSubmitting"
        @blur="validateField('name')"
      />

      <!-- User Email -->
      <Input
        v-model="form.email"
        label="User Email"
        type="email"
        placeholder="user@example.com"
        required
        :error="!!errors.email"
        :errorMessage="errors.email"
        :disabled="isSubmitting"
        @blur="validateField('email')"
      />

      <!-- Password (optional — auto-generated if left blank) -->
      <Input
        v-model="form.password"
        label="Password (optional)"
        type="text"
        placeholder="Leave blank to auto-generate"
        :error="!!errors.password"
        :errorMessage="errors.password"
        :disabled="isSubmitting"
        @blur="validateField('password')"
      />
      <p class="-mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
        Leave blank to have the system generate a temporary password, shown once after creation.
      </p>

      <!-- Organization (required for org_owner, org_admin, mcn_operator, creator) -->
      <Select
        v-if="needsOrganization"
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

      <!-- MCN Partner (required for mcn_operator, creator) -->
      <Select
        v-if="needsMcn"
        v-model="selectedMcnId"
        label="MCN Partner"
        :options="mcnOptions"
        :placeholder="mcnPlaceholder"
        :disabled="isMcnDisabled || isSubmitting"
        required
        :error="!!errors.mcn_id"
        :errorMessage="errors.mcn_id"
        @blur="validateField('mcn_id')"
      />

      <!-- Channel assignment (checklist) — creator only, optional -->
      <div v-if="selectedRole === 'creator' && selectedMcnId" class="border-t border-border dark:border-gray-700 pt-4">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Assign channels (optional)
        </label>
        <p class="mb-2 text-theme-xs text-gray-500 dark:text-gray-400">
          Select channels to assign to this creator right away.
        </p>
        <div v-if="channelsLoading" class="text-sm text-gray-500 dark:text-gray-400">Loading channels...</div>
        <div v-else-if="availableChannels.length === 0" class="rounded-lg border border-border bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          No channels in this MCN. Add channels first, or assign later via Channel edit.
        </div>
        <div v-else class="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3 dark:border-gray-700">
          <label
            v-for="ch in availableChannels"
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
      <div v-if="createdUser" class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="handleDone"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Done
        </button>
      </div>
      <div v-else class="flex items-center justify-end gap-3">
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
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>Create User</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import Input from '~/components/forms/Input.vue'
import Select from '~/components/forms/Select.vue'
import type { UserCreate, UserCreateResult } from '~/types/user'
import { useCascadingDropdowns } from '~/composables/useCascadingDropdowns'
import { assignableRoleOptionsForActor, ROLE_LABELS } from '~/utils/assignableRoles'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const { createUser } = useUsers()
const { success: showSuccessToast } = useToast()
const { channels, loading: channelsLoading, fetchChannels: fetchChannelsList } = useChannels()

const cascadingComposable = useCascadingDropdowns()
const {
  selectedOrganizationId,
  selectedMcnId,
  organizationOptions,
  mcnOptions,
  isOrganizationDisabled,
  isMcnDisabled,
  loadingMcns,
  initialize: initializeCascading,
} = cascadingComposable

const roleOptions = computed(() => assignableRoleOptionsForActor(authStore.user?.role))

const selectedRole = ref<string>('')
const form = ref<{ name: string; email: string; password: string }>({ name: '', email: '', password: '' })
const availableChannels = computed(() => channels.value)
const selectedChannelIds = ref<string[]>([])

const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)
const createdUser = ref<UserCreateResult | null>(null)
const copied = ref(false)

const needsOrganization = computed(() =>
  ['org_owner', 'org_admin', 'mcn_operator', 'creator'].includes(selectedRole.value)
)
const needsMcn = computed(() => ['mcn_operator', 'creator'].includes(selectedRole.value))

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

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isFormValid = computed(() => {
  if (!selectedRole.value) return false
  if (!form.value.name.trim()) return false
  if (!form.value.email.trim() || !isValidEmail(form.value.email)) return false
  if (form.value.password && form.value.password.length < 8) return false
  if (needsOrganization.value && !selectedOrganizationId.value) return false
  if (needsMcn.value && !selectedMcnId.value) return false
  return Object.keys(errors.value).length === 0
})

const validateField = (fieldName: 'role' | 'name' | 'email' | 'password' | 'organization_id' | 'mcn_id') => {
  switch (fieldName) {
    case 'role':
      if (!selectedRole.value) {
        errors.value.role = 'Role is required'
      } else {
        delete errors.value.role
      }
      break
    case 'name':
      if (!form.value.name.trim()) {
        errors.value.name = 'Name is required'
      } else {
        delete errors.value.name
      }
      break
    case 'email': {
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
    case 'password':
      if (form.value.password && form.value.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters'
      } else {
        delete errors.value.password
      }
      break
    case 'organization_id':
      if (needsOrganization.value && !selectedOrganizationId.value) {
        errors.value.organization_id = 'Organization is required'
      } else {
        delete errors.value.organization_id
      }
      break
    case 'mcn_id':
      if (needsMcn.value && !selectedMcnId.value) {
        errors.value.mcn_id = 'MCN is required'
      } else {
        delete errors.value.mcn_id
      }
      break
  }
}

const validateForm = () => {
  errors.value = {}
  validateField('role')
  validateField('name')
  validateField('email')
  validateField('password')
  validateField('organization_id')
  validateField('mcn_id')
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  selectedRole.value = ''
  form.value = { name: '', email: '', password: '' }
  selectedChannelIds.value = []
  errors.value = {}
  apiError.value = null
  createdUser.value = null
  copied.value = false
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    const data: UserCreate = {
      email: form.value.email.trim(),
      name: form.value.name.trim(),
      password: form.value.password.trim() || undefined,
      role: selectedRole.value as UserCreate['role'],
      organization_id: needsOrganization.value ? selectedOrganizationId.value : null,
      mcn_id: needsMcn.value ? selectedMcnId.value : null,
      channel_ids:
        selectedRole.value === 'creator' && selectedChannelIds.value.length > 0
          ? selectedChannelIds.value
          : undefined,
    }

    const result = await createUser(data)
    createdUser.value = result ?? null
    emit('success')
    showSuccessToast(`${data.name} was created and is now active`)
  } catch (err: any) {
    const statusCode = err.response?.status
    if (statusCode === 403) {
      apiError.value = "You don't have permission to create users with this role or scope"
    } else if (statusCode === 400) {
      apiError.value = err.response?.data?.detail || 'A user with this email already exists'
    } else {
      apiError.value = err.response?.data?.detail || 'An error occurred while creating the user'
    }
  } finally {
    isSubmitting.value = false
  }
}

const copyPassword = async () => {
  if (!createdUser.value?.temporary_password) return
  try {
    await navigator.clipboard.writeText(createdUser.value.temporary_password)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard API unavailable — password remains visible for manual copy.
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

const handleDone = () => {
  resetForm()
  emit('close')
}

// Reset target-role-dependent selections (MCN/channels) whenever the selected role changes,
// since e.g. switching from creator -> org_admin should drop stale MCN/channel picks.
watch(selectedRole, () => {
  selectedChannelIds.value = []
  if (!needsMcn.value) {
    selectedMcnId.value = null
  }
  errors.value = {}
})

// Load channels when MCN is selected and target role is creator
watch(
  () => [selectedRole.value, selectedMcnId.value],
  async ([role, mcnId]) => {
    if (role === 'creator' && mcnId) {
      await fetchChannelsList({ mcn_id: mcnId as string, page_size: 100 })
    }
  }
)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      resetForm()
      await initializeCascading()
    }
  },
  { immediate: true }
)
</script>
