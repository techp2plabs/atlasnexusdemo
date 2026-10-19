<template>
  <DialogRoot :open="isOpen" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay :class="['fixed inset-0 z-50', fullScreenBackdrop ? 'bg-gray-900/50' : 'bg-black/50']" />
      <DialogContent
        :aria-describedby="undefined"
        :class="['nexus-dialog fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-card text-card-foreground shadow-xl', sizeClasses[size], className]"
        @pointer-down-outside="onPointerOutside"
        @interact-outside="onInteractOutside"
      >
        <div v-if="title || $slots.header" class="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-5">
          <DialogTitle as="div" class="min-w-0 flex-1"><slot name="header"><h3 class="text-lg font-semibold">{{ title }}</h3></slot></DialogTitle>
          <DialogClose v-if="showCloseButton" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" aria-label="Close dialog"><X :size="20" aria-hidden="true" /></DialogClose>
        </div>
        <DialogTitle v-else class="sr-only">Dialog</DialogTitle>
        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5"><slot /></div>
        <div v-if="$slots.footer" class="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4"><slot name="footer" /></div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui'
import { X } from 'lucide-vue-next'
interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  fullScreenBackdrop?: boolean
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  className?: string
}
const props = withDefaults(defineProps<Props>(), { size: 'md', fullScreenBackdrop: true, closeOnBackdrop: true, showCloseButton: true, className: '' })
const emit = defineEmits<{ close: [] }>()
const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-4xl', '3xl': 'max-w-6xl' }
const onOpenChange = (open: boolean) => { if (!open) emit('close') }
const onPointerOutside = (event: Event) => { if (!props.closeOnBackdrop) event.preventDefault() }
// Non-pointer interaction outside a modal never dismisses a form.
const onInteractOutside = (event: Event) => { if (!props.closeOnBackdrop) event.preventDefault() }
</script>
<style scoped>
.nexus-dialog { font-family: var(--atlas-font-ui); }
</style>
