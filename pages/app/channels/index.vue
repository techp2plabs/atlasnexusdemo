<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Breadcrumb -->
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Page Header -->
    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">Channels</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage YouTube channels</p>
      </div>
      <button
        v-if="canCreate"
        @click="handleCreate"
        class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + Add Channel
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="col-span-12 rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <!-- Organization Filter -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Organization</label>
          <select
            v-model="filters.organization_id"
            @change="handleOrganizationChange"
            :disabled="organizationsLoading"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Organizations</option>
            <option v-for="org in organizations" :key="org.id" :value="org.id">
              {{ org.name }}
            </option>
          </select>
        </div>

        <!-- MCN Filter -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">MCN</label>
          <select
            v-model="filters.mcn_id"
            @change="handleMcnChange"
            :disabled="!filters.organization_id || mcnsLoading"
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All MCNs</option>
            <option v-for="mcn in mcns" :key="mcn.id" :value="mcn.id">
              {{ mcn.name }}
            </option>
          </select>
        </div>

        <!-- Search -->
        <div class="lg:col-span-3">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
          <div class="flex gap-2">
            <select
              v-model="searchBy"
              class="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="title">Channel Name</option>
            </select>
            <input
              v-model="searchValue"
              type="text"
              placeholder="Search by channel name..."
              class="h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
              @keyup.enter="applySearch"
            />
            <button
              @click="applySearch"
              :disabled="loading"
              class="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
            <button
              @click="clearFilters"
              :disabled="loading"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          </div>
          <button
            @click="refresh"
            class="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
          >
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="col-span-12">
      <DataTable
        :columns="columns"
        :data="channels"
        :loading="loading"
        empty-message="No channels found. Add your first channel to get started."
      >
        <template #cell-title="{ row }">
          <div class="flex items-center gap-3">
            <div class="relative h-10 w-10 flex-shrink-0">
              <img
                v-if="row.thumbnail_url"
                :src="row.thumbnail_url"
                :alt="row.title"
                class="h-10 w-10 rounded-full object-cover border border-border dark:border-gray-700"
                @error="handleThumbnailError"
              />
              <div
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              >
                <YoutubeIcon variant="black" class="h-6 w-6" />
              </div>
            </div>
            <p class="font-medium text-foreground dark:text-white">{{ row.title }}</p>
          </div>
        </template>

        <template #cell-mcn_name="{ row }">
          <NuxtLink
            v-if="row.mcn_id"
            :to="`/app/mcns/${row.mcn_id}`"
            class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {{ row.mcn_name || '—' }}
          </NuxtLink>
          <p v-else class="text-gray-500 text-sm dark:text-gray-400">—</p>
        </template>

        <template #cell-organization_name="{ row }">
          <NuxtLink
            v-if="row.organization_id"
            :to="`/app/organizations/${row.organization_id}`"
            class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {{ row.organization_name || '—' }}
          </NuxtLink>
          <p v-else class="text-gray-500 text-sm dark:text-gray-400">—</p>
        </template>

        <template #cell-subscriber_count="{ value }">
          <p class="text-gray-500 text-sm dark:text-gray-400">
            {{ formatNumber(value) }}
          </p>
        </template>

        <template #cell-view_count="{ value }">
          <p class="text-gray-500 text-sm dark:text-gray-400">
            {{ formatNumber(value) }}
          </p>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/app/channels/${row.id}`"
              class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
            >
              View
            </NuxtLink>
            <button
              v-if="canEdit"
              @click="handleEdit(row)"
              class="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Edit
            </button>
            <button
              v-if="canDelete"
              @click="handleDelete(row)"
              class="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Delete
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total_pages > 1" class="col-span-12 flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (pagination.page - 1) * pagination.page_size + 1 }} to
        {{ Math.min(pagination.page * pagination.page_size, pagination.total) }} of
        {{ pagination.total }} channels
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page <= 1 || loading"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        <div class="flex items-center gap-1">
          <button
            v-for="pageNum in visiblePages"
            :key="pageNum"
            @click="goToPage(pageNum)"
            :class="[
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pageNum === pagination.page
                ? 'bg-primary text-primary-foreground'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              pageNum === '...' ? 'border-none bg-transparent hover:bg-transparent cursor-default' : ''
            ]"
            :disabled="pageNum === '...' || loading"
          >
            {{ pageNum }}
          </button>
        </div>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.total_pages || loading"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Channel Form Modal (placeholder for Phase 2.7) -->
    <ChannelFormModal
      v-if="isModalOpen"
      :isOpen="isModalOpen"
      :channel="selectedChannel"
      :prefillMcnId="prefillMcnId"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'
import DataTable from '~/components/ui/DataTable.vue'
import ChannelFormModal from '~/components/modals/ChannelFormModal.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { TableColumn } from '~/components/ui/DataTable.vue'
import type { ChannelFilters } from '~/composables/useChannels'
import type { YouTubeChannel } from '~/types/channel'
import type { User } from '~/types/user'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { channels, loading, error, pagination, fetchChannels, refresh: refreshChannels, deleteChannel } = useChannels()
const { organizations, loading: organizationsLoading, fetchOrganizations } = useOrganizations()
const { mcns, loading: mcnsLoading, fetchMcns } = useMcns()
const { success: showSuccessToast, error: showErrorToast } = useToast()

const isModalOpen = ref(false)
const selectedChannel = ref<YouTubeChannel | null>(null)
const prefillMcnId = ref<string | null>(null)

// Initialize from URL parameters
const searchBy = ref<'title'>((route.query.searchBy as 'title') || 'title')
const searchValue = ref((route.query.searchValue as string) || '')

const handleThumbnailError = (event: Event, row: any) => {
  // Hide the broken image and mark row as having thumbnail error
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Mark this row as having a thumbnail error so placeholder shows
  row._thumbnailError = true
}

const canCreate = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator' ||
    role === 'atlas_superadmin' ||
    role === 'atlas_admin'
  )
})

const canEdit = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator' ||
    role === 'atlas_superadmin' ||
    role === 'atlas_admin'
  )
})

const canDelete = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin'
  )
})

// Initialize filters from URL parameters
const filters = ref<ChannelFilters>({
  organization_id: (route.query.organization_id as string) || undefined,
  mcn_id: (route.query.mcn_id as string) || undefined,
  page: route.query.page ? parseInt(String(route.query.page), 10) : 1,
  page_size: 10,
})


const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'Channels' },
]

const columns: TableColumn[] = [
  { key: 'title', label: 'Channel Name' },
  { key: 'mcn_name', label: 'MCN' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'subscriber_count', label: 'Subscribers' },
  { key: 'view_count', label: 'Views' },
]

const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const applySearch = () => {
  const filterParams: ChannelFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  
  if (filters.value.organization_id) {
    filterParams.organization_id = filters.value.organization_id
  }
  if (filters.value.mcn_id) {
    filterParams.mcn_id = filters.value.mcn_id
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'title') {
      filterParams.title = searchValue.value.trim()
    }
  }
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      searchBy: searchBy.value,
      searchValue: searchValue.value.trim() || undefined,
      organization_id: filters.value.organization_id || undefined,
      mcn_id: filters.value.mcn_id || undefined,
      page: 1,
    }
  })
  
  fetchChannels(filterParams)
}

const clearFilters = () => {
  searchBy.value = 'title'
  searchValue.value = ''
  filters.value.organization_id = undefined
  filters.value.mcn_id = undefined
  filters.value.page = 1
  mcns.value = []
  
  // Update URL - clear all filters
  router.push({
    query: {
      page: 1,
    }
  })
  
  const filterParams: ChannelFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  fetchChannels(filterParams)
}

const applyFilters = async () => {
  const filterParams: ChannelFilters = {
    page: pagination.value.page,
    page_size: pagination.value.page_size || 10
  }
  
  if (filters.value.organization_id) {
    filterParams.organization_id = filters.value.organization_id
  }
  if (filters.value.mcn_id) {
    filterParams.mcn_id = filters.value.mcn_id
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'title') {
      filterParams.title = searchValue.value.trim()
    }
  }
  
  await fetchChannels(filterParams)
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.total_pages || loading.value) return
  
  const filterParams: ChannelFilters = {
    page,
    page_size: pagination.value.page_size || 10
  }
  
  if (filters.value.organization_id) {
    filterParams.organization_id = filters.value.organization_id
  }
  if (filters.value.mcn_id) {
    filterParams.mcn_id = filters.value.mcn_id
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'title') {
      filterParams.title = searchValue.value.trim()
    }
  }
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      page,
    }
  })
  
  fetchChannels(filterParams)
}

const visiblePages = computed(() => {
  const total = pagination.value.total_pages
  const current = pagination.value.page
  const pages: (number | string)[] = []
  
  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (current <= 4) {
      // Near the start
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // Near the end
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // In the middle
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const handleOrganizationChange = async () => {
  // Reset MCN filter when organization changes
  filters.value.mcn_id = undefined
  filters.value.page = 1

  // Fetch MCNs for selected organization
  if (filters.value.organization_id) {
    await fetchMcns(filters.value.organization_id)
  } else {
    mcns.value = []
  }

  // Update URL
  router.push({
    query: {
      ...route.query,
      organization_id: filters.value.organization_id || undefined,
      mcn_id: undefined,
      page: 1,
    }
  })

  // Reset to page 1 when filter changes
  const filterParams: ChannelFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  
  if (filters.value.organization_id) {
    filterParams.organization_id = filters.value.organization_id
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'title') {
      filterParams.title = searchValue.value.trim()
    }
  }
  
  await fetchChannels(filterParams)
}

const handleMcnChange = async () => {
  filters.value.page = 1
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      mcn_id: filters.value.mcn_id || undefined,
      page: 1,
    }
  })
  
  // Reset to page 1 when filter changes
  const filterParams: ChannelFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  
  if (filters.value.organization_id) {
    filterParams.organization_id = filters.value.organization_id
  }
  if (filters.value.mcn_id) {
    filterParams.mcn_id = filters.value.mcn_id
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'title') {
      filterParams.title = searchValue.value.trim()
    }
  }
  
  await fetchChannels(filterParams)
}

const handleCreate = () => {
  selectedChannel.value = null
  prefillMcnId.value = null
  isModalOpen.value = true
}

const handleEdit = (channel: YouTubeChannel) => {
  selectedChannel.value = channel
  prefillMcnId.value = null
  isModalOpen.value = true
}

const handleDelete = async (channel: YouTubeChannel) => {
  if (!confirm(`Delete channel "${channel.title}"? This can be undone by re-adding the channel.`)) {
    return
  }
  try {
    await deleteChannel(channel.id)
    showSuccessToast('Channel deleted successfully')
    await applyFilters()
  } catch {
    showErrorToast(error.value || 'Failed to delete channel')
  }
}

const handleModalClose = () => {
  isModalOpen.value = false
  selectedChannel.value = null
  prefillMcnId.value = null
}

const handleModalSuccess = async (channel: YouTubeChannel) => {
  const wasEdit = !!selectedChannel.value
  isModalOpen.value = false
  selectedChannel.value = null
  prefillMcnId.value = null

  showSuccessToast(wasEdit ? 'Channel updated successfully' : 'Channel created successfully')

  // Refresh the list
  await applyFilters()

  // Navigate to detail page if creating new channel
  if (!wasEdit) {
    router.push(`/app/channels/${channel.id}`)
  }
}

const refresh = async () => {
  await fetchOrganizations()
  if (filters.value.organization_id) {
    await fetchMcns(filters.value.organization_id)
  }
  await applyFilters()
}

onMounted(async () => {
  await fetchOrganizations()
  
  // Apply filters from URL
  const filterParams: ChannelFilters = {
    page: filters.value.page || 1,
    page_size: 10
  }
  
  if (filters.value.organization_id) {
    filterParams.organization_id = filters.value.organization_id
    await fetchMcns(filters.value.organization_id)
  }
  
  if (filters.value.mcn_id) {
    filterParams.mcn_id = filters.value.mcn_id
  }
  
  if (searchValue.value.trim() && searchBy.value === 'title') {
    filterParams.title = searchValue.value.trim()
  }
  
  await fetchChannels(filterParams)
})
</script>

