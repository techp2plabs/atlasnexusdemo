<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
      aria-label="Notifications"
      @click="open = !open"
    >
      <span
        v-if="unread > 0"
        class="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[9px] font-bold text-white"
      >
        {{ unread > 9 ? '9+' : unread }}
      </span>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-50 mt-2 flex max-h-[420px] w-80 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div class="mb-2 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
        <h5 class="text-sm font-semibold text-gray-800 dark:text-white/90">Notifications</h5>
        <button v-if="unread > 0" type="button" class="text-xs font-medium text-brand-600 hover:underline" @click="markAll">
          Mark all read
        </button>
      </div>
      <div v-if="items.length === 0" class="py-6 text-center text-sm text-gray-400">No notifications yet.</div>
      <ul v-else class="flex flex-col gap-1 overflow-y-auto">
        <li v-for="n in items" :key="n.id">
          <component
            :is="n.link ? 'NuxtLink' : 'div'"
            :to="n.link ?? undefined"
            class="block cursor-pointer rounded-lg p-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
            :class="!n.read ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''"
            @click="markRead(n.id), (open = false)"
          >
            <p class="text-gray-700 dark:text-gray-200">{{ n.message }}</p>
            <p class="mt-0.5 text-xs text-gray-400">{{ formatRelative(n.created_at) }}</p>
          </component>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useNotifications } from '~/composables/youtubeBrandCampaign/useNotifications'
import { useNotificationsApi } from '~/composables/youtubeBrandCampaign/useNotificationsApi'
import type { NotificationAudience } from '~/mocks/fixtures/notifications'

interface Props {
  audience: NotificationAudience
}
const props = defineProps<Props>()

/**
 * The agency audience reads the real feed (`/api/v1/notifications`, R0 v1 §7) —
 * today that is `campaign.launched`. The creator audience stays on the mock store
 * until R3 ships the application notifications that populate it.
 */
const { list, unreadCount, markRead: markMockRead, markAllRead } = useNotifications()
const notificationsApi = useNotificationsApi()

const isReal = computed(() => props.audience === 'agency')

const realItems = ref<{ id: string; message: string; created_at: string; read: boolean; link: string | null }[]>([])
const realUnread = ref(0)

const items = computed(() => (isReal.value ? realItems.value : list(props.audience)))
const unread = computed(() => (isReal.value ? realUnread.value : unreadCount(props.audience)))

async function loadReal() {
  if (!isReal.value) return
  try {
    const [page, count] = await Promise.all([notificationsApi.list(1), notificationsApi.unreadCount()])
    realItems.value = page.items.map((n) => ({
      id: n.id,
      message: n.body ? `${n.title} — ${n.body}` : n.title,
      created_at: n.created_at,
      read: n.read_at !== null,
      link: n.action_url ?? (n.entity_type === 'campaign' && n.entity_id
        ? `/app/youtube-brand-campaign/campaigns/${n.entity_id}`
        : null),
    }))
    realUnread.value = count
  } catch {
    // A notification feed that cannot load must not break the page it sits on.
    realItems.value = []
    realUnread.value = 0
  }
}

async function markRead(id: string) {
  if (!isReal.value) {
    markMockRead(id)
    return
  }
  try {
    await notificationsApi.markRead(id)
    await loadReal()
  } catch {
    /* leave the badge as-is; the next open refetches */
  }
}

async function markAll() {
  if (!isReal.value) {
    markAllRead(props.audience)
    return
  }
  await Promise.all(realItems.value.filter((n) => !n.read).map((n) => notificationsApi.markRead(n.id).catch(() => undefined)))
  await loadReal()
}

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadReal()
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
watch(open, (isOpen) => { if (isOpen) loadReal() })

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>
