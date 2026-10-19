<template>
  <div>
    <label
      v-if="label"
      :for="textareaId"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
    >
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :class="[
        'w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
        error
          ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800'
          : success
            ? 'border-success-300 focus:border-success-300 focus:ring-success-500/10 dark:border-success-700 dark:focus:border-success-800'
            : 'border-input focus:border-ring focus:ring-ring/20 dark:border-gray-700 dark:focus:border-brand-800',
        disabled
          ? 'disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15'
          : '',
      ]"
      @input="handleInput"
      @blur="handleBlur"
    ></textarea>
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

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  error?: boolean
  success?: boolean
  errorMessage?: string
  helpText?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
  required: false,
  error: false,
  success: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  emit('blur')
}
</script>

