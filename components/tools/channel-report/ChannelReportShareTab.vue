<template>
  <div class="space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Public Share</h2>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Generate a public link protected by an access code. Anyone with the link and code can view
          a read-only Overview / Videos / Channels version of this report — no login required.
        </p>
      </div>

      <div v-if="report.status !== 'completed'" class="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        The report must finish processing before it can be shared.
      </div>

      <template v-else>
        <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></span>
          Loading share status…
        </div>

        <template v-else>
          <!-- Not shared -->
          <div v-if="!status.is_shared" class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Sharing is currently off.</p>
            <button
              @click="handleGenerate"
              :disabled="generating"
              class="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ generating ? 'Generating…' : 'Enable Sharing' }}
            </button>
          </div>

          <!-- Shared -->
          <div v-else class="space-y-5">
            <div class="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <span class="h-2 w-2 rounded-full bg-green-500"></span>
              Sharing is on
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Public link</label>
              <div class="flex items-center gap-2">
                <input
                  :value="status.public_url"
                  readonly
                  class="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  @click="copy(status.public_url || '', 'link')"
                  class="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {{ copiedLink ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>

            <div v-if="lastGeneratedCode" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
              <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">Access code (shown once)</p>
              <p class="mt-1 text-xs text-amber-800 dark:text-amber-300">
                Save this code now — for security it won't be shown again. Regenerate a new code if you lose it.
              </p>
              <div class="mt-2 flex items-center gap-2">
                <span class="rounded bg-white px-3 py-1.5 font-mono text-lg tracking-widest text-gray-900 dark:bg-gray-900 dark:text-white">
                  {{ lastGeneratedCode }}
                </span>
                <button
                  @click="copy(lastGeneratedCode, 'code')"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {{ copiedCode ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              The access code is only shown at generation time. Regenerate to view a new one.
            </p>

            <div class="flex items-center gap-3 pt-2">
              <button
                @click="handleGenerate"
                :disabled="generating"
                class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {{ generating ? 'Regenerating…' : 'Regenerate Code' }}
              </button>
              <button
                @click="handleDisable"
                :disabled="disabling"
                class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {{ disabling ? 'Disabling…' : 'Disable Sharing' }}
              </button>
            </div>
          </div>
        </template>

        <div v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {{ errorMessage }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelReport, ShareStatus } from '~/composables/useChannelReport'

const props = defineProps<{ report: ChannelReport }>()

const { getShareStatus, generateShare, disableShare } = useChannelReport()

const loading = ref(true)
const generating = ref(false)
const disabling = ref(false)
const errorMessage = ref<string | null>(null)
const status = ref<ShareStatus>({ is_shared: false, public_url: null })
const lastGeneratedCode = ref<string | null>(null)
const copiedLink = ref(false)
const copiedCode = ref(false)

const loadStatus = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    status.value = await getShareStatus(props.report.id)
  } catch (e: any) {
    errorMessage.value = e?.response?.data?.detail || 'Failed to load share status'
  } finally {
    loading.value = false
  }
}

const handleGenerate = async () => {
  generating.value = true
  errorMessage.value = null
  lastGeneratedCode.value = null
  try {
    const result = await generateShare(props.report.id)
    status.value = { is_shared: result.is_shared, public_url: result.public_url }
    lastGeneratedCode.value = result.code
  } catch (e: any) {
    errorMessage.value = e?.response?.data?.detail || 'Failed to generate share link'
  } finally {
    generating.value = false
  }
}

const handleDisable = async () => {
  disabling.value = true
  errorMessage.value = null
  try {
    status.value = await disableShare(props.report.id)
    lastGeneratedCode.value = null
  } catch (e: any) {
    errorMessage.value = e?.response?.data?.detail || 'Failed to disable sharing'
  } finally {
    disabling.value = false
  }
}

const copy = async (text: string, which: 'link' | 'code') => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    if (which === 'link') {
      copiedLink.value = true
      setTimeout(() => (copiedLink.value = false), 2000)
    } else {
      copiedCode.value = true
      setTimeout(() => (copiedCode.value = false), 2000)
    }
  } catch {}
}

onMounted(loadStatus)
</script>
