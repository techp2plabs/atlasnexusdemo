<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="isEdit ? 'Edit MCN Partner' : 'Create MCN Partner'"
    size="2xl"
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
      <div>
        <div class="mb-1.5 flex items-center gap-2">
          <label
            :for="organizationSelectId"
            class="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Organization
            <span class="text-error-500">*</span>
          </label>
        </div>
        <Select
          :id="organizationSelectId"
          v-model="form.organization_id"
          :options="organizationOptions"
          placeholder="Select an organization"
          :required="true"
          :error="!!errors.organization_id"
          :errorMessage="errors.organization_id"
          :disabled="isSubmitting || isOrganizationDisabled"
          @blur="validateField('organization_id')"
        />
      </div>

      <!-- Partner Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
          Partner Type <span class="text-error-500">*</span>
        </label>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            v-for="type in partnerTypes"
            :key="type.value"
            type="button"
            @click="form.partner_type = type.value"
            :class="[
              'relative flex flex-col items-center rounded-lg border-2 p-4 text-center transition-all',
              form.partner_type === type.value
                ? 'border-brand-600 bg-accent dark:bg-brand-900/20'
                : 'border-border bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
            ]"
          >
            <span class="text-2xl mb-2">{{ type.icon }}</span>
            <span :class="['text-sm font-medium', form.partner_type === type.value ? 'text-accent-foreground dark:text-brand-300' : 'text-foreground dark:text-white']">
              {{ type.label }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ type.description }}</span>
          </button>
        </div>
        <p v-if="errors.partner_type" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.partner_type }}</p>
      </div>

      <!-- Partner Name -->
      <Input
        v-model="form.name"
        label="Partner Name"
        placeholder="Enter partner name"
        required
        :error="!!errors.name"
        :errorMessage="errors.name"
        :disabled="isSubmitting"
        @blur="validateField('name')"
      />

      <!-- Legal Name -->
      <Input
        v-model="form.alias"
        label="Legal Name"
        placeholder="Enter legal name (optional)"
        :error="!!errors.alias"
        :errorMessage="errors.alias"
        :disabled="isSubmitting"
        @blur="validateField('alias')"
      />


      <!-- Description -->
      <Textarea
        v-model="form.description"
        label="Description"
        placeholder="Enter MCN partner description (optional)"
        :rows="3"
        :error="!!errors.description"
        :errorMessage="errors.description"
        :disabled="isSubmitting"
        @blur="validateField('description')"
      />

      <!-- Partner Information Section -->
      <div class="border-t border-border dark:border-gray-700 pt-4 space-y-4">
        <h3 class="text-sm font-semibold text-foreground dark:text-white">Partner Information</h3>

        <!-- Company & Director -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.website_url"
              label="Website URL"
              type="url"
              placeholder="https://example.com"
              :error="!!errors.website_url"
              :errorMessage="errors.website_url"
              :disabled="isSubmitting"
              @blur="validateField('website_url')"
            />
            <Input
              v-model="form.director"
              label="Director"
              placeholder="Enter director name"
              :error="!!errors.director"
              :errorMessage="errors.director"
              :disabled="isSubmitting"
              @blur="validateField('director')"
            />
            <Input
              v-model="form.international_company_name"
              label="International Company Name"
              placeholder="Enter international company name"
              :error="!!errors.international_company_name"
              :errorMessage="errors.international_company_name"
              :disabled="isSubmitting"
              @blur="validateField('international_company_name')"
            />
            <Input
              v-model="form.tax_id"
              label="Tax Identification Number"
              placeholder="Enter tax identification number"
              :error="!!errors.tax_id"
              :errorMessage="errors.tax_id"
              :disabled="isSubmitting"
              @blur="validateField('tax_id')"
            />
          </div>

          <!-- Document uploads -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Director ID Upload -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Director ID (Upload File)
              </label>
              <div class="space-y-2">
                <div v-if="form.director_id_file_url" class="text-xs text-gray-600 break-all dark:text-gray-400">
                  Current file:
                  <a
                    :href="form.director_id_file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent-foreground hover:underline dark:text-brand-300"
                  >
                    {{ form.director_id_file_url }}
                  </a>
                </div>
                <input
                  ref="directorIdInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  class="hidden"
                  @change="handleDirectorIdSelect"
                />
                <button
                  type="button"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  :disabled="isSubmitting || isUploadingDirectorId || !isEdit"
                  @click="isEdit ? directorIdInput?.click() : null"
                >
                  <span v-if="isUploadingDirectorId">Uploading...</span>
                  <span v-else>{{ form.director_id_file_url ? 'Change File' : 'Upload File' }}</span>
                </button>
                <p v-if="directorIdError" class="mt-1.5 text-theme-xs text-error-500">
                  {{ directorIdError }}
                </p>
                <p v-else-if="isEdit" class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
                  Accepted types: JPEG, PNG, WebP, PDF. Max 10MB.
                </p>
                <p v-else class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
                  Save the MCN first, then upload the Director ID document.
                </p>
              </div>
            </div>

            <!-- Tax ID File Upload -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Identification Number File (Upload File)
              </label>
              <div class="space-y-2">
                <div v-if="form.tax_id_file_url" class="text-xs text-gray-600 break-all dark:text-gray-400">
                  Current file:
                  <a
                    :href="form.tax_id_file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent-foreground hover:underline dark:text-brand-300"
                  >
                    {{ form.tax_id_file_url }}
                  </a>
                </div>
                <input
                  ref="taxIdInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  class="hidden"
                  @change="handleTaxIdSelect"
                />
                <button
                  type="button"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  :disabled="isSubmitting || isUploadingTaxId || !isEdit"
                  @click="isEdit ? taxIdInput?.click() : null"
                >
                  <span v-if="isUploadingTaxId">Uploading...</span>
                  <span v-else>{{ form.tax_id_file_url ? 'Change File' : 'Upload File' }}</span>
                </button>
                <p v-if="taxIdError" class="mt-1.5 text-theme-xs text-error-500">
                  {{ taxIdError }}
                </p>
                <p v-else-if="isEdit" class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
                  Accepted types: JPEG, PNG, WebP, PDF. Max 10MB.
                </p>
                <p v-else class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
                  Save the MCN first, then upload the Tax ID document.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Address -->
        <div class="space-y-4">
          <Textarea
            v-model="form.address"
            label="Company Address"
            placeholder="Enter street address"
            :rows="2"
            :error="!!errors.address"
            :errorMessage="errors.address"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Country (first) -->
            <Select
              v-model="form.country"
              label="Country"
              :options="countryOptions"
              placeholder="Select country"
              :error="!!errors.country"
              :errorMessage="errors.country"
              :disabled="isSubmitting"
              @blur="validateField('country')"
            />

            <!-- City (second): dropdown for Indonesia with manual option, input for others -->
            <template v-if="isIndonesia">
              <div>
                <label
                  :for="cityInputId"
                  class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  City
                </label>
                <input
                  :id="cityInputId"
                  v-model="form.city"
                  type="text"
                  list="indonesia-cities-datalist"
                  placeholder="Select or type city"
                  :disabled="isSubmitting"
                  :class="[
                    'h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
                    errors.city
                      ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800'
                      : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800',
                    isSubmitting ? 'disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15' : '',
                  ]"
                  @blur="validateField('city')"
                />
                <datalist id="indonesia-cities-datalist">
                  <option
                    v-for="city in INDONESIA_CITIES"
                    :key="city"
                    :value="city"
                  />
                </datalist>
                <p v-if="errors.city" class="mt-1.5 text-theme-xs text-error-500">{{ errors.city }}</p>
              </div>
            </template>
            <Input
              v-else
              v-model="form.city"
              label="City"
              placeholder="Enter city"
              :error="!!errors.city"
              :errorMessage="errors.city"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />
          </div>
        </div>

        <!-- Bank Information -->
        <div class="mt-4">
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Bank Information
          </h4>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.bank_name"
              label="Bank name"
              placeholder="Enter bank name"
              :error="!!errors.bank_name"
              :errorMessage="errors.bank_name"
              :disabled="isSubmitting"
              @blur="validateField('bank_name')"
            />
            <Input
              v-model="form.bank_account_name"
              label="Account Name"
              placeholder="Enter account holder name"
              :error="!!errors.bank_account_name"
              :errorMessage="errors.bank_account_name"
              :disabled="isSubmitting"
              @blur="validateField('bank_account_name')"
            />
            <Input
              v-model="form.bank_account_number"
              label="Account number"
              placeholder="Enter account number"
              :error="!!errors.bank_account_number"
              :errorMessage="errors.bank_account_number"
              :disabled="isSubmitting"
              @blur="validateField('bank_account_number')"
            />
            <Input
              v-model="form.bank_swift_code"
              label="SWIFT CODE of the Bank"
              placeholder="Enter SWIFT/BIC code"
              :error="!!errors.bank_swift_code"
              :errorMessage="errors.bank_swift_code"
              :disabled="isSubmitting"
              @blur="validateField('bank_swift_code')"
            />
            <Input
              v-model="form.bank_country"
              label="Country of the Bank"
              placeholder="Enter bank country"
              :error="!!errors.bank_country"
              :errorMessage="errors.bank_country"
              :disabled="isSubmitting"
              @blur="validateField('bank_country')"
            />
            <Input
              v-model="form.bank_branch"
              label="Bank Branch"
              placeholder="Enter bank branch"
              :error="!!errors.bank_branch"
              :errorMessage="errors.bank_branch"
              :disabled="isSubmitting"
              @blur="validateField('bank_branch')"
            />
            <Textarea
              v-model="form.bank_address"
              label="Address of the Bank"
              placeholder="Enter bank address"
              :rows="2"
              :error="!!errors.bank_address"
              :errorMessage="errors.bank_address"
              :disabled="isSubmitting"
              @blur="validateField('bank_address')"
            />
          </div>
        </div>

        <!-- PICs -->
        <div class="mt-4">
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            PIC Partner
          </h4>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.pic_partner_name"
              label="PIC Partner Name"
              placeholder="Enter PIC partner name"
              :error="!!errors.pic_partner_name"
              :errorMessage="errors.pic_partner_name"
              :disabled="isSubmitting"
              @blur="validateField('pic_partner_name')"
            />
            <Input
              v-model="form.pic_partner_phone"
              label="PIC Partner Phone"
              placeholder="Enter PIC partner phone"
              :error="!!errors.pic_partner_phone"
              :errorMessage="errors.pic_partner_phone"
              :disabled="isSubmitting"
              @blur="validateField('pic_partner_phone')"
            />
            <Input
              v-model="form.pic_partner_email"
              label="PIC Partner Email"
              type="email"
              placeholder="partner@example.com"
              :error="!!errors.pic_partner_email"
              :errorMessage="errors.pic_partner_email"
              :disabled="isSubmitting"
              @blur="validateField('pic_partner_email')"
            />
          </div>
        </div>

        <div class="mt-4">
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            PIC Legal
          </h4>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              v-model="form.pic_legal_name"
              label="PIC Legal Name"
              placeholder="Enter PIC legal name"
              :error="!!errors.pic_legal_name"
              :errorMessage="errors.pic_legal_name"
              :disabled="isSubmitting"
              @blur="validateField('pic_legal_name')"
            />
            <Input
              v-model="form.pic_legal_phone"
              label="PIC Legal Phone"
              placeholder="Enter PIC legal phone"
              :error="!!errors.pic_legal_phone"
              :errorMessage="errors.pic_legal_phone"
              :disabled="isSubmitting"
              @blur="validateField('pic_legal_phone')"
            />
            <Input
              v-model="form.pic_legal_email"
              label="PIC Legal Email"
              type="email"
              placeholder="legal@example.com"
              :error="!!errors.pic_legal_email"
              :errorMessage="errors.pic_legal_email"
              :disabled="isSubmitting"
              @blur="validateField('pic_legal_email')"
            />
          </div>
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
import Select from '~/components/forms/Select.vue'
import type { MCN, MCNPartnerType } from '~/types/mcn'
import type { MCNCreate, MCNUpdate } from '~/composables/useMcns'
import { getPartnerTypeLabel } from '~/composables/useMcns'
import type { SelectOption } from '~/components/forms/Select.vue'

