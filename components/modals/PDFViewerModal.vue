<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    :title="title"
    size="xl"
  >
    <div class="py-4">
      <PDFViewer :file-url="fileUrl" />
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          @click="handleDownload"
          type="button"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Download
        </button>
        <button
          @click="handleClose"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import PDFViewer from '~/components/contracts/PDFViewer.vue'

const props = defineProps<{
  isOpen: boolean
  fileUrl: string
  title?: string
  onDownload?: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}

const handleDownload = () => {
  if (props.onDownload) {
    props.onDownload()
  } else {
    // Default: open in new tab for download
    window.open(props.fileUrl, '_blank')
  }
  handleClose()
}
</script>

