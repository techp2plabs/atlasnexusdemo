<template>
  <Modal
    :isOpen="isOpen"
    @close="handleClose"
    title="Content Owner ID Help"
    size="lg"
  >
    <Tabs :tabs="tabs" v-model="activeTab">
      <!-- What is Content Owner ID? Tab -->
      <template #what-is>
        <div class="space-y-4">
          <div>
            <h3 class="mb-3 text-base font-semibold text-foreground dark:text-white">What is Content Owner ID?</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              A Content Owner ID is a unique identifier assigned by YouTube to content owners who manage multiple channels through YouTube's Content Management System (CMS). This ID is essential for managing and accessing channels at scale.
            </p>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-medium text-foreground dark:text-white">Why is it needed?</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              This ID allows the system to fetch and manage all YouTube channels associated with your MCN. Without it, you cannot access channel data, manage permissions, or track revenue across your network of channels.
            </p>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-medium text-foreground dark:text-white">How is it used?</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Once provided, the system uses this ID to retrieve channel data, manage permissions, and track revenue across all channels in your MCN. It acts as the authentication key for accessing your YouTube CMS account programmatically.
            </p>
          </div>
        </div>
      </template>

      <!-- Where to find it? Tab -->
      <template #where-to-find>
        <div class="space-y-4">
          <div>
            <h3 class="mb-4 text-base font-semibold text-foreground dark:text-white">Where to find your Content Owner ID</h3>
            <ol class="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex gap-3">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground dark:bg-brand-900/30 dark:text-brand-400">1</span>
                <div>
                  <p class="font-medium text-foreground dark:text-white">Log in to your YouTube CMS account</p>
                  <p class="mt-1">Access your YouTube Content Manager account using credentials with CMS access.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground dark:bg-brand-900/30 dark:text-brand-400">2</span>
                <div>
                  <p class="font-medium text-foreground dark:text-white">Navigate to Settings</p>
                  <p class="mt-1">Go to Settings > Channel > Content Owner in your YouTube CMS dashboard.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground dark:bg-brand-900/30 dark:text-brand-400">3</span>
                <div>
                  <p class="font-medium text-foreground dark:text-white">Locate Content Owner Information</p>
                  <p class="mt-1">Your Content Owner ID is displayed in the Content Owner Information section. It typically starts with "contentOwner" followed by a string of characters.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground dark:bg-brand-900/30 dark:text-brand-400">4</span>
                <div>
                  <p class="font-medium text-foreground dark:text-white">Copy the ID</p>
                  <p class="mt-1">Copy the entire Content Owner ID string and paste it into the form field.</p>
                </div>
              </li>
            </ol>
          </div>

          <div class="mt-6 rounded-lg border border-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span class="font-medium text-foreground dark:text-white">Need more help?</span>
              <a
                href="https://support.google.com/youtube/answer/1714329"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-1 text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                View YouTube CMS Documentation
              </a>
            </p>
          </div>
        </div>
      </template>
    </Tabs>

    <template #footer>
      <div class="flex items-center justify-end">
        <button
          type="button"
          @click="handleClose"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Got it
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import Tabs from '~/components/common/Tabs.vue'
import type { Tab } from '~/components/common/Tabs.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('what-is')

const tabs: Tab[] = [
  { id: 'what-is', label: 'What is Content Owner ID?' },
  { id: 'where-to-find', label: 'Where to find it?' },
]

const handleClose = () => {
  emit('close')
}
</script>

