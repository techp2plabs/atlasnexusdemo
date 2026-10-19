<template>
  <div>
    <label
      v-if="label"
      :for="datePickerId"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
    >
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>
    <div class="relative">
      <flatPickr
        :id="datePickerId"
        v-model="dateValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :config="flatpickrOptions"
        :class="[
          'h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
          error
            ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800'
            : success
              ? 'border-success-300 focus:border-success-300 focus:ring-success-500/10 dark:border-success-700 dark:focus:border-success-800'
              : 'border-gray-300 focus:border-ring focus:ring-ring/20 dark:border-gray-700 dark:focus:border-brand-800',
          disabled
            ? 'disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15'
            : '',
        ]"
        @on-change="handleChange"
        @on-close="handleBlur"
      />
    </div>
    <p v-if="error && errorMessage" class="mt-1.5 text-theme-xs text-error-500">
      {{ errorMessage }}
    </p>
    <p v-else-if="helpText" class="mt-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import flatPickr from 'vue-flatpickr-component'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  success?: boolean
  errorMessage?: string
  helpText?: string
  id?: string
  minDate?: string | Date
  maxDate?: string | Date
  dateFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  error: false,
  success: false,
  dateFormat: 'Y-m-d',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const datePickerId = computed(() => props.id || `datepicker-${Math.random().toString(36).substr(2, 9)}`)

// Internal date value for v-model binding
const dateValue = ref(props.modelValue || '')

// Sync external modelValue changes to internal value
watch(() => props.modelValue, (newValue) => {
  dateValue.value = newValue || ''
})

const flatpickrOptions = computed(() => {
  const options: Record<string, any> = {
    dateFormat: props.dateFormat,
    allowInput: true,
    clickOpens: !props.disabled,
    wrap: false,
  }

  // Append calendar to body to avoid z-index issues in modals
  if (typeof document !== 'undefined') {
    options.appendTo = document.body
  }

  if (props.minDate) {
    options.minDate = props.minDate
  }

  if (props.maxDate) {
    options.maxDate = props.maxDate
  }

  return options
})


const handleChange = (selectedDates: Date[], dateStr: string, instance: any) => {
  dateValue.value = dateStr || ''
  emit('update:modelValue', dateStr || '')
}

const handleBlur = () => {
  emit('blur')
}
</script>

