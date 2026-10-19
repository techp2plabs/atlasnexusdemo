<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Breadcrumb -->
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Page Header -->
    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">MCN Partners</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your MCN Partners</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="canInviteMcnAdmin"
          @click="handleInviteMcnAdmin"
          class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Invite MCN Admin
        </button>
        <button
          v-if="canCreate"
          @click="handleCreate"
          class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Add MCN Partner
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="col-span-12">
      <div class="rounded-lg border border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Organization Filter (Superadmin only) -->
          <div v-if="isSuperadmin">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Organization
            </label>
            <select
              :value="selectedOrganizationId || ''"
              @change="handleOrganizationFilterSelectChange"
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="filterLoading"
            >
              <option value="">All Organizations</option>
              <option
                v-for="org in filterOrganizations"
                :key="org.id"
                :value="org.id"
              >
                {{ org.name }}
              </option>
            </select>
          </div>

          <!-- Search Field Dropdown and Input -->
          <div :class="isSuperadmin ? 'md:col-span-2' : 'md:col-span-3'">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div class="flex gap-2">
              <select
                v-model="searchBy"
                class="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Partner Name</option>
                <option value="alias">Alias</option>
              </select>
              <input
                v-model="searchValue"
                type="text"
                :placeholder="`Search by ${searchBy === 'name' ? 'partner name' : 'alias'}...`"
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
            @click="handleRetry"
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
        :data="mcns"
        :loading="loading"
        empty-message="No MCN Partners found. Create your first MCN Partner to get started."
      >
        <template #cell-partner_type="{ value }">
          <span
            :class="[
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              value === 'inhouse'
                ? 'bg-accent text-brand-800 dark:bg-brand-900/30 dark:text-brand-300'
                : value === 'agency'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            ]"
          >
            {{ getPartnerTypeLabel(value) }}
          </span>
        </template>
        <template #emptyState>
          <div class="text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent dark:bg-brand-900/30">
              <svg class="h-6 w-6 text-accent-foreground dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="mb-1 text-sm font-medium text-foreground dark:text-white">No MCN Partners found</h3>
            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first MCN Partner.</p>
            <button
              v-if="canCreate"
              @click="handleCreate"
              class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              + Create MCN Partner
            </button>
          </div>
        </template>
        <template #cell-name="{ row }">
          <NuxtLink
            :to="`/app/mcns/${row.id}`"
            class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {{ row.name }}
          </NuxtLink>
        </template>

        <template #cell-organization_name="{ value }">
          <p class="text-gray-500 text-theme-sm dark:text-gray-400">
            {{ value || '—' }}
          </p>
        </template>

        <template #cell-status="{ value }">
          <span
            :class="[
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              value === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            ]"
          >
            {{ value === 'active' ? 'Active' : value || 'Active' }}
          </span>
        </template>

        <template #cell-channel_count="{ value }">
          <p class="text-gray-500 text-theme-sm dark:text-gray-400">
            {{ value || 0 }}
          </p>
        </template>

        <template #cell-created_at="{ value }">
          <p class="text-gray-500 text-theme-sm dark:text-gray-400">
            {{ formatDate(value) }}
          </p>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/app/mcns/${row.id}`"
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
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total_pages > 1" class="col-span-12 flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (pagination.page - 1) * pagination.page_size + 1 }} to
        {{ Math.min(pagination.page * pagination.page_size, pagination.total) }} of
        {{ pagination.total }} MCN Partners
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

    <!-- MCN Form Modal (prefill org when filtered by organization, same as org detail tab) -->
    <MCNFormModal
      :isOpen="isModalOpen"
      :mcn="selectedMcn"
      :prefillOrganizationId="selectedOrganizationId || undefined"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />

    <!-- Invite MCN Admin Modal -->
    <InviteMCNAdminModal
      :isOpen="isInviteMcnAdminModalOpen"
      @close="handleCloseInviteMcnAdminModal"
      @success="handleInviteMcnAdminModalSuccess"
    />

  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import DataTable from '~/components/ui/DataTable.vue'
import MCNFormModal from '~/components/modals/MCNFormModal.vue'
import InviteMCNAdminModal from '~/components/modals/InviteMCNAdminModal.vue'
import type { MCN } from '~/types/mcn'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { TableColumn } from '~/components/ui/DataTable.vue'
import { getPartnerTypeLabel } from '~/composables/useMcns'
import type { MCNFilters } from '~/composables/useMcns'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { mcns, loading, error, pagination, fetchMcns, refresh } = useMcns()
const { 
  selectedOrganizationId, 
  organizations: filterOrganizations, 
  loading: filterLoading, 
  isSuperadmin, 
  fetchOrganizations, 
  setSelectedOrganization 
} = useOrganizationFilter()

const isModalOpen = ref(false)
const selectedMcn = ref<MCN | null>(null)
const isInviteMcnAdminModalOpen = ref(false)

// Initialize from URL parameters
const searchBy = ref<'name' | 'alias'>((route.query.searchBy as 'name' | 'alias') || 'name')
const searchValue = ref((route.query.searchValue as string) || '')

const canCreate = useCanCreateMcnPartner()

const canEdit = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'atlas_superadmin' ||
    role === 'atlas_admin'
  )
})

const canInviteMcnAdmin = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin'
  )
})

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'MCN Partners' },
]

const columns: TableColumn[] = [
  { key: 'name', label: 'Partner Name' },
  { key: 'partner_type', label: 'Partner Type' },
  { key: 'alias', label: 'Alias' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'status', label: 'Status' },
  { key: 'channel_count', label: 'Channel Count' },
  { key: 'created_at', label: 'Created Date' },
]

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const handleCreate = () => {
  selectedMcn.value = null
  isModalOpen.value = true
}

const handleEdit = (row: Record<string, any>) => {
  // Cast row to MCN type. DataTable uses Record<string, any> but we know it's MCN data
  const mcn = row as unknown as MCN
  selectedMcn.value = mcn
  isModalOpen.value = true
}

const handleModalClose = () => {
  isModalOpen.value = false
  selectedMcn.value = null
}

const handleModalSuccess = async (mcn: MCN) => {
  const wasEdit = !!selectedMcn.value
  isModalOpen.value = false
  selectedMcn.value = null
  
  const { success } = useToast()
  success(wasEdit ? 'MCN Partner updated successfully' : 'MCN Partner created successfully')
  
  // Refresh the list
  const filters: MCNFilters = {
    page: pagination.value.page,
    page_size: pagination.value.page_size || 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filters.organization_id = orgId
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filters.name = searchValue.value.trim()
    } else {
      filters.alias = searchValue.value.trim()
    }
  }
  
  await fetchMcns(filters)
  
  // Navigate to detail Contracts tab if creating new MCN
  if (!wasEdit) {
    router.push(`/app/mcns/${mcn.id}?tab=contracts`)
  }
}

const applySearch = () => {
  const filters: MCNFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filters.organization_id = orgId
  } else {
    filters.organization_id = null
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filters.name = searchValue.value.trim()
    } else {
      filters.alias = searchValue.value.trim()
    }
  }
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      searchBy: searchBy.value,
      searchValue: searchValue.value.trim() || undefined,
      page: 1,
      organization_id: orgId || undefined,
    }
  })
  
  fetchMcns(filters)
}

const clearFilters = () => {
  searchBy.value = 'name'
  searchValue.value = ''
  if (isSuperadmin.value) {
    setSelectedOrganization(null)
  }
  
  // Update URL - clear all filters
  router.push({
    query: {
      page: 1,
    }
  })
  
  const filters: MCNFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10,
    organization_id: null
  }
  fetchMcns(filters)
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.total_pages || loading.value) return
  
  const filters: MCNFilters = {
    page,
    page_size: pagination.value.page_size || 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filters.organization_id = orgId
  } else {
    filters.organization_id = null
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filters.name = searchValue.value.trim()
    } else {
      filters.alias = searchValue.value.trim()
    }
  }
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      page,
    }
  })
  
  fetchMcns(filters)
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

const handleOrganizationFilterSelectChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  // Convert empty string to null for "All Organizations"
  const orgId = value === '' || value === 'null' || value === null ? null : value
  setSelectedOrganization(orgId)
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      organization_id: orgId || undefined,
      page: 1,
    }
  })
  
  await handleOrganizationFilterChange()
}

const handleOrganizationFilterChange = async () => {
  // Reset to page 1 when organization filter changes
  const filters: MCNFilters = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filters.organization_id = orgId
  } else {
    filters.organization_id = null
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filters.name = searchValue.value.trim()
    } else {
      filters.alias = searchValue.value.trim()
    }
  }
  
  await fetchMcns(filters)
}

const handleRetry = () => {
  const filters: MCNFilters = {
    page: pagination.value.page,
    page_size: pagination.value.page_size || 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filters.organization_id = orgId
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filters.name = searchValue.value.trim()
    } else {
      filters.alias = searchValue.value.trim()
    }
  }
  
  fetchMcns(filters)
}

const handleInviteMcnAdmin = () => {
  isInviteMcnAdminModalOpen.value = true
}

const handleCloseInviteMcnAdminModal = () => {
  isInviteMcnAdminModalOpen.value = false
}

const handleInviteMcnAdminModalSuccess = async () => {
  isInviteMcnAdminModalOpen.value = false
  // Refresh the list
  const filters: MCNFilters = {
    page: pagination.value.page,
    page_size: pagination.value.page_size || 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filters.organization_id = orgId
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filters.name = searchValue.value.trim()
    } else {
      filters.alias = searchValue.value.trim()
    }
  }
  
  await fetchMcns(filters)
}

// Parse URL parameters and apply filters
const parseUrlParams = () => {
  const query = route.query
  
  // Parse search parameters
  if (query.searchBy && (query.searchBy === 'name' || query.searchBy === 'alias')) {
    searchBy.value = query.searchBy
  }
  if (query.searchValue && typeof query.searchValue === 'string') {
    searchValue.value = query.searchValue
  }
  
  // Parse organization filter
  if (query.organization_id && typeof query.organization_id === 'string') {
    setSelectedOrganization(query.organization_id)
  } else {
    setSelectedOrganization(null)
  }
  
  // Parse page
  const page = query.page ? parseInt(String(query.page), 10) : 1
  
  // Apply filters from URL
  const filterParams: MCNFilters = {
    page: isNaN(page) ? 1 : page,
    page_size: 10
  }
  
  const orgId = selectedOrganizationId.value
  if (orgId) {
    filterParams.organization_id = orgId
  } else {
    filterParams.organization_id = null
  }
  
  if (searchValue.value.trim()) {
    if (searchBy.value === 'name') {
      filterParams.name = searchValue.value.trim()
    } else {
      filterParams.alias = searchValue.value.trim()
    }
  }
  
  return filterParams
}

onMounted(async () => {
  // Fetch organizations for filter if superadmin
  if (isSuperadmin.value) {
    await fetchOrganizations()
  }
  
  // Parse URL parameters and apply filters
  const filterParams = parseUrlParams()
  await fetchMcns(filterParams)
})
</script>

