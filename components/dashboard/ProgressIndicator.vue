<template>
  <div class="w-full">
    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">
          Setup Progress
        </span>
        <span class="text-sm font-medium text-brand-600">
          {{ progress }}%
        </span>
      </div>
      <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Step Indicators -->
    <div class="flex items-center justify-between">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex flex-col items-center flex-1"
      >
        <div
          :class="[
            'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
            step.completed
              ? 'bg-brand-600 border-brand-600 text-white'
              : step.current
              ? 'bg-brand-50 border-brand-600 text-brand-600'
              : 'bg-white border-border text-gray-400',
          ]"
        >
          <svg
            v-if="step.completed"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span v-else class="text-sm font-semibold">{{ index + 1 }}</span>
        </div>
        <span
          :class="[
            'mt-2 text-xs text-center',
            step.completed || step.current
              ? 'text-foreground font-medium'
              : 'text-gray-500',
          ]"
        >
          {{ step.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number
  currentStep: number
}

const props = defineProps<Props>()

const steps = computed(() => {
  return [
    {
      label: 'Add MCN',
      completed: props.progress > 0,
      current: props.currentStep === 1,
    },
    {
      label: 'Add Channels',
      completed: props.progress >= 25,
      current: props.currentStep === 2,
    },
    {
      label: 'Set up Contracts',
      completed: props.progress >= 50,
      current: props.currentStep === 3,
    },
    {
      label: 'Invite Team',
      completed: props.progress >= 75,
      current: props.currentStep === 4,
    },
  ]
})
</script>