interface Props {
  isOpen: boolean
  mcn?: MCN | null
  prefillOrganizationId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [mcn: MCN]
}>()

const authStore = useAuthStore()
const { createMcn, updateMcn, uploadMcnDocument } = useMcns()
const { organizations, fetchOrganizations } = useOrganizations()

const isEdit = computed(() => !!props.mcn)

const form = ref<MCNCreate>({
  organization_id: '',
  name: '',
  partner_type: 'inhouse',
  alias: '',
  description: '',
  website_url: '',
  address: '',
  city: '',
  country: 'Indonesia',
  tax_id: '',
  director: '',
  director_id_file_url: '',
  international_company_name: '',
  tax_id_file_url: '',
  bank_name: '',
  bank_account_name: '',
  bank_swift_code: '',
  bank_address: '',
  bank_country: '',
  bank_branch: '',
  bank_account_number: '',
  pic_partner_name: '',
  pic_partner_phone: '',
  pic_partner_email: '',
  pic_legal_name: '',
  pic_legal_phone: '',
  pic_legal_email: '',
})

const partnerTypes = [
  {
    value: 'inhouse' as MCNPartnerType,
    label: 'InHouse',
    icon: '🏢',
    description: 'Internal organization partner'
  },
  {
    value: 'agency' as MCNPartnerType,
    label: 'Agency',
    icon: '📊',
    description: 'Marketing or management agency'
  },
  {
    value: 'talent_management' as MCNPartnerType,
    label: 'Talent Management',
    icon: '⭐',
    description: 'Talent representation and management'
  }
]

