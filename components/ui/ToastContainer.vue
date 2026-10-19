<template>
  <Teleport to="body">
    <div class="nx-toasts fixed top-4 right-4 left-4 sm:left-auto z-99999 flex flex-col gap-2" role="status" aria-live="polite">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 rounded-lg border p-4 shadow-lg max-w-sm',
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : toast.type === 'error'
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : toast.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
          ]"
        >
          <div class="flex-shrink-0">
            <svg
              v-if="toast.type === 'success'"
              class="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="h-5 w-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              class="h-5 w-5 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg
              v-else
              class="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p
              :class="[
                'text-sm font-medium',
                toast.type === 'success'
                  ? 'text-green-900 dark:text-green-300'
                  : toast.type === 'error'
                    ? 'text-red-900 dark:text-red-300'
                    : toast.type === 'warning'
                      ? 'text-yellow-900 dark:text-yellow-300'
                      : 'text-blue-900 dark:text-blue-300',
              ]"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            aria-label="Dismiss notification"
            @click="removeToast(toast.id)"
            :class="[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
              toast.type === 'success'
                ? 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300'
                : toast.type === 'error'
                  ? 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300'
                  : toast.type === 'warning'
                    ? 'text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300'
                    : 'text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300',
            ]"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

