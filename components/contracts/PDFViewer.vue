<template>
  <div class="w-full relative">
    <!-- Loading overlay -->
    <div v-if="loading && !error" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
        <p v-if="loadingTimeout" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Taking longer than expected. <button @click="tryFallback" class="text-accent-foreground underline">Try alternative viewer</button>
        </p>
      </div>
    </div>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
      <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-2 text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</p>
      <p class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errorMessage }}</p>
      <button
        @click="openInNewTab"
        class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open in New Tab
      </button>
    </div>

    <!-- PDF rendering (always rendered so @load can fire, but visually hidden while loading) -->
    <div v-if="!error" :class="loading ? 'opacity-0 absolute pointer-events-none h-0 overflow-hidden' : 'relative'">
      <!-- Try Google Docs Viewer as fallback -->
      <iframe
        v-if="useGoogleViewer"
        :src="googleViewerUrl"
        class="h-[600px] w-full rounded-lg border border-border dark:border-gray-700"
        frameborder="0"
        @load="handleLoad"
        @error="handleIframeError"
      ></iframe>
      
      <!-- Try iframe first -->
      <iframe
        v-else-if="!useObjectTag"
        :src="pdfUrl"
        class="h-[600px] w-full rounded-lg border border-border dark:border-gray-700"
        frameborder="0"
        @load="handleLoad"
        @error="handleIframeError"
      ></iframe>
      
      <!-- Fallback: Use object tag -->
      <object
        v-else
        :data="pdfUrl"
        type="application/pdf"
        class="h-[600px] w-full rounded-lg border border-border dark:border-gray-700"
        @error="handleObjectError"
      >
        <div class="flex flex-col items-center justify-center p-6">
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">Unable to display PDF in browser.</p>
          <button
            @click="openInNewTab"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open in New Tab
          </button>
        </div>
      </object>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  fileUrl: string
}>()

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const useObjectTag = ref(false)
const useGoogleViewer = ref(false)
const loadingTimeout = ref(false)
let loadTimeout: ReturnType<typeof setTimeout> | null = null
let checkInterval: ReturnType<typeof setInterval> | null = null

const pdfUrl = computed(() => {
  return props.fileUrl
})

const googleViewerUrl = computed(() => {
  // Use Google Docs Viewer as fallback
  return `https://docs.google.com/viewer?url=${encodeURIComponent(props.fileUrl)}&embedded=true`
})

const handleLoad = () => {
  // Clear any timeouts/intervals
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
  
  // Give it a moment to ensure content is actually loaded
  setTimeout(() => {
    loading.value = false
    error.value = false
    loadingTimeout.value = false
  }, 500)
}

const handleIframeError = () => {
  // Clear timeouts
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
  
  // If we haven't tried object tag yet, try it
  if (!useObjectTag.value && !useGoogleViewer.value) {
    useObjectTag.value = true
    loading.value = true
    // Reset loading state after a moment
    setTimeout(() => {
      loading.value = false
    }, 1000)
  } else if (!useGoogleViewer.value) {
    // If object tag also failed, try Google Viewer
    useGoogleViewer.value = true
    useObjectTag.value = false
    loading.value = true
  } else {
    // All methods failed
    loading.value = false
    error.value = true
    errorMessage.value = 'Failed to load PDF. Please try opening in a new tab.'
  }
}

const handleObjectError = () => {
  // Try Google Viewer as last resort
  if (!useGoogleViewer.value) {
    useGoogleViewer.value = true
    useObjectTag.value = false
    loading.value = true
  } else {
    loading.value = false
    error.value = true
    errorMessage.value = 'Failed to load PDF. Please try opening in a new tab.'
  }
}

const tryFallback = () => {
  if (!useGoogleViewer.value) {
    useGoogleViewer.value = true
    useObjectTag.value = false
    loading.value = true
  } else {
    openInNewTab()
  }
}

const openInNewTab = () => {
  window.open(props.fileUrl, '_blank')
}

const startLoadingTimeout = () => {
  // Set a timeout to detect if loading is taking too long
  loadTimeout = setTimeout(() => {
    loadingTimeout.value = true
    // After 5 more seconds, try fallback
    setTimeout(() => {
      if (loading.value) {
        tryFallback()
      }
    }, 5000)
  }, 3000) // Show timeout message after 3 seconds
}

watch(() => props.fileUrl, () => {
  if (props.fileUrl) {
    loading.value = true
    error.value = false
    errorMessage.value = ''
    useObjectTag.value = false
    useGoogleViewer.value = false
    loadingTimeout.value = false
    
    // Clear any existing timeouts
    if (loadTimeout) {
      clearTimeout(loadTimeout)
      loadTimeout = null
    }
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
    
    // Start timeout detection
    startLoadingTimeout()
  }
}, { immediate: true })

onUnmounted(() => {
  if (loadTimeout) {
    clearTimeout(loadTimeout)
  }
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

