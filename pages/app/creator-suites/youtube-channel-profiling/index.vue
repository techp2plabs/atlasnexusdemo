<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">YouTube Channel Profiling</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Build a searchable shortlist from public channel data for research and collaboration.</p>
      </div>
      <button
        @click="showNewModal = true"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + New Profiling
      </button>
    </div>

    <!-- Error -->
    <div v-if="error && !loading" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          <button @click="load" class="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300">Retry</button>
        </div>
      </div>
    </div>

    <!-- Active/Archived tabs (admin only) -->
    <div v-if="authStore.isAdmin" class="col-span-12">
      <Tabs v-model="statusFilter" :tabs="statusTabs" />
    </div>

    <!-- Search -->
    <div class="col-span-12">
      <form @submit.prevent="applySearch" class="flex w-full max-w-xl items-center gap-2">
        <div class="relative flex-1">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search project name or description…"
            class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            v-if="searchInput"
            type="button"
            @click="clearSearch"
            aria-label="Clear search"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          :disabled="searchInput.trim() === searchQuery"
          class="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </form>
    </div>

    <!-- Table -->
    <div class="col-span-12">
      <div class="rounded-lg border border-border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div v-if="loading && !profilings" class="flex items-center justify-center py-16">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
        </div>

        <div v-else-if="!profilings?.items?.length" class="flex flex-col items-center justify-center py-16 text-center">
          <svg class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <template v-if="searchQuery">
            <p class="text-sm font-medium text-foreground dark:text-white">No projects match “{{ searchQuery }}”</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Try another search or clear it to see all projects.</p>
            <button @click="clearSearch" class="mt-3 text-sm font-medium text-accent-foreground underline underline-offset-2">Clear search</button>
          </template>
          <template v-else>
            <p class="text-sm font-medium text-foreground dark:text-white">No profiling projects yet</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first project to start building a creator list</p>
            <button
              @click="showNewModal = true"
              class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + New Profiling
            </button>
          </template>
        </div>

        <table v-if="profilings?.items?.length" class="w-full text-sm">
          <thead>
            <tr class="border-b border-border dark:border-gray-800">
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Project Name</th>
              <th v-if="showOwnerColumn" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Owner</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Channels</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Updated</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr
              v-for="p in profilings.items"
              :key="p.id"
              class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
              @click="router.push(`/app/creator-suites/youtube-channel-profiling/${p.id}`)"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-foreground dark:text-white">{{ p.name }}</div>
                <div v-if="p.description" class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400 max-w-xs">{{ p.description }}</div>
              </td>
              <td v-if="showOwnerColumn" class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ p.owner_email || '—' }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ p.channel_count }}</td>
              <td class="px-6 py-4">
                <span :class="statusBadgeClass(p.status)">{{ statusLabel(p.status) }}</span>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ formatDate(p.updated_at) }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/app/creator-suites/youtube-channel-profiling/${p.id}`"
                    class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400"
                    @click.stop
                  >
                    Open
                  </NuxtLink>
                  <button
                    v-if="statusFilter === 'archived'"
                    @click.stop="handleRestore(p)"
                    class="rounded bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Restore
                  </button>
                  <button
                    v-else
                    @click.stop="handleDelete(p)"
                    class="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="profilings && profilings.total_pages > 1"
          class="flex items-center justify-between border-t border-border px-6 py-3 dark:border-gray-800"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Page {{ profilings.page }} of {{ profilings.total_pages }} ({{ profilings.total }} total)
          </p>
          <div class="flex gap-2">
            <button
              :disabled="page === 1"
              @click="changePage(page - 1)"
              class="rounded border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >Prev</button>
            <button
              :disabled="page >= profilings.total_pages"
              @click="changePage(page + 1)"
              class="rounded border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Profiling Modal -->
    <Modal :isOpen="showNewModal" title="New YouTube Channel Profiling" size="md" @close="closeModal">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Gaming Creators Q3 2026"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span class="text-xs text-gray-400">(optional)</span>
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="What's this creator list for?"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          ></textarea>
        </div>
        <div v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {{ formError }}
        </div>
      </div>
      <template #footer>
        <button @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
          Cancel
        </button>
        <button
          @click="submit"
          :disabled="submitting"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ submitting ? 'Creating...' : 'Create Project' }}
        </button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :isOpen="isDeleteModalOpen" @close="handleDeleteModalClose" title="Delete Profiling Project" size="sm">
      <div class="mt-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{{ selectedProfiling?.name }}"? The project will be archived and can be restored later.
        </p>
        <p v-if="deleteError" class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {{ deleteError }}
        </p>
      </div>
      <template #footer>
        <div class="flex w-full items-center justify-end gap-3">
          <button
            @click="handleDeleteModalClose"
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            type="button"
            :disabled="deleting"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Modal from '~/components/ui/Modal.vue'
import Tabs from '~/components/common/Tabs.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import { useChannelProfiling, type ChannelProfilingListItem } from '~/composables/useChannelProfiling'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator', 'creator'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success: showSuccessToast } = useToast()
const { loading, error, fetchProfilings, createProfiling, deleteProfiling, restoreProfiling } = useChannelProfiling()

const profilings = ref<Awaited<ReturnType<typeof fetchProfilings>> | null>(null)
const page = ref(Number(route.query.page) > 0 ? Number(route.query.page) : 1)
const showNewModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const form = reactive({ name: '', description: '' })

const statusTabs = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
]
const statusFilter = ref<string>(
  route.query.status === 'archived' ? 'archived' : 'active'
)

const searchQuery = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const searchInput = ref<string>(searchQuery.value)

const isDeleteModalOpen = ref(false)
const selectedProfiling = ref<ChannelProfilingListItem | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const showOwnerColumn = computed(() => profilings.value?.items?.some((p) => p.owner_email) ?? false)

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'Creator Suites', to: '/app/creator-suites' },
  { label: 'YouTube Channel Profiling' },
]

const load = async () => {
  try {
    profilings.value = await fetchProfilings(
      page.value,
      20,
      statusFilter.value as 'active' | 'archived',
      searchQuery.value || undefined
    )
  } catch {}
}

const syncQuery = () => {
  const query: Record<string, string> = { ...(route.query as Record<string, string>) }
  if (searchQuery.value) query.q = searchQuery.value
  else delete query.q
  if (statusFilter.value !== 'active') query.status = statusFilter.value
  else delete query.status
  if (page.value > 1) query.page = String(page.value)
  else delete query.page
  router.replace({ query })
}

const changePage = async (newPage: number) => {
  page.value = newPage
  syncQuery()
  await load()
}

const applySearch = () => {
  searchQuery.value = searchInput.value.trim()
}

const clearSearch = () => {
  searchInput.value = ''
  searchQuery.value = ''
}

watch([statusFilter, searchQuery], async () => {
  page.value = 1
  syncQuery()
  await load()
})

const handleDelete = (profiling: ChannelProfilingListItem) => {
  selectedProfiling.value = profiling
  deleteError.value = null
  isDeleteModalOpen.value = true
}

const handleDeleteModalClose = () => {
  isDeleteModalOpen.value = false
  selectedProfiling.value = null
  deleteError.value = null
}

const confirmDelete = async () => {
  if (!selectedProfiling.value) return

  deleting.value = true
  deleteError.value = null
  try {
    await deleteProfiling(selectedProfiling.value.id)
    showSuccessToast('Profiling project deleted successfully')
    isDeleteModalOpen.value = false
    selectedProfiling.value = null
    await load()
  } catch (e: any) {
    deleteError.value = e?.response?.data?.detail || 'Failed to delete profiling project'
  } finally {
    deleting.value = false
  }
}

const handleRestore = async (profiling: ChannelProfilingListItem) => {
  try {
    await restoreProfiling(profiling.id)
    showSuccessToast('Profiling project restored successfully')
    await load()
  } catch {}
}

const closeModal = () => {
  showNewModal.value = false
  form.name = ''
  form.description = ''
  formError.value = null
}

const submit = async () => {
  formError.value = null
  if (!form.name.trim()) { formError.value = 'Project name is required'; return }

  submitting.value = true
  try {
    const profiling = await createProfiling({
      name: form.name.trim(),
      description: form.description.trim() || null,
    })
    closeModal()
    router.push(`/app/creator-suites/youtube-channel-profiling/${profiling.id}`)
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to create project'
  } finally {
    submitting.value = false
  }
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = { pending: 'Pending', processing: 'Processing', completed: 'Completed', failed: 'Failed' }
  return map[status] || status
}

const statusBadgeClass = (status: string) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  return `${base} ${map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`
}

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

onMounted(load)
</script>