// Predefined countries with flags (default Indonesia)
const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'Indonesia', label: '🇮🇩 Indonesia' },
  { value: 'Malaysia', label: '🇲🇾 Malaysia' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Philippines', label: '🇵🇭 Philippines' },
  { value: 'Thailand', label: '🇹🇭 Thailand' },
  { value: 'Vietnam', label: '🇻🇳 Vietnam' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'South Korea', label: '🇰🇷 South Korea' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'Other', label: '🌐 Other' },
]

// Predefined Indonesian cities (user can also type a city not in the list)
const INDONESIA_CITIES = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Makassar',
  'Palembang',
  'Batam',
  'Pekanbaru',
  'Bogor',
  'Depok',
  'Tangerang',
  'South Tangerang',
  'Bekasi',
  'Malang',
  'Denpasar',
  'Samarinda',
  'Balikpapan',
  'Bandar Lampung',
  'Jambi',
  'Manado',
  'Mataram',
  'Cirebon',
  'Surakarta',
  'Pontianak',
  'Yogyakarta',
  'Banjarmasin',
  'Manokwari',
  'Jayapura',
]

const countryOptions = COUNTRY_OPTIONS
const isIndonesia = computed(() => form.value.country === 'Indonesia')
const cityInputId = computed(() => `mcn-city-input-${Math.random().toString(36).substr(2, 9)}`)

