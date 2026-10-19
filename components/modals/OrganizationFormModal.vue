<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="isEdit ? 'Edit Organization' : 'Create Organization'"
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

      <!-- Brand Name -->
      <Input
        v-model="form.brand_name"
        label="Brand Name"
        placeholder="Enter brand name"
        required
        :error="!!errors.brand_name"
        :errorMessage="errors.brand_name"
        :disabled="isSubmitting"
        @blur="validateField('brand_name')"
      />

      <!-- Organization Name -->
      <Input
        v-model="form.name"
        label="Organization Name"
        placeholder="Enter organization name"
        required
        :error="!!errors.name"
        :errorMessage="errors.name"
        :disabled="isSubmitting"
        @blur="validateField('name')"
      />

      <!-- Additional fields only shown when editing -->
      <template v-if="isEdit">
        <!-- Address -->
        <Textarea
          v-model="form.address"
          label="Address"
          placeholder="Enter organization address"
          :rows="3"
          :error="!!errors.address"
          :errorMessage="errors.address"
          :disabled="isSubmitting"
          @blur="validateField('address')"
        />

        <!-- City -->
        <Input
          v-model="form.city"
          label="City"
          placeholder="Enter city"
          :error="!!errors.city"
          :errorMessage="errors.city"
          :disabled="isSubmitting"
          @blur="validateField('city')"
        />

        <!-- Nation -->
        <Input
          v-model="form.nation"
          label="Nation"
          placeholder="Enter country/nation"
          :error="!!errors.nation"
          :errorMessage="errors.nation"
          :disabled="isSubmitting"
          @blur="validateField('nation')"
        />

        <!-- Tax ID -->
        <Input
          v-model="form.tax_id"
          label="Tax ID"
          placeholder="Enter tax ID"
          :error="!!errors.tax_id"
          :errorMessage="errors.tax_id"
          :disabled="isSubmitting"
          @blur="validateField('tax_id')"
        />

        <!-- Logo Upload -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Logo
          </label>
          <div class="space-y-2">
            <!-- Current Logo Preview -->
            <div v-if="form.logo_url" class="flex items-center gap-3">
              <img
                :src="form.logo_url"
                alt="Current logo"
                class="h-16 w-16 rounded-lg object-cover border border-gray-300 dark:border-gray-700"
              />
              <div class="flex-1">
                <p class="text-sm text-gray-600 dark:text-gray-400">Current logo</p>
                <button
                  type="button"
                  @click="form.logo_url = ''"
                  :disabled="isSubmitting || isUploadingLogo"
                  class="mt-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <!-- File Input -->
            <div>
              <input
                ref="logoFileInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                @change="handleLogoFileSelect"
                :disabled="isSubmitting || isUploadingLogo"
                class="hidden"
              />
              <button
                type="button"
                @click="logoFileInput?.click()"
                :disabled="isSubmitting || isUploadingLogo"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span v-if="isUploadingLogo">Uploading...</span>
                <span v-else>{{ form.logo_url ? 'Change Logo' : 'Upload Logo' }}</span>
              </button>
              <p v-if="errors.logo_file" class="mt-1.5 text-theme-xs text-error-500">
                {{ errors.logo_file }}
              </p>
              <p v-else class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
                Upload a logo image (JPEG, PNG, or WebP, max 5MB)
              </p>
            </div>
          </div>
        </div>

        <!-- Bank Account -->
        <Input
          v-model="form.bank_account"
          label="Bank Account"
          placeholder="e.g., BCA, Mandiri"
          :error="!!errors.bank_account"
          :errorMessage="errors.bank_account"
          :disabled="isSubmitting"
          @blur="validateField('bank_account')"
        />

        <!-- Bank Account Number -->
        <Input
          v-model="form.bank_account_number"
          label="Bank Account Number"
          placeholder="e.g., 7140198298"
          :error="!!errors.bank_account_number"
          :errorMessage="errors.bank_account_number"
          :disabled="isSubmitting"
          @blur="validateField('bank_account_number')"
        />

        <!-- Bank Account Name -->
        <Input
          v-model="form.bank_account_name"
          label="Bank Account Name"
          placeholder="e.g., Anugerah B. Sembada"
          :error="!!errors.bank_account_name"
          :errorMessage="errors.bank_account_name"
          :disabled="isSubmitting"
          @blur="validateField('bank_account_name')"
        />
      </template>
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
import Textarea from '~/components/forms/Textarea.vue'
import type { Organization } from '~/types/organization'
import type { OrganizationCreate, OrganizationUpdate } from '~/composables/useOrganizations'

