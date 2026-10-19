<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="isViewMode ? 'Contract Details' : (contract ? 'Edit Contract' : 'Create Contract')"
    size="lg"
  >
    <!-- View Mode -->
    <div v-if="isViewMode" class="py-4">
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Contract Number</dt>
            <dd class="text-sm font-mono font-medium text-foreground dark:text-white">
              {{ contract?.contract_number || '—' }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Entity</dt>
            <dd class="text-sm font-medium text-foreground dark:text-white">{{ contract?.entity_name || '—' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Type</dt>
            <dd class="text-sm font-medium text-foreground dark:text-white">{{ formatContractType(contract?.contract_type || '') }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Revenue Share</dt>
            <dd class="text-right">
              <div class="text-sm font-semibold text-accent-foreground dark:text-brand-400">
                {{ contract?.revenue_share_pct }}% to {{ getReceivingPartyLabel() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ (100 - (contract?.revenue_share_pct || 0)).toFixed(2) }}% to {{ getParentLabel() }}
              </div>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Start Date</dt>
            <dd class="text-sm font-medium text-foreground dark:text-white">{{ formatDisplayDate(contract?.start_date || '') }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">End Date</dt>
            <dd class="text-sm font-medium text-foreground dark:text-white">{{ contract?.end_date ? formatDisplayDate(contract.end_date) : 'Open-ended' }}</dd>
          </div>
          <div v-if="contract?.current_revenue_share_pct !== undefined && contract?.current_revenue_share_pct !== contract?.revenue_share_pct" class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Current Rate</dt>
            <dd class="text-sm font-semibold text-accent-foreground dark:text-brand-400">
              {{ contract?.current_revenue_share_pct }}%
              <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">(base: {{ contract?.revenue_share_pct }}%)</span>
            </dd>
          </div>
          <div v-if="contract?.upcoming_terms && contract.upcoming_terms.length > 0" class="col-span-full">
            <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Upcoming Changes</dt>
            <dd>
              <div v-for="term in contract.upcoming_terms" :key="term.id" class="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1.5 mb-1">
                <span class="text-blue-600 dark:text-blue-400">📅</span>
                <span class="text-blue-700 dark:text-blue-300">{{ term.revenue_share_pct }}% from {{ formatDisplayDate(term.effective_date) }}</span>
              </div>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-gray-500 dark:text-gray-400">Status</dt>
            <dd>
              <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getStatusColor(contract?.status || '')]">
                {{ formatStatus(contract?.status || '') }}
              </span>
            </dd>
          </div>
          <div v-if="contract?.notes" class="pt-3 border-t border-border dark:border-gray-700">
            <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</dt>
            <dd class="text-sm text-foreground dark:text-white whitespace-pre-wrap">{{ contract.notes }}</dd>
          </div>
        </dl>
      </div>

      <!-- Revenue Simulator (View Mode) -->
      <div class="mt-5" v-if="contract?.id">
        <RevenuePreview :contract-id="contract.id" :initial-amount="1000" />
      </div>


    </div>

    <!-- Edit/Create Mode -->
    <form v-else @submit.prevent="handleSubmit" class="py-4 space-y-6">
      <!-- Contract Type Selection (only for new contracts) -->
      <div v-if="!contract">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contract Type <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            v-for="type in contractTypes"
            :key="type.value"
            type="button"
            @click="form.contractType = type.value"
            :class="[
              'relative flex flex-col items-center rounded-lg border-2 p-4 text-center transition-all',
              form.contractType === type.value
                ? 'border-brand-600 bg-accent dark:bg-brand-900/20'
                : 'border-border bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
            ]"
          >
            <span class="text-2xl mb-2">{{ type.icon }}</span>
            <span :class="['text-sm font-medium', form.contractType === type.value ? 'text-accent-foreground dark:text-brand-300' : 'text-foreground dark:text-white']">
              {{ type.label }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ type.description }}</span>
          </button>
        </div>
        <p v-if="errors.contractType" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.contractType }}</p>
      </div>

      <!-- Entity Display (Read-only for edit mode) -->
      <div v-if="contract">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contract Entity
        </label>
        <div class="rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ contract.contract_type === 'platform_to_org' ? '🏢' : contract.contract_type === 'org_to_mcn' ? '📦' : '🎬' }}</span>
            <div>
              <p class="text-sm font-medium text-foreground dark:text-white">{{ contract.entity_name || '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatContractType(contract.contract_type) }}</p>
            </div>
          </div>
          <p v-if="contract.organization_name" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Organization: {{ contract.organization_name }}
          </p>
          <p v-if="contract.mcn_name" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            MCN: {{ contract.mcn_name }}
          </p>
          <p v-if="contract.channel_title" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Channel: {{ contract.channel_title }}
          </p>
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Entity cannot be changed after contract creation</p>
      </div>

      <!-- Entity Selection (only for new contracts) -->
      <div v-else-if="form.contractType">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ getEntityLabel() }} <span class="text-red-500">*</span>
        </label>
        
        <!-- Organization Selection (for platform_to_org) -->
        <select
          v-if="form.contractType === 'platform_to_org'"
          v-model="form.organizationId"
          class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          :disabled="props.lockPrefilledEntities && !!props.prefillOrganizationId"
        >
          <option value="">Select Organization</option>
          <option v-for="org in organizations" :key="org.id" :value="org.id">
            {{ org.name }}
          </option>
        </select>

        <!-- MCN Selection (for org_to_mcn) -->
        <div v-else-if="form.contractType === 'org_to_mcn'" class="space-y-3">
          <select
            v-model="form.organizationId"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="isOrganizationLocked"
            @change="handleOrganizationChange"
          >
            <option value="">Select Organization</option>
            <option v-for="org in organizations" :key="org.id" :value="org.id">
              {{ org.name }}
            </option>
          </select>
          <select
            v-model="form.mcnId"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="!form.organizationId || loadingMcns || (props.lockPrefilledEntities && !!props.prefillMcnId)"
          >
            <option value="">{{ loadingMcns ? 'Loading MCNs...' : 'Select MCN' }}</option>
            <option v-for="mcn in filteredMcns" :key="mcn.id" :value="mcn.id">
              {{ mcn.name }}
            </option>
          </select>
        </div>

        <!-- Channel Selection (for mcn_to_channel) -->
        <div v-else-if="form.contractType === 'mcn_to_channel'" class="space-y-3">
          <select
            v-model="form.organizationId"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="isOrganizationLocked"
            @change="handleOrganizationChange"
          >
            <option value="">Select Organization</option>
            <option v-for="org in organizations" :key="org.id" :value="org.id">
              {{ org.name }}
            </option>
          </select>
          <select
            v-model="form.mcnId"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="!form.organizationId || loadingMcns"
            @change="handleMcnChange"
          >
            <option value="">{{ loadingMcns ? 'Loading MCNs...' : 'Select MCN' }}</option>
            <option v-for="mcn in filteredMcns" :key="mcn.id" :value="mcn.id">
              {{ mcn.name }}
            </option>
          </select>
          <select
            v-model="form.channelId"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :disabled="!form.mcnId || loadingChannels || (props.lockPrefilledEntities && !!props.prefillChannelId)"
          >
            <option value="">{{ loadingChannels ? 'Loading Channels...' : 'Select Channel' }}</option>
            <option v-for="channel in filteredChannels" :key="channel.id" :value="channel.id">
              {{ channel.title }}
            </option>
          </select>
        </div>

        <p v-if="errors.entity" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.entity }}</p>
      </div>

      <!-- Revenue Share -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Revenue Share <span class="text-red-500">*</span>
        </label>
        
        <!-- Parent Revenue Percentage (Read-only) -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {{ getParentLabel() }} Revenue Share
          </label>
          <div class="relative">
            <input
              :value="parentRevenuePct"
              type="text"
              readonly
              class="h-10 w-full rounded-lg border border-border bg-gray-50 px-3 py-2 pr-8 text-sm text-gray-600 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Automatically calculated: {{ parentRevenuePct }}% goes to {{ getParentLabel() }}
          </p>
        </div>

        <!-- Receiving Party Revenue Percentage (Editable) -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {{ getReceivingPartyLabel() }} Revenue Share
          </label>
          <div class="relative">
            <input
              v-model.number="form.revenueSharePct"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g., 90"
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @input="handleRevenueShareInput"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Percentage of revenue retained by {{ getReceivingPartyLabel() }} (0-100)
          </p>
          <p v-if="errors.revenueSharePct" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.revenueSharePct }}</p>
        </div>

        <!-- Visual Summary -->
        <div class="mt-4 rounded-lg border border-border bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">{{ getParentLabel() }}:</span>
            <span class="font-semibold text-foreground dark:text-white">{{ parentRevenuePct }}%</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">{{ getReceivingPartyLabel() }}:</span>
            <span class="font-semibold text-accent-foreground dark:text-brand-400">{{ form.revenueSharePct || 0 }}%</span>
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div class="flex h-full">
              <div
                :style="{ width: `${parentRevenuePct}%` }"
                class="bg-gray-400 dark:bg-gray-600"
              ></div>
              <div
                :style="{ width: `${form.revenueSharePct || 0}%` }"
                class="bg-primary"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Range -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <DatePicker
            v-model="form.startDate"
            label="Start Date"
            placeholder="Select start date"
            :required="true"
            :error="!!errors.startDate"
            :error-message="errors.startDate"
            date-format="Y-m-d"
          />
        </div>
        <div>
          <DatePicker
            v-model="form.endDate"
            label="End Date"
            placeholder="Select end date (optional)"
            :min-date="form.startDate || undefined"
            :error="!!errors.endDate"
            :error-message="errors.endDate"
            help-text="Leave empty for open-ended contract"
            date-format="Y-m-d"
          />
        </div>
      </div>

      <!-- Revenue Share Change Notice (shown when editing an existing contract's revenue share) -->
      <div v-if="contract && form.revenueSharePct !== null && form.revenueSharePct !== contract.revenue_share_pct" 
           class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
        <div class="flex items-start gap-2">
          <span class="text-blue-500">ℹ️</span>
          <div class="text-xs text-blue-700 dark:text-blue-300">
            <p class="font-medium">This revenue share change will be effective from the 1st of next month.</p>
            <p class="mt-1">Current rate ({{ contract.current_revenue_share_pct ?? contract.revenue_share_pct }}%) will remain active until then.</p>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
        </label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Add any notes about this contract..."
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        ></textarea>
      </div>

      <!-- Contract File (Optional, create flow only) -->
      <div v-if="!contract">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contract File
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(optional, PDF only)</span>
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          @change="handleFileSelect"
          class="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-200 dark:file:bg-brand-900/30 dark:file:text-brand-300"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Max size 10MB • PDF only (same behavior as contract detail page).
        </p>

        <div v-if="selectedFileName" class="mt-2 text-xs text-gray-700 dark:text-gray-300">
          Selected: <span class="font-medium">{{ selectedFileName }}</span>
        </div>

        <div v-if="uploadingFile && uploadProgress > 0" class="mt-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-600 dark:text-gray-400">Uploading...</span>
            <span class="text-xs font-medium text-foreground dark:text-white">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <div v-if="fileError" class="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-900/20">
          <p class="text-xs text-red-600 dark:text-red-400">{{ fileError }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
        <p class="text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
      </div>

      <!-- Overlap Warning (shown after successful save if there are overlaps) -->
      <div v-if="overlapWarnings && overlapWarnings.length > 0" class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div class="flex items-start gap-3">
          <span class="text-yellow-500 text-lg">⚠️</span>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Overlapping Contracts Detected</h4>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {{ overlapWarnings[0] }}
            </p>
            <div v-if="overlappingContracts && overlappingContracts.length > 0" class="mt-3 space-y-2">
              <div
                v-for="overlap in overlappingContracts"
                :key="overlap.id"
                class="rounded border border-yellow-200 bg-white p-2 dark:border-yellow-700 dark:bg-gray-800"
              >
                <div class="flex justify-between text-xs">
                  <span class="text-gray-600 dark:text-gray-400">Date Range:</span>
                  <span class="font-medium text-foreground dark:text-white">
                    {{ formatDisplayDate(overlap.start_date) }} - {{ overlap.end_date ? formatDisplayDate(overlap.end_date) : 'Open-ended' }}
                  </span>
                </div>
                <div class="flex justify-between text-xs mt-1">
                  <span class="text-gray-600 dark:text-gray-400">Revenue Share:</span>
                  <span class="font-medium text-accent-foreground dark:text-brand-400">{{ overlap.revenue_share_pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          @click="handleClose"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {{ isViewMode ? 'Close' : 'Cancel' }}
        </button>
        <button
          v-if="isViewMode && canEdit"
          @click="isViewMode = false"
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Edit
        </button>
        <button
          v-if="!isViewMode"
          @click="handleSubmit"
          type="button"
          :disabled="saving"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : (contract ? 'Update Contract' : 'Create Contract') }}
        </button>
      </div>
    </template>
  </Modal>

  <!-- Contract Changes Modal -->
  <ContractChangesModal
    v-if="contract?.id"
    :isOpen="showChangesModal"
    :changes="detectedChanges"
    :onConfirm="handleConfirmUpdate"
    @close="showChangesModal = false"
  />
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import DatePicker from '~/components/forms/DatePicker.vue'
import ContractChangesModal from '~/components/modals/ContractChangesModal.vue'
import type { Contract, ContractCreate, ContractUpdate, ContractWithWarnings, OverlappingContractInfo } from '~/types/contract'
import type { Organization } from '~/types/organization'
import type { MCN } from '~/types/mcn'
import type { YouTubeChannel } from '~/types/channel'

const props = defineProps<{
  isOpen: boolean
  contract: Contract | null
  prefillOrganizationId?: string
  prefillMcnId?: string
  prefillChannelId?: string
  prefillContractType?: 'platform_to_org' | 'org_to_mcn' | 'mcn_to_channel'
  lockPrefilledEntities?: boolean
  startInEditMode?: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const { createContract, updateContract } = useContracts()
const { uploadContractFile } = useContractFiles()
const { organizations, fetchOrganizations } = useOrganizations()
const { mcns, fetchMcns, loading: loadingMcns } = useMcns()
const { channels, fetchChannels, loading: loadingChannels } = useChannels()

// State
const isViewMode = ref(false)
const saving = ref(false)
const submitError = ref<string | null>(null)
const overlapWarnings = ref<string[]>([])
const overlappingContracts = ref<OverlappingContractInfo[]>([])

const showChangesModal = ref(false)
const detectedChanges = ref<Array<{ field: string; oldValue: any; newValue: any }>>([])

// File upload state (create flow)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string | null>(null)
const uploadingFile = ref(false)
const fileError = ref<string | null>(null)
const uploadProgress = ref(0)

const form = reactive({
  contractType: '' as string,
  organizationId: '',
  mcnId: '',
  channelId: '',
  revenueSharePct: null as number | null,
  startDate: '',
  endDate: '',
  notes: '',
})

const errors = reactive({
  contractType: '',
  entity: '',
  revenueSharePct: '',
  startDate: '',
  endDate: '',
})

// Contract type options
const contractTypes = [
  {
    value: 'platform_to_org',
    label: 'Platform → Org',
    icon: '🏢',
    description: 'Platform to Organization',
  },
  {
    value: 'org_to_mcn',
    label: 'Org → MCN',
    icon: '📦',
    description: 'Organization to MCN',
  },
  {
    value: 'mcn_to_channel',
    label: 'MCN → Channel',
    icon: '🎬',
    description: 'MCN to Channel',
  },
]

// Computed
const canEdit = computed(() => {
  const role = authStore.user?.role
  return ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'].includes(role || '')
})

const isOrganizationLocked = computed(() => {
  if (props.lockPrefilledEntities && props.prefillOrganizationId) {
    return true
  }
  const role = authStore.user?.role
  return role === 'org_owner' || role === 'org_admin' || role === 'mcn_operator'
})

const filteredMcns = computed(() => {
  if (!form.organizationId) return []
  return mcns.value.filter((mcn: MCN) => mcn.organization_id === form.organizationId)
})

const filteredChannels = computed(() => {
  if (!form.mcnId) return []
  return channels.value.filter((channel: YouTubeChannel) => channel.mcn_id === form.mcnId)
})

// Computed property for parent revenue percentage
const parentRevenuePct = computed(() => {
  if (form.revenueSharePct === null || form.revenueSharePct === undefined) {
    return 100
  }
  return parseFloat(Math.max(0, Math.min(100, (100 - form.revenueSharePct)).toFixed(2)))
})


// Methods
const getEntityLabel = () => {
  if (form.contractType === 'platform_to_org') return 'Organization'
  if (form.contractType === 'org_to_mcn') return 'MCN'
  if (form.contractType === 'mcn_to_channel') return 'Channel'
  return 'Entity'
}

const getParentLabel = (): string => {
  if (props.contract) {
    if (props.contract.contract_type === 'platform_to_org') return 'Platform'
    if (props.contract.contract_type === 'org_to_mcn') return 'Organization'
    if (props.contract.contract_type === 'mcn_to_channel') return 'MCN'
  }
  if (form.contractType === 'platform_to_org') return 'Platform'
  if (form.contractType === 'org_to_mcn') return 'Organization'
  if (form.contractType === 'mcn_to_channel') return 'MCN'
  return 'Parent'
}

const getReceivingPartyLabel = (): string => {
  if (props.contract) {
    if (props.contract.contract_type === 'platform_to_org') return 'Organization'
    if (props.contract.contract_type === 'org_to_mcn') return 'MCN'
    if (props.contract.contract_type === 'mcn_to_channel') return 'Channel'
  }
  if (form.contractType === 'platform_to_org') return 'Organization'
  if (form.contractType === 'org_to_mcn') return 'MCN'
  if (form.contractType === 'mcn_to_channel') return 'Channel'
  return 'Receiving Party'
}

const formatContractType = (type: string): string => {
  const labels: Record<string, string> = {
    'platform_to_org': 'Platform → Organization',
    'org_to_mcn': 'Organization → MCN',
    'mcn_to_channel': 'MCN → Channel',
  }
  return labels[type] || type
}

const formatStatus = (status: string): string => {
  const labels: Record<string, string> = {
    'active': 'Active',
    'expired': 'Expired',
    'future': 'Future',
  }
  return labels[status] || status
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    'future': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

const handleRevenueShareInput = () => {
  // Cap value at 100 and ensure minimum 0
  if (form.revenueSharePct !== null && form.revenueSharePct !== undefined) {
    if (form.revenueSharePct > 100) {
      form.revenueSharePct = 100
    } else if (form.revenueSharePct < 0) {
      form.revenueSharePct = 0
    }
  }
}

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const handleOrganizationChange = async () => {
  form.mcnId = ''
  form.channelId = ''
  if (form.organizationId) {
    await fetchMcns(form.organizationId)
  }
}

const handleMcnChange = async () => {
  form.channelId = ''
  if (form.mcnId) {
    await fetchChannels({ mcn_id: form.mcnId })
  }
}

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.contractType = ''
  errors.entity = ''
  errors.revenueSharePct = ''
  errors.startDate = ''
  errors.endDate = ''

  // Contract type (only for new contracts)
  if (!props.contract && !form.contractType) {
    errors.contractType = 'Please select a contract type'
    isValid = false
  }

  // Entity validation
  if (!props.contract) {
    if (form.contractType === 'platform_to_org' && !form.organizationId) {
      errors.entity = 'Please select an organization'
      isValid = false
    } else if (form.contractType === 'org_to_mcn' && !form.mcnId) {
      errors.entity = 'Please select an MCN'
      isValid = false
    } else if (form.contractType === 'mcn_to_channel' && !form.channelId) {
      errors.entity = 'Please select a channel'
      isValid = false
    }
  }

  // Revenue share
  if (form.revenueSharePct === null || form.revenueSharePct === undefined) {
    errors.revenueSharePct = 'Revenue share is required'
    isValid = false
  } else if (form.revenueSharePct < 0 || form.revenueSharePct > 100) {
    errors.revenueSharePct = 'Revenue share must be between 0 and 100'
    isValid = false
  }

  // Start date
  if (!form.startDate) {
    errors.startDate = 'Start date is required'
    isValid = false
  }

  // End date validation
  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be after start date'
    isValid = false
  }

  return isValid
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    selectedFile.value = null
    selectedFileName.value = null
    fileError.value = null
    return
  }

  // Basic client-side validation
  if (file.type !== 'application/pdf') {
    fileError.value = 'Only PDF files are allowed'
    selectedFile.value = null
    selectedFileName.value = null
    return
  }

  const maxSizeBytes = 10 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    fileError.value = 'File size must be less than 10MB'
    selectedFile.value = null
    selectedFileName.value = null
    return
  }

  selectedFile.value = file
  selectedFileName.value = file.name
  fileError.value = null
}

