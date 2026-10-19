<template>
  <div class="space-y-6">
    <!-- Failed banner -->
    <div v-if="profiling.status === 'failed'" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-start gap-3">
        <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-300">Import failed</p>
          <p v-if="profiling.error_message" class="mt-1 text-sm text-red-700 dark:text-red-400">{{ profiling.error_message }}</p>
        </div>
      </div>
    </div>

    <!-- Project metadata -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Project Details</h2>
        <button
          v-if="!editingMeta"
          @click="startMetaEdit"
          class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >Edit</button>
      </div>

      <!-- Read-only -->
      <template v-if="!editingMeta">
        <dl class="space-y-4">
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Project Name</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ profiling.name }}</dd>
          </div>
          <div v-if="profiling.description">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ profiling.description }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(profiling.created_at) }}</dd>
          </div>
        </dl>
      </template>

      <!-- Edit form -->
      <template v-else>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name <span class="text-red-500">*</span></label>
            <input
              v-model="metaForm.name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              v-model="metaForm.description"
              rows="2"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>
          <div v-if="metaError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{{ metaError }}</div>
          <div class="flex gap-3">
            <button @click="saveMeta" :disabled="savingMeta" class="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50">
              {{ savingMeta ? 'Saving...' : 'Save' }}
            </button>
            <button @click="cancelMetaEdit" :disabled="savingMeta" class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Import channels -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Import Channels</h2>
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Paste YouTube channel URLs (one per line). Supported: <code class="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">/channel/UC…</code>
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">/@handle</code>
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">/c/…</code>
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">/user/…</code>
      </p>

      <div class="space-y-3">
        <textarea
          v-model="urlsText"
          :disabled="importing"
          rows="8"
          placeholder="https://www.youtube.com/@channel&#10;https://www.youtube.com/channel/UCxxxxxx&#10;https://www.youtube.com/c/customname"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
        ></textarea>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ parsedUrlCount }} URL{{ parsedUrlCount !== 1 ? 's' : '' }} detected · Max 100 channels per import
          <span v-if="parsedUrlCount > 100" class="ml-1 text-red-600 dark:text-red-400">⚠ Over limit</span>
        </p>

        <div v-if="importError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{{ importError }}</div>

        <div class="flex items-center gap-3">
          <button
            @click="runImport"
            :disabled="importing || parsedUrlCount === 0 || parsedUrlCount > 100"
            class="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="importing" class="flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
              Importing…
            </span>
            <span v-else>Import Channels</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Already imported channels -->
    <div v-if="profiling.channels?.length" class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Imported Channels
          <span class="ml-2 rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {{ profiling.channels.length }}
          </span>
        </h2>
      </div>
      <ul class="divide-y divide-gray-100 dark:divide-gray-800">
        <li
          v-for="ch in profiling.channels"
          :key="ch.id"
          class="flex items-center gap-3 px-6 py-3"
        >
          <img
            v-if="ch.thumbnail_url"
            :src="ch.thumbnail_url"
            :alt="ch.title || ''"
            class="h-8 w-8 flex-shrink-0 rounded-full object-cover"
          />
          <div v-else class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <svg class="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ ch.title || ch.channel_id }}</p>
            <p v-if="ch.custom_url" class="truncate text-xs text-gray-500 dark:text-gray-400">{{ ch.custom_url }}</p>
          </div>
          <div class="flex flex-shrink-0 items-center gap-3">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              <span v-if="ch.hidden_subscriber_count">Hidden</span>
              <span v-else-if="ch.subscriber_count != null">{{ formatNumber(ch.subscriber_count) }} subs</span>
            </span>
            <button
              @click="runRemove(ch.channel_id)"
              :disabled="removingId === ch.channel_id"
              class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Remove channel"
            >
              <svg v-if="removingId === ch.channel_id" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelProfilingOut } from '~/composables/useChannelProfiling'

const props = defineProps<{ profiling: ChannelProfilingOut }>()
const emit = defineEmits<{
  updated: [profiling: ChannelProfilingOut]
  imported: [profiling: ChannelProfilingOut]
}>()

const { updateProfiling, importChannels, removeChannel } = useChannelProfiling()

// Meta edit
const editingMeta = ref(false)
const savingMeta = ref(false)
const metaError = ref<string | null>(null)
const metaForm = reactive({ name: '', description: '' })

const startMetaEdit = () => {
  metaForm.name = props.profiling.name
  metaForm.description = props.profiling.description || ''
  metaError.value = null
  editingMeta.value = true
}
const cancelMetaEdit = () => { editingMeta.value = false; metaError.value = null }

const saveMeta = async () => {
  metaError.value = null
  if (!metaForm.name.trim()) { metaError.value = 'Project name is required'; return }
  savingMeta.value = true
  try {
    const updated = await updateProfiling(props.profiling.id, {
      name: metaForm.name.trim(),
      description: metaForm.description.trim() || null,
    })
    editingMeta.value = false
    emit('updated', updated)
  } catch (e: any) {
    metaError.value = e?.response?.data?.detail || 'Failed to save'
  } finally {
    savingMeta.value = false
  }
}

// Remove channel
const removingId = ref<string | null>(null)

const runRemove = async (channelId: string) => {
  removingId.value = channelId
  try {
    const updated = await removeChannel(props.profiling.id, channelId)
    emit('updated', updated)
  } catch {}
  finally {
    removingId.value = null
  }
}

// Import
const urlsText = ref('')
const importing = ref(false)
const importError = ref<string | null>(null)

const parsedUrlCount = computed(() =>
  urlsText.value.split('\n').map((u) => u.trim()).filter(Boolean).length
)

const runImport = async () => {
  importError.value = null
  const urls = urlsText.value.split('\n').map((u) => u.trim()).filter(Boolean)
  if (!urls.length) return
  if (urls.length > 100) { importError.value = 'Maximum 100 channel URLs allowed per import'; return }

  importing.value = true
  try {
    const updated = await importChannels(props.profiling.id, urls)
    urlsText.value = ''
    emit('imported', updated)
  } catch (e: any) {
    importError.value = e?.response?.data?.detail || 'Import failed'
  } finally {
    importing.value = false
  }
}

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return d }
}

const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
</script>