const errors = ref<Record<string, string>>({})
const apiError = ref<string | null>(null)
const isSubmitting = ref(false)
const organizationSelectId = computed(() => `mcn-org-select-${Math.random().toString(36).substr(2, 9)}`)

const isUploadingDirectorId = ref(false)
const isUploadingTaxId = ref(false)
const directorIdError = ref('')
const taxIdError = ref('')
const directorIdInput = ref<HTMLInputElement | null>(null)
const taxIdInput = ref<HTMLInputElement | null>(null)

// Organization dropdown logic
const isOrganizationDisabled = computed(() => {
  const role = authStore.user?.role
  return role === 'org_owner' || role === 'org_admin'
})

const organizationOptions = computed<SelectOption[]>(() => {
  const formatLabel = (org: { brand_name?: string; name: string }) =>
    org.brand_name ? `${org.brand_name} - ${org.name}` : org.name
  if (isOrganizationDisabled.value && authStore.user?.organization_id) {
    // For org_owner/org_admin, show only their organization
    const org = organizations.value.find(org => org.id === authStore.user?.organization_id)
    if (org) {
      return [{ value: org.id, label: formatLabel(org) }]
    }
    return []
  }
  // For atlas_superadmin/atlas_admin, show all organizations
  return organizations.value.map(org => ({
    value: org.id,
    label: formatLabel(org),
  }))
})

