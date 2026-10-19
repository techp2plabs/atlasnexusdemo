<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Breadcrumb -->
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Page Header -->
    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">Organizations</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your organizations</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="canInvite"
          @click="handleInviteOrganizationOwner"
          class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Invite Organization Owner
        </button>
        <button
          v-if="canCreate"
          @click="handleCreate"
          class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Create Organization
        </button>
      </div>
    </div>

    <!-- Search Filters -->
    <div class="col-span-12">
      <div class="rounded-lg border border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <!-- Search By Dropdown -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search By
            </label>
            <select
              v-model="searchBy"
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="brand_name">Brand Name</option>
              <option value="name">Organization Name</option>
              <option value="owner_email">Owner Email</option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="md:col-span-2">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              v-model="searchValue"
              type="text"
              :placeholder="`Search by ${getSearchPlaceholder(searchBy)}...`"
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @keyup.enter="applySearch"
            />
          </div>

          <!-- Apply and Clear Buttons -->
          <div class="flex items-end gap-2">
            <button
              @click="applySearch"
              class="h-10 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Apply
            </button>
            <button
              @click="clearFilters"
              class="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
        :data="displayOrganizations"
        :loading="loading"
        empty-message="No organizations found. Create your first organization to get started."
      >
        <template #cell-brand_name="{ row }">
          <NuxtLink
            :to="`/app/organizations/${row.id}`"
            class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {{ row.brand_name || '—' }}
          </NuxtLink>
        </template>

        <template #cell-name="{ row }">
          <p class="text-foreground dark:text-white">
            {{ row.name || '—' }}
          </p>
        </template>

        <template #cell-owner_email="{ value }">
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

        <template #cell-mcn_count="{ row }">
          <NuxtLink
            v-if="row.mcn_count > 0"
            :to="`/app/organizations/${row.id}#mcns`"
            class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {{ row.mcn_count || 0 }}
          </NuxtLink>
          <span v-else class="text-gray-500 text-theme-sm dark:text-gray-400">
            {{ row.mcn_count || 0 }}
          </span>
        </template>

        <template #cell-channel_count="{ row }">
          <p
            class="text-gray-500 text-theme-sm dark:text-gray-400"
            :title="(row.deleted_channels_count || 0) > 0 ? `+ ${row.deleted_channels_count} removed (not shown)` : undefined"
          >
            {{ row.channel_count ?? row.mapped_channels_count ?? 0 }}<span
              v-if="(row.deleted_channels_count || 0) > 0"
              class="ml-1 text-xs text-gray-400 dark:text-gray-500"
            >+{{ row.deleted_channels_count }} removed</span>
          </p>
        </template>

        <template #cell-channel_mapping="{ row }">
          <div class="flex flex-col gap-1">
            <div class="text-foreground text-sm dark:text-white">
              <span v-if="typeof row.unmapped_channels_count === 'number' && typeof row.total_channels_count === 'number'">
                {{ row.unmapped_channels_count }} unmapped /
                <NuxtLink
                  :to="`/app/organizations/${row.id}?tab=channels`"
                  class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >{{ row.total_channels_count || 0 }} total</NuxtLink>
                <span
                  v-if="(row.archived_channels_count || 0) > 0"
                  class="ml-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  {{ row.archived_channels_count }} archived
                </span>
              </span>
              <span v-else class="text-gray-500 dark:text-gray-400">
                —
              </span>
            </div>
            <div v-if="typeof row.unmapped_channels_count === 'number'">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  row.unmapped_channels_count === 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                ]"
              >
                {{ row.unmapped_channels_count === 0 ? 'All mapped' : 'Has unmapped channels' }}
              </span>
            </div>
          </div>
        </template>

        <template #cell-created_at="{ value }">
          <p class="text-gray-500 text-theme-sm dark:text-gray-400">
            {{ formatDate(value) }}
          </p>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/app/organizations/${row.id}`"
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
        {{ pagination.total }} organizations
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

    <!-- Create/Edit Organization Modal -->
    <OrganizationFormModal
      :isOpen="isModalOpen"
      :organization="selectedOrganization"
      @close="handleCloseModal"
      @success="handleModalSuccess"
    />

    <!-- Invite Organization Owner Modal -->
    <InviteOrganizationOwnerModal
      :isOpen="isInviteModalOpen"
      @close="handleCloseInviteModal"
      @success="handleInviteModalSuccess"
    />

  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import DataTable from '~/components/ui/DataTable.vue'
import OrganizationFormModal from '~/components/modals/OrganizationFormModal.vue'
import InviteOrganizationOwnerModal from '~/components/modals/InviteOrganizationOwnerModal.vue'
import type { Organization } from '~/types/organization'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { TableColumn } from '~/components/ui/DataTable.vue'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { organizations, loading, error, pagination, fetchOrganizations, refresh } = useOrganizations()
const { success: showSuccessToast } = useToast()

const isModalOpen = ref(false)
const selectedOrganization = ref<Organization | null>(null)
const isInviteModalOpen = ref(false)

// Initialize from URL parameters
const searchBy = ref<'brand_name' | 'name' | 'owner_email'>(
  (route.query.searchBy as 'brand_name' | 'name' | 'owner_email') || 'brand_name'
)
const searchValue = ref((route.query.searchValue as string) || '')

const canCreate = computed(() => {
  return authStore.isAdmin
})

const canEdit = computed(() => {
  return authStore.isAdmin
})

const canInvite = computed(() => {
  return authStore.isAdmin
})

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'Organizations' },
]

const columns: TableColumn[] = [
  { key: 'brand_name', label: 'Brand Name' },
  { key: 'name', label: 'Organization Name' },
  { key: 'owner_email', label: 'Owner Email' },
  { key: 'status', label: 'Status' },
  { key: 'mcn_count', label: 'MCN Count' },
  { key: 'channel_count', label: 'Channel Count' },
  { key: 'channel_mapping', label: 'Channel Mapping' },
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

const getSearchPlaceholder = (field: string) => {
  switch (field) {
    case 'brand_name':
      return 'brand name'
    case 'name':
      return 'organization name'
    case 'owner_email':
      return 'owner email'
    default:
      return 'brand name'
  }
}

const showOnlyHasUnmapped = ref(false)

const displayOrganizations = computed(() => {
  let items = organizations.value || []
  if (showOnlyHasUnmapped.value) {
    items = items.filter((org) => (org.unmapped_channels_count || 0) > 0)
  }
  // Sort organizations on the current page by unmapped count (desc) when filter is active
  return [...items].sort((a, b) => {
    const aUnmapped = a.unmapped_channels_count || 0
    const bUnmapped = b.unmapped_channels_count || 0
    return bUnmapped - aUnmapped
  })
})

const applySearch = () => {
  const filters: any = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  if (searchValue.value.trim()) {
    filters[searchBy.value] = searchValue.value.trim()
  }
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      searchBy: searchBy.value,
      searchValue: searchValue.value.trim() || undefined,
      page: 1,
    }
  })
  
  fetchOrganizations(filters)
}

const clearFilters = () => {
  searchBy.value = 'brand_name'
  searchValue.value = ''
  
  // Update URL - clear all filters
  router.push({
    query: {
      page: 1,
    }
  })
  
  const filters: any = {
    page: 1,
    page_size: pagination.value.page_size || 10
  }
  fetchOrganizations(filters)
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.total_pages || loading.value) return
  
  const filters: any = {
    page,
    page_size: pagination.value.page_size || 10
  }
  if (searchValue.value.trim()) {
    filters[searchBy.value] = searchValue.value.trim()
  }
  
  // Update URL
  router.push({
    query: {
      ...route.query,
      page,
    }
  })
  
  fetchOrganizations(filters)
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

const handleCreate = () => {
  selectedOrganization.value = null
  isModalOpen.value = true
}

const handleEdit = (organization: Organization) => {
  selectedOrganization.value = organization
  isModalOpen.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
  selectedOrganization.value = null
}

const handleModalSuccess = async (organization: Organization) => {
  const wasEdit = !!selectedOrganization.value
  
  // Update selectedOrganization with the latest data so logo displays correctly
  if (wasEdit && selectedOrganization.value) {
    selectedOrganization.value = organization
  }
  
  isModalOpen.value = false
  selectedOrganization.value = null

  const message = wasEdit
    ? `Organization "${organization.name}" updated successfully`
    : `Organization "${organization.name}" created successfully`

  showSuccessToast(message)

  // Refresh the list with current filters
  const filters: any = {
    page: pagination.value.page,
    page_size: pagination.value.page_size || 10
  }
  if (searchValue.value.trim()) {
    filters[searchBy.value] = searchValue.value.trim()
  }
  await refresh(filters)

  // Navigate to detail page if it was a create operation
  if (!wasEdit) {
    router.push(`/app/organizations/${organization.id}`)
  }
}

const handleInviteOrganizationOwner = () => {
  isInviteModalOpen.value = true
}

const handleCloseInviteModal = () => {
  isInviteModalOpen.value = false
}

const handleInviteModalSuccess = async () => {
  isInviteModalOpen.value = false
  // Refresh the list to show updated owner_email if applicable
  const filters: any = {
    page: pagination.value.page,
    page_size: pagination.value.page_size || 10
  }
  if (searchValue.value.trim()) {
    filters[searchBy.value] = searchValue.value.trim()
  }
  await refresh(filters)
}

// Parse URL parameters and apply filters
const parseUrlParams = () => {
  const query = route.query
  
  // Parse search parameters
  if (query.searchBy && ['brand_name', 'name', 'owner_email'].includes(String(query.searchBy))) {
    searchBy.value = query.searchBy as 'brand_name' | 'name' | 'owner_email'
  }
  if (query.searchValue && typeof query.searchValue === 'string') {
    searchValue.value = query.searchValue
  }
  
  // Parse page
  const page = query.page ? parseInt(String(query.page), 10) : 1
  
  // Apply filters from URL
  const filterParams: any = {
    page: isNaN(page) ? 1 : page,
    page_size: 10
  }
  
  if (searchValue.value.trim()) {
    filterParams[searchBy.value] = searchValue.value.trim()
  }
  
  return filterParams
}

onMounted(() => {
  // Parse URL parameters and apply filters
  const filterParams = parseUrlParams()
  fetchOrganizations(filterParams)
})
</script>