interface Props {
  isOpen: boolean
  organization?: Organization | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [organization: Organization]
}>()

const { createOrganization, updateOrganization, uploadOrganizationLogo } = useOrganizations()

const isEdit = computed(() => !!props.organization)

const form = ref<OrganizationCreate>({
  brand_name: '',
  name: '',
  address: '',
  tax_id: '',
  logo_url: '',
  city: '',
  nation: '',
  bank_account: '',
  bank_account_number: '',
  bank_account_name: '',
})

const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)
const isUploadingLogo = ref(false)
const logoFileInput = ref<HTMLInputElement | null>(null)
const selectedLogoFile = ref<File | null>(null)

const isFormValid = computed(() => {
  // Don't count logo_file error as blocking form submission
  // Logo upload errors are shown but don't prevent saving other fields
  const blockingErrors = { ...errors.value }
  delete blockingErrors.logo_file
  
  return (
    form.value.brand_name.trim().length >= 2 &&
    form.value.name.trim().length >= 2 && 
    Object.keys(blockingErrors).length === 0 &&
    !isUploadingLogo.value
  )
})

const validateField = (fieldName: keyof typeof form.value) => {
  const value = form.value[fieldName] || ''
  
  switch (fieldName) {
    case 'brand_name':
      if (!value || value.trim().length < 2) {
        errors.value.brand_name = 'Brand name must be at least 2 characters'
      } else if (value.trim().length > 255) {
        errors.value.brand_name = 'Brand name must be less than 255 characters'
      } else {
        delete errors.value.brand_name
      }
      break
    case 'name':
      if (!value || value.trim().length < 2) {
        errors.value.name = 'Organization name must be at least 2 characters'
      } else if (value.trim().length > 100) {
        errors.value.name = 'Organization name must be less than 100 characters'
      } else {
        delete errors.value.name
      }
      break
    case 'address':
      if (value && value.length > 500) {
        errors.value.address = 'Address must be less than 500 characters'
      } else {
        delete errors.value.address
      }
      break
    case 'tax_id':
      if (value && value.length > 50) {
        errors.value.tax_id = 'Tax ID must be less than 50 characters'
      } else {
        delete errors.value.tax_id
      }
      break
    case 'city':
      if (value && value.length > 255) {
        errors.value.city = 'City must be less than 255 characters'
      } else {
        delete errors.value.city
      }
      break
    case 'nation':
      if (value && value.length > 255) {
        errors.value.nation = 'Nation must be less than 255 characters'
      } else {
        delete errors.value.nation
      }
      break
    case 'bank_account':
      if (value && value.length > 255) {
        errors.value.bank_account = 'Bank account must be less than 255 characters'
      } else {
        delete errors.value.bank_account
      }
      break
    case 'bank_account_number':
      if (value && value.length > 100) {
        errors.value.bank_account_number = 'Bank account number must be less than 100 characters'
      } else {
        delete errors.value.bank_account_number
      }
      break
    case 'bank_account_name':
      if (value && value.length > 255) {
        errors.value.bank_account_name = 'Bank account name must be less than 255 characters'
      } else {
        delete errors.value.bank_account_name
      }
      break
  }
}

const handleLogoFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.value.logo_file = 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    return
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errors.value.logo_file = 'File size must be less than 5MB.'
    return
  }
  
  delete errors.value.logo_file
  selectedLogoFile.value = file
  
  // Upload logo immediately if in edit mode
  if (isEdit.value && props.organization) {
    await uploadLogo()
  }
}