const isFormValid = computed(() => {
  const hasRequiredFields = (
    form.value.organization_id &&
    form.value.name.trim().length >= 2 &&
    form.value.partner_type
  )
  return hasRequiredFields && Object.keys(errors.value).length === 0
})

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
    case 'partner_type':
      if (!value || !['inhouse', 'agency', 'talent_management'].includes(value.toString())) {
        errors.value.partner_type = 'Partner type is required'
      } else {
        delete errors.value.partner_type
      }
      break
    case 'name':
      if (!value || value.toString().trim().length < 2) {
        errors.value.name = 'Partner name must be at least 2 characters'
      } else if (value.toString().trim().length > 255) {
        errors.value.name = 'Partner name must be less than 255 characters'
      } else {
        delete errors.value.name
      }
      break
    case 'alias':
      if (value && value.toString().trim().length > 255) {
        errors.value.alias = 'Alias must be less than 255 characters'
      } else {
        delete errors.value.alias
      }
      break
    case 'description':
      if (value && value.toString().length > 1000) {
        errors.value.description = 'Description must be less than 1000 characters'
      } else {
        delete errors.value.description
      }
      break
    case 'website_url':
      if (value && value.toString().trim()) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
        if (!urlPattern.test(value.toString().trim())) {
          errors.value.website_url = 'Please enter a valid URL'
        } else {
          delete errors.value.website_url
        }
      } else {
        delete errors.value.website_url
      }
      break
    case 'pic_partner_email':
    case 'pic_legal_email':
      if (value && value.toString().trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(value.toString().trim())) {
          errors.value[fieldName] = 'Please enter a valid email address'
        } else {
          delete errors.value[fieldName]
        }
      } else {
        delete errors.value[fieldName]
      }
      break
    case 'director':
    case 'international_company_name':
    case 'address':
    case 'city':
    case 'country':
    case 'tax_id':
    case 'bank_name':
    case 'bank_account_name':
    case 'bank_account_number':
    case 'bank_swift_code':
    case 'bank_address':
    case 'bank_country':
    case 'bank_branch':
    case 'pic_partner_name':
    case 'pic_partner_phone':
    case 'pic_legal_name':
    case 'pic_legal_phone':
      // Optional fields – clear any existing error
      delete errors.value[fieldName]
      break
  }
}

const validateUploadFile = (file: File): string | null => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF.'
  }
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return 'File size must be less than 10MB.'
  }
  return null
}

const handleDirectorIdSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !props.mcn) return

  const error = validateUploadFile(file)
  if (error) {
    directorIdError.value = error
    return
  }

  directorIdError.value = ''
  isUploadingDirectorId.value = true

  try {
    const updated = await uploadMcnDocument(props.mcn.id, 'director_id', file)
    form.value.director_id_file_url = updated.director_id_file_url || ''
  } catch (err: any) {
    directorIdError.value = err.response?.data?.detail || 'Failed to upload Director ID file'
  } finally {
    isUploadingDirectorId.value = false
    if (directorIdInput.value) {
      directorIdInput.value.value = ''
    }
  }
}

const handleTaxIdSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !props.mcn) return

  const error = validateUploadFile(file)
  if (error) {
    taxIdError.value = error
    return
  }

  taxIdError.value = ''
  isUploadingTaxId.value = true

  try {
    const updated = await uploadMcnDocument(props.mcn.id, 'tax_id', file)
    form.value.tax_id_file_url = updated.tax_id_file_url || ''
  } catch (err: any) {
    taxIdError.value = err.response?.data?.detail || 'Failed to upload Tax ID file'
  } finally {
    isUploadingTaxId.value = false
    if (taxIdInput.value) {
      taxIdInput.value.value = ''
    }
  }
}

