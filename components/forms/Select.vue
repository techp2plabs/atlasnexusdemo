<template>
  <div>
    <label
      v-if="label"
      :for="selectId"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
    >
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>
    <div class="relative z-20 bg-transparent">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :class="[
          'h-11 w-full appearance-none rounded-lg border bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
          modelValue ? 'text-gray-800 dark:text-white/90' : 'text-gray-500',
          error
            ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800'
            : success
              ? 'border-success-300 focus:border-success-300 focus:ring-success-500/10 dark:border-success-700 dark:focus:border-success-800'
              : 'border-input focus:border-ring focus:ring-ring/20 dark:border-gray-700 dark:focus:border-brand-800',
          disabled
            ? 'disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15'
            : '',
        ]"
        @change="handleChange"
        @blur="handleBlur"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in validOptions"
          :key="option.value"
          :value="option.value"
          class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {{ option.label }}
        </option>
      </select>
      <span
        class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
      >
        <svg
          class="stroke-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
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
import { computed } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number | null
  label?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  success?: boolean
  errorMessage?: string
  helpText?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  disabled: false,
  required: false,
  error: false,
  success: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  blur: []
}>()

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substr(2, 9)}`)

// Filter out invalid options
const validOptions = computed(() => {
  if (!props.options || !Array.isArray(props.options)) {
    return []
  }
  return props.options.filter(option => option && option.value !== undefined && option.label !== undefined)
})

const handleChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value || null)
}

const handleBlur = () => {
  emit('blur')
}
</script>

