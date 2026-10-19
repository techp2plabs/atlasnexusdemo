<template>
  <div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
    <div class="text-center">
      <!-- Icon -->
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <svg
          class="h-8 w-8 text-brand-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="mt-4 text-lg font-semibold text-foreground">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="mt-2 text-sm text-gray-600">
        {{ description }}
      </p>

      <!-- Progress Indicator -->
      <div class="mt-4">
        <span class="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Step {{ currentStep }} of 4
        </span>
      </div>

      <!-- Checklist Items -->
      <div class="mt-6 space-y-3">
        <button
          v-for="(action, index) in nextActions"
          :key="index"
          @click="handleActionClick(action.action)"
          class="w-full rounded-xl border border-brand-100 bg-brand-50 px-6 py-4 text-left transition-all hover:border-brand-200 hover:bg-brand-100"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-600"
              >
                <svg
                  class="h-4 w-4 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-foreground">
                  {{ action.label }}
                </p>
                <p
                  v-if="action.description"
                  class="mt-1 text-xs text-gray-600"
                >
                  {{ action.description }}
                </p>
              </div>
            </div>
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NextAction } from '~/composables/useDashboardProgress'

interface Props {
  progress: number
  currentStep: number
  nextActions: NextAction[]
}

interface Emits {
  (e: 'action-click', action: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const title = computed(() => {
  if (props.progress === 0) {
    return 'Get Started with Atlas'
  }
  if (props.progress === 25) {
    return 'Add Your Channels'
  }
  if (props.progress === 50) {
    return 'Set Up Revenue Contracts'
  }
  if (props.progress === 75) {
    return 'Build Your Team'
  }
  return 'Complete Your Setup'
})

const description = computed(() => {
  if (props.progress === 0) {
    return 'Create your first MCN to start managing your YouTube channels and revenue.'
  }
  if (props.progress === 25) {
    return 'Add channels to your MCN to begin tracking performance and revenue.'
  }
  if (props.progress === 50) {
    return 'Set up contracts to define how revenue is split between platform, organization, MCN, and creators.'
  }
  if (props.progress === 75) {
    return 'Invite team members to help manage your MCN and work with creators.'
  }
  return 'You\'re all set! Continue building your platform.'
})

const handleActionClick = (action: string) => {
  emit('action-click', action)
}
</script>