const validateForm = () => {
  errors.value = {}
  validateField('organization_id')
  validateField('partner_type')
  validateField('name')
  validateField('alias')
  validateField('description')
  validateField('website_url')
  validateField('address')
  validateField('city')
  validateField('country')
  validateField('tax_id')
  validateField('director')
  validateField('international_company_name')
  validateField('bank_name')
  validateField('bank_account_name')
  validateField('bank_account_number')
  validateField('bank_swift_code')
  validateField('bank_address')
  validateField('bank_country')
  validateField('bank_branch')
  validateField('pic_partner_name')
  validateField('pic_partner_phone')
  validateField('pic_partner_email')
  validateField('pic_legal_name')
  validateField('pic_legal_phone')
  validateField('pic_legal_email')
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  form.value = {
    organization_id: '',
    name: '',
    partner_type: 'inhouse',
    alias: '',
    description: '',
    website_url: '',
    address: '',
    city: '',
    country: 'Indonesia',
    tax_id: '',
    director: '',
    director_id_file_url: '',
    international_company_name: '',
    tax_id_file_url: '',
    bank_name: '',
    bank_account_name: '',
    bank_swift_code: '',
    bank_address: '',
    bank_country: '',
    bank_branch: '',
    bank_account_number: '',
    pic_partner_name: '',
    pic_partner_phone: '',
    pic_partner_email: '',
    pic_legal_name: '',
    pic_legal_phone: '',
    pic_legal_email: '',
  }
  errors.value = {}
  apiError.value = null
}

const loadMcnData = () => {
  if (props.mcn) {
    form.value = {
      organization_id: props.mcn.organization_id,
      name: props.mcn.name || '',
      partner_type: props.mcn.partner_type || 'inhouse',
      alias: props.mcn.alias || '',
      description: props.mcn.description || '',
      website_url: props.mcn.website_url || '',
      address: props.mcn.address || '',
      city: props.mcn.city || '',
      country: props.mcn.country || 'Indonesia',
      tax_id: props.mcn.tax_id || '',
      director: props.mcn.director || '',
      director_id_file_url: props.mcn.director_id_file_url || '',
      international_company_name: props.mcn.international_company_name || '',
      tax_id_file_url: props.mcn.tax_id_file_url || '',
      bank_name: props.mcn.bank_name || '',
      bank_account_name: props.mcn.bank_account_name || '',
      bank_swift_code: props.mcn.bank_swift_code || '',
      bank_address: props.mcn.bank_address || '',
      bank_country: props.mcn.bank_country || '',
      bank_branch: props.mcn.bank_branch || '',
      bank_account_number: props.mcn.bank_account_number || '',
      pic_partner_name: props.mcn.pic_partner_name || '',
      pic_partner_phone: props.mcn.pic_partner_phone || '',
      pic_partner_email: props.mcn.pic_partner_email || '',
      pic_legal_name: props.mcn.pic_legal_name || '',
      pic_legal_phone: props.mcn.pic_legal_phone || '',
      pic_legal_email: props.mcn.pic_legal_email || '',
    }
  } else {
    resetForm()
    // Pre-fill organization if provided
    if (props.prefillOrganizationId) {
      form.value.organization_id = props.prefillOrganizationId
    } else if (isOrganizationDisabled.value && authStore.user?.organization_id) {
      // Auto-select organization for org_owner/org_admin
      form.value.organization_id = authStore.user.organization_id
    }
  }
}