const uploadLogo = async () => {
  if (!selectedLogoFile.value || !props.organization) return
  
  isUploadingLogo.value = true
  errors.value.logo_file = ''
  
  try {
    const updatedOrg = await uploadOrganizationLogo(props.organization.id, selectedLogoFile.value)
    form.value.logo_url = updatedOrg.logo_url || ''
    selectedLogoFile.value = null
    // Reset file input
    if (logoFileInput.value) {
      logoFileInput.value.value = ''
    }
    // Don't emit success here - let user continue editing
    // The logo_url is already updated in form.value, so it will be saved when they click Update
  } catch (err: any) {
    errors.value.logo_file = err.response?.data?.detail || 'Failed to upload logo'
  } finally {
    isUploadingLogo.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  validateField('brand_name')
  validateField('name')
  // Only validate additional fields when editing
  if (isEdit.value) {
    validateField('address')
    validateField('tax_id')
    validateField('city')
    validateField('nation')
    validateField('bank_account')
    validateField('bank_account_number')
    validateField('bank_account_name')
  }
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  form.value = {
    brand_name: '',
    name: '',
    address: '',
    tax_id: '',
    logo_url: '',
    city: '',
    nation: '',
    bank_account: '',
    bank_account_number: '',
    bank_account_name: '',
  }
  errors.value = {}
  apiError.value = null
  selectedLogoFile.value = null
  if (logoFileInput.value) {
    logoFileInput.value.value = ''
  }
}

const loadOrganizationData = () => {
  if (props.organization) {
    form.value = {
      brand_name: props.organization.brand_name || '',
      name: props.organization.name || '',
      address: props.organization.address || '',
      tax_id: props.organization.tax_id || '',
      logo_url: props.organization.logo_url || '',
      city: props.organization.city || '',
      nation: props.organization.nation || '',
      bank_account: props.organization.bank_account || '',
      bank_account_number: props.organization.bank_account_number || '',
      bank_account_name: props.organization.bank_account_name || '',
    }
  } else {
    resetForm()
  }
  selectedLogoFile.value = null
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  // If there's a selected logo file that hasn't been uploaded yet, upload it first
  if (isEdit.value && props.organization && selectedLogoFile.value && !isUploadingLogo.value) {
    await uploadLogo()
    // If upload failed, stop submission
    if (errors.value.logo_file) {
      return
    }
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    let result: Organization

    if (isEdit.value && props.organization) {
      // When editing, include all fields
      const data: OrganizationCreate = {
        brand_name: form.value.brand_name.trim(),
        name: form.value.name.trim(),
        address: form.value.address?.trim() || undefined,
        tax_id: form.value.tax_id?.trim() || undefined,
        logo_url: form.value.logo_url?.trim() || undefined,
        city: form.value.city?.trim() || undefined,
        nation: form.value.nation?.trim() || undefined,
        bank_account: form.value.bank_account?.trim() || undefined,
        bank_account_number: form.value.bank_account_number?.trim() || undefined,
        bank_account_name: form.value.bank_account_name?.trim() || undefined,
      }
      const updateData: OrganizationUpdate = {}
      if (data.brand_name !== props.organization.brand_name) updateData.brand_name = data.brand_name
      if (data.name !== props.organization.name) updateData.name = data.name
      if (data.address !== (props.organization.address || '')) updateData.address = data.address
      if (data.tax_id !== (props.organization.tax_id || '')) updateData.tax_id = data.tax_id
      if (data.logo_url !== (props.organization.logo_url || '')) updateData.logo_url = data.logo_url
      if (data.city !== (props.organization.city || '')) updateData.city = data.city
      if (data.nation !== (props.organization.nation || '')) updateData.nation = data.nation
      if (data.bank_account !== (props.organization.bank_account || '')) updateData.bank_account = data.bank_account
      if (data.bank_account_number !== (props.organization.bank_account_number || '')) updateData.bank_account_number = data.bank_account_number
      if (data.bank_account_name !== (props.organization.bank_account_name || '')) updateData.bank_account_name = data.bank_account_name

      result = await updateOrganization(props.organization.id, updateData)
    } else {
      // When creating, only send Brand Name and Organization Name
      const data: OrganizationCreate = {
        brand_name: form.value.brand_name.trim(),
        name: form.value.name.trim(),
      }
      result = await createOrganization(data)
    }

    emit('success', result)
    resetForm()
  } catch (err: any) {
    apiError.value = err.response?.data?.detail || 'An error occurred while saving the organization'
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
  (isOpen) => {
    if (isOpen) {
      loadOrganizationData()
    }
  },
  { immediate: true }
)

watch(
  () => props.organization,
  () => {
    if (props.isOpen) {
      loadOrganizationData()
    }
  }
)
</script>

