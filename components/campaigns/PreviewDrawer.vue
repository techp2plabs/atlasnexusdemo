<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div
        v-if="open"
        class="pointer-events-none fixed inset-0 z-[999999]"
        role="presentation"
      >
        <!-- Backdrop -->
        <div
          class="pointer-events-auto fixed inset-0 bg-gray-900/50 md:hidden"
          aria-hidden="true"
          @click="handleBackdropClick"
        />

        <!-- Panel: bottom sheet on mobile (<768px), right-side drawer on desktop -->
        <Transition name="drawer-panel">
          <div
            v-if="open"
            ref="panelRef"
            class="pointer-events-auto fixed inset-x-0 bottom-0 top-auto z-[999999] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-theme-xl outline-none dark:bg-gray-900 md:inset-y-0 md:right-0 md:left-auto md:top-0 md:max-h-full md:w-[480px] md:rounded-none md:rounded-l-2xl"
            role="dialog"
            :aria-modal="!isDesktop"
            :aria-labelledby="titleId"
            tabindex="-1"
            @keydown.esc="handleClose"
            @keydown.tab="trapMobileFocus"
          >
            <!-- Header -->
            <div class="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h3 :id="titleId" class="truncate text-base font-semibold text-gray-800 dark:text-white/90">
                {{ title }}
              </h3>
              <button
                type="button"
                class="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                aria-label="Close"
                @click="handleClose"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body: summary + stats -->
            <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div v-if="$slots.summary" class="mb-4">
                <slot name="summary" />
              </div>
              <div v-if="$slots.stats" class="mb-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <slot name="stats" />
              </div>
              <div v-if="$slots.default">
                <slot />
              </div>
            </div>

            <!-- Actions + footer link -->
            <div
              v-if="$slots.actions || $slots['footer-link']"
              class="shrink-0 border-t border-gray-200 px-5 py-4 dark:border-gray-800"
            >
              <div v-if="$slots.actions" class="flex flex-col gap-2">
                <slot name="actions" />
              </div>
              <div v-if="$slots['footer-link']" class="mt-3 text-center">
                <slot name="footer-link" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

interface Props {
  open: boolean
  title: string
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const titleId = `preview-drawer-title-${useId()}`
const panelRef = ref<HTMLElement | null>(null)
let triggerEl: HTMLElement | null = null
const { setLocked } = useBodyScrollLock()
const isDesktop = ref(false)
let viewportQuery: MediaQueryList | null = null

function syncViewport() {
  isDesktop.value = viewportQuery?.matches ?? false
  setLocked(props.open && !isDesktop.value)
}

onMounted(() => {
  viewportQuery = window.matchMedia('(min-width: 768px)')
  viewportQuery.addEventListener('change', syncViewport)
  syncViewport()
})

onUnmounted(() => {
  viewportQuery?.removeEventListener('change', syncViewport)
})

const handleClose = () => {
  emit('update:open', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) handleClose()
}

function trapMobileFocus(event: KeyboardEvent) {
  if (isDesktop.value || !panelRef.value) return
  const elements = [...panelRef.value.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length)
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first) { event.preventDefault(); panelRef.value.focus(); return }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.value)) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      triggerEl = document.activeElement as HTMLElement | null
      setLocked(!isDesktop.value)
      await nextTick()
      panelRef.value?.focus()
    } else {
      setLocked(false)
      triggerEl?.focus?.()
    }
  },
)
</script>

<style scoped>
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 0.25s ease;
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateY(100%);
}
@media (min-width: 768px) {
  .drawer-panel-enter-from,
  .drawer-panel-leave-to {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .drawer-panel-enter-active, .drawer-panel-leave-active, .drawer-backdrop-enter-active, .drawer-backdrop-leave-active { transition: none; }
}
</style>
