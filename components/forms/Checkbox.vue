<template>
  <div>
    <label
      :for="checkboxId"
      :class="[
        'flex items-center text-sm font-medium cursor-pointer select-none',
        disabled
          ? 'text-gray-300 dark:text-gray-700'
          : 'text-gray-700 dark:text-gray-400',
      ]"
    >
      <div class="relative">
        <input
          :id="checkboxId"
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          class="sr-only"
          @change="handleChange"
        />
        <div
          :class="[
            'mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]',
            modelValue
              ? 'border-brand-500 bg-brand-500'
              : 'bg-transparent border-gray-300 dark:border-gray-700',
            !disabled && 'hover:border-brand-500 dark:hover:border-brand-500',
          ]"
        >
          <span :class="modelValue ? '' : 'opacity-0'">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                stroke="white"
                stroke-width="1.94437"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
      <span v-if="label">{{ label }}</span>
      <span v-if="required && label" class="text-error-500 ml-1">*</span>
    </label>
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
  modelValue: boolean
  label?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  helpText?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = computed(() => props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`)

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