const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  apiError.value = null

  try {
    const data: MCNCreate = {
      organization_id: form.value.organization_id,
      name: form.value.name.trim(),
      partner_type: form.value.partner_type,
      alias: form.value.alias?.trim() || undefined,
      description: form.value.description?.trim() || undefined,
      website_url: form.value.website_url?.trim() || undefined,
      address: form.value.address?.trim() || undefined,
      city: form.value.city?.trim() || undefined,
      country: form.value.country?.trim() || undefined,
      tax_id: form.value.tax_id?.trim() || undefined,
      director: form.value.director?.trim() || undefined,
      director_id_file_url: form.value.director_id_file_url?.trim() || undefined,
      international_company_name: form.value.international_company_name?.trim() || undefined,
      tax_id_file_url: form.value.tax_id_file_url?.trim() || undefined,
      bank_name: form.value.bank_name?.trim() || undefined,
      bank_account_name: form.value.bank_account_name?.trim() || undefined,
      bank_swift_code: form.value.bank_swift_code?.trim() || undefined,
      bank_address: form.value.bank_address?.trim() || undefined,
      bank_country: form.value.bank_country?.trim() || undefined,
      bank_branch: form.value.bank_branch?.trim() || undefined,
      bank_account_number: form.value.bank_account_number?.trim() || undefined,
      pic_partner_name: form.value.pic_partner_name?.trim() || undefined,
      pic_partner_phone: form.value.pic_partner_phone?.trim() || undefined,
      pic_partner_email: form.value.pic_partner_email?.trim() || undefined,
      pic_legal_name: form.value.pic_legal_name?.trim() || undefined,
      pic_legal_phone: form.value.pic_legal_phone?.trim() || undefined,
      pic_legal_email: form.value.pic_legal_email?.trim() || undefined,
    }

    let result: MCN

    if (isEdit.value && props.mcn) {
      const updateData: MCNUpdate = {}
      if (data.name !== props.mcn.name) updateData.name = data.name
      if (data.partner_type !== props.mcn.partner_type) updateData.partner_type = data.partner_type
      if (data.alias !== (props.mcn.alias || '')) updateData.alias = data.alias
      if (data.description !== (props.mcn.description || '')) updateData.description = data.description
      if (data.website_url !== (props.mcn.website_url || '')) updateData.website_url = data.website_url
      if (data.address !== (props.mcn.address || '')) updateData.address = data.address
      if (data.city !== (props.mcn.city || '')) updateData.city = data.city
      if (data.country !== (props.mcn.country || '')) updateData.country = data.country
      if (data.tax_id !== (props.mcn.tax_id || '')) updateData.tax_id = data.tax_id
      if (data.director !== (props.mcn.director || '')) updateData.director = data.director
      if (data.director_id_file_url !== (props.mcn.director_id_file_url || '')) updateData.director_id_file_url = data.director_id_file_url
      if (data.international_company_name !== (props.mcn.international_company_name || '')) updateData.international_company_name = data.international_company_name
      if (data.tax_id_file_url !== (props.mcn.tax_id_file_url || '')) updateData.tax_id_file_url = data.tax_id_file_url
      if (data.bank_name !== (props.mcn.bank_name || '')) updateData.bank_name = data.bank_name
      if (data.bank_account_name !== (props.mcn.bank_account_name || '')) updateData.bank_account_name = data.bank_account_name
      if (data.bank_swift_code !== (props.mcn.bank_swift_code || '')) updateData.bank_swift_code = data.bank_swift_code
      if (data.bank_address !== (props.mcn.bank_address || '')) updateData.bank_address = data.bank_address
      if (data.bank_country !== (props.mcn.bank_country || '')) updateData.bank_country = data.bank_country
      if (data.bank_branch !== (props.mcn.bank_branch || '')) updateData.bank_branch = data.bank_branch
      if (data.bank_account_number !== (props.mcn.bank_account_number || '')) updateData.bank_account_number = data.bank_account_number
      if (data.pic_partner_name !== (props.mcn.pic_partner_name || '')) updateData.pic_partner_name = data.pic_partner_name
      if (data.pic_partner_phone !== (props.mcn.pic_partner_phone || '')) updateData.pic_partner_phone = data.pic_partner_phone
      if (data.pic_partner_email !== (props.mcn.pic_partner_email || '')) updateData.pic_partner_email = data.pic_partner_email
      if (data.pic_legal_name !== (props.mcn.pic_legal_name || '')) updateData.pic_legal_name = data.pic_legal_name
      if (data.pic_legal_phone !== (props.mcn.pic_legal_phone || '')) updateData.pic_legal_phone = data.pic_legal_phone
      if (data.pic_legal_email !== (props.mcn.pic_legal_email || '')) updateData.pic_legal_email = data.pic_legal_email

      result = await updateMcn(props.mcn.id, updateData)
    } else {
      result = await createMcn(data)
    }

    emit('success', result)
    resetForm()
  } catch (err: any) {
    handleApiError(err)
  } finally {
    isSubmitting.value = false
  }
}