const calculateChanges = (): Array<{ field: string; oldValue: any; newValue: any }> => {
  if (!props.contract) return []
  
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = []
  
  // Revenue share
  if (form.revenueSharePct !== null && form.revenueSharePct !== props.contract.revenue_share_pct) {
    changes.push({
      field: 'revenue_share_pct',
      oldValue: props.contract.revenue_share_pct,
      newValue: form.revenueSharePct,
    })
  }
  
  // Start date
  if (form.startDate !== props.contract.start_date) {
    changes.push({
      field: 'start_date',
      oldValue: props.contract.start_date,
      newValue: form.startDate,
    })
  }
  
  // End date - handle empty string as null (clearing the date)
  const newEndDate = form.endDate === '' ? null : (form.endDate || null)
  const oldEndDate = props.contract.end_date || null
  if (newEndDate !== oldEndDate) {
    changes.push({
      field: 'end_date',
      oldValue: oldEndDate,
      newValue: newEndDate,
    })
  }
  
  // Notes
  const newNotes = form.notes || ''
  const oldNotes = props.contract.notes || ''
  if (newNotes !== oldNotes) {
    changes.push({
      field: 'notes',
      oldValue: oldNotes,
      newValue: newNotes,
    })
  }
  
  return changes
}

const handleSubmit = async () => {
  if (!validateForm()) return

  if (props.contract) {
    // For updates, calculate changes and show preview modal
    const changes = calculateChanges()
    if (changes.length === 0) {
      // No changes, just close
      emit('success')
      return
    }
    detectedChanges.value = changes
    showChangesModal.value = true
  } else {
    // For new contracts, create directly
    await handleCreateContract()
  }
}

const handleConfirmUpdate = async (notes?: string) => {
  if (!props.contract) return
  
  saving.value = true
  submitError.value = null
  overlapWarnings.value = []
  overlappingContracts.value = []

  try {
    const updateData: ContractUpdate = {
      revenue_share_pct: form.revenueSharePct!,
      start_date: form.startDate,
      end_date: form.endDate === '' ? null : (form.endDate || undefined),
      notes: form.notes || undefined,
      change_notes: notes,
    }
    const result = await updateContract(props.contract.id, updateData)

    // Check for warnings
    if (result.warnings && result.warnings.length > 0) {
      overlapWarnings.value = result.warnings
      overlappingContracts.value = result.overlapping_contracts || []
    }
    
    emit('success')
  } catch (err: any) {
    submitError.value = err.response?.data?.detail || 'Failed to update contract'
    throw err
  } finally {
    saving.value = false
  }
}

const handleCreateContract = async () => {
  saving.value = true
  submitError.value = null
  overlapWarnings.value = []
  overlappingContracts.value = []

  try {
    const createData: ContractCreate = {
      revenue_share_pct: form.revenueSharePct!,
      start_date: form.startDate,
      end_date: form.endDate || undefined,
      notes: form.notes || undefined,
    }

    // Set entity ID based on contract type
    if (form.contractType === 'platform_to_org') {
      createData.organization_id = form.organizationId
    } else if (form.contractType === 'org_to_mcn') {
      createData.mcn_id = form.mcnId
    } else if (form.contractType === 'mcn_to_channel') {
      createData.channel_id = form.channelId
    }

    const result = await createContract(createData)

    // Optional file upload after successful creation
    if (selectedFile.value && result.id) {
      uploadingFile.value = true
      uploadProgress.value = 0
      fileError.value = null

      try {
        await uploadContractFile(result.id, selectedFile.value)
        uploadProgress.value = 100
      } catch (err: any) {
        fileError.value = err.response?.data?.detail || err.message || 'Failed to upload contract file'
        // Do not throw; keep contract but surface error to user
      } finally {
        uploadingFile.value = false
        selectedFile.value = null
        selectedFileName.value = null
      }
    }

    // Check for warnings
    if (result.warnings && result.warnings.length > 0) {
      overlapWarnings.value = result.warnings
      overlappingContracts.value = result.overlapping_contracts || []
      // Still emit success but don't close - let user see warnings
      emit('success')
    } else {
      emit('success')
    }
  } catch (err: any) {
    submitError.value = err.response?.data?.detail || 'Failed to save contract'
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const resetForm = () => {
  form.contractType = ''
  form.organizationId = ''
  form.mcnId = ''
  form.channelId = ''
  form.revenueSharePct = null
  form.startDate = ''
  form.endDate = ''
  form.notes = ''
  
  errors.contractType = ''
  errors.entity = ''
  errors.revenueSharePct = ''
  errors.startDate = ''
  errors.endDate = ''
  
  submitError.value = null
  overlapWarnings.value = []
  overlappingContracts.value = []
}

const initializeForm = async () => {
  // Load organizations
  if (!organizations.value || organizations.value.length === 0) {
    await fetchOrganizations()
  }

  // Auto-select organization for locked users
  if (isOrganizationLocked.value && authStore.user?.organization_id) {
    form.organizationId = authStore.user.organization_id
    await fetchMcns(form.organizationId)
    
    // Auto-select MCN for MCN operators
    if (authStore.user?.role === 'mcn_operator' && authStore.user?.mcn_id) {
      form.mcnId = authStore.user.mcn_id
      await fetchChannels({ mcn_id: form.mcnId })
    }
  }

  // Handle prefill
  if (props.prefillOrganizationId) {
    form.organizationId = props.prefillOrganizationId
    await fetchMcns(props.prefillOrganizationId)
  }
  if (props.prefillMcnId) {
    form.mcnId = props.prefillMcnId
    await fetchChannels({ mcn_id: props.prefillMcnId })
  }
  if (props.prefillChannelId) {
    form.channelId = props.prefillChannelId
  }

  if (!props.contract && props.prefillContractType) {
    form.contractType = props.prefillContractType
  }

  // If editing, populate form
  if (props.contract) {
    // Start in edit mode if prop is set, otherwise default to view mode
    isViewMode.value = !props.startInEditMode
    form.contractType = props.contract.contract_type
    form.revenueSharePct = props.contract.revenue_share_pct
    form.startDate = props.contract.start_date
    form.endDate = props.contract.end_date || ''
    form.notes = props.contract.notes || ''
    
    if (props.contract.organization_id) {
      form.organizationId = props.contract.organization_id
    }
    if (props.contract.mcn_id) {
      form.mcnId = props.contract.mcn_id
    }
    if (props.contract.channel_id) {
      form.channelId = props.contract.channel_id
    }
    
  } else {
    isViewMode.value = false
  }
}

// Watch for modal open
// Contract files and history functions


watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    resetForm()
    await initializeForm()
  }
})

// Initial load if already open
onMounted(async () => {
  if (props.isOpen) {
    resetForm()
    await initializeForm()
  }
})
</script>