// Helper function to parse and map API errors to form fields
const handleApiError = (err: any) => {
  const errorDetail = err.response?.data?.detail || ''
  const statusCode = err.response?.status
  
  // Clear previous errors
  errors.value = {}
  apiError.value = null
  
  // Map common backend errors to specific fields
  if (typeof errorDetail === 'string') {
    // Partner type errors
    if (errorDetail.toLowerCase().includes('partner type') || errorDetail.toLowerCase().includes('partner_type')) {
      if (errorDetail.toLowerCase().includes('invalid')) {
        errors.value.partner_type = 'Please select a valid partner type'
      } else {
        errors.value.partner_type = errorDetail
      }
    }
    // Organization errors
    else if (errorDetail.toLowerCase().includes('organization') || errorDetail.toLowerCase().includes('organization_id')) {
      if (errorDetail.toLowerCase().includes('not found')) {
        errors.value.organization_id = 'Selected organization does not exist'
      } else if (errorDetail.toLowerCase().includes('permission') || errorDetail.toLowerCase().includes('access')) {
        errors.value.organization_id = 'You do not have permission to create MCN Partners for this organization'
      } else {
        errors.value.organization_id = errorDetail
      }
    }
    // Name errors
    else if (errorDetail.toLowerCase().includes('name')) {
      errors.value.name = errorDetail
    }
    // Generic error for string messages
    else {
      apiError.value = errorDetail || 'An error occurred while saving the MCN Partner. Please try again.'
    }
  } 
  // Handle Pydantic validation errors (422 status with array of errors)
  else if (statusCode === 422 && Array.isArray(errorDetail)) {
    errorDetail.forEach((validationError: any) => {
      const field = validationError.loc?.[validationError.loc.length - 1]
      if (field && field !== 'body') {
        errors.value[field] = validationError.msg || 'Invalid value'
      }
    })
    apiError.value = 'Please correct the errors below'
  }
  // Handle object error responses
  else if (typeof errorDetail === 'object' && errorDetail !== null) {
    // Handle object error responses (e.g., Pydantic validation errors)
    Object.keys(errorDetail).forEach((key) => {
      // Map backend field names to form field names
      const fieldMap: Record<string, string> = {
        'organization_id': 'organization_id',
        'partner_type': 'partner_type',
        'name': 'name',
        'alias': 'alias',
        'description': 'description',
        'website_url': 'website_url',
        'pic_contact_name': 'pic_contact_name',
        'pic_contact_email': 'pic_contact_email',
        'pic_contact_phone': 'pic_contact_phone',
        'address': 'address',
        'city': 'city',
        'country': 'country',
        'tax_id': 'tax_id'
      }
      
      const fieldName = fieldMap[key] || key
      if (fieldName && form.value.hasOwnProperty(fieldName)) {
        errors.value[fieldName] = Array.isArray(errorDetail[key]) 
          ? errorDetail[key][0] 
          : String(errorDetail[key])
      }
    })
    apiError.value = 'Please correct the errors below'
  } 
  // Handle status code-based errors
  else {
    if (statusCode === 403) {
      apiError.value = 'You do not have permission to perform this action'
    } else if (statusCode === 404) {
      apiError.value = 'The requested resource was not found'
    } else {
      apiError.value = 'An error occurred while saving the MCN Partner. Please try again.'
    }
  }
  
  // Scroll to first error field
  if (Object.keys(errors.value).length > 0) {
    const firstErrorField = Object.keys(errors.value)[0]
    const fieldElement = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`)
    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(fieldElement as HTMLElement).focus()
    }
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

// Fetch organizations when modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      loadMcnData()
      // Fetch organizations
      // For admins: fetch all organizations for dropdown
      // For org_owner/org_admin: fetch to get their organization name
      await fetchOrganizations()
    }
  },
  { immediate: true }
)

watch(
  () => props.mcn,
  () => {
    if (props.isOpen) {
      loadMcnData()
    }
  }
)

watch(
  () => props.prefillOrganizationId,
  () => {
    if (props.isOpen && !isEdit.value) {
      if (props.prefillOrganizationId) {
        form.value.organization_id = props.prefillOrganizationId
      }
    }
  }
)
</script>

