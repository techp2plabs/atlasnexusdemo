<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Breadcrumb -->
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Loading State -->
    <div v-if="loading && !organization" class="col-span-12">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading organization...</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !loading" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</p>
              <p v-if="error === 'Organization not found'" class="mt-1 text-xs text-red-600 dark:text-red-400">
                The organization you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              v-if="error === 'Organization not found'"
              to="/app/organizations"
              class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Back to Organizations
            </NuxtLink>
            <button
              v-else
              @click="loadOrganization"
              class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Organization Detail Content -->
    <template v-else-if="organization">
      <!-- Page Header -->
      <div class="col-span-12 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ organization.name }}</h1>
          <p class="text-gray-600 dark:text-gray-400">Organization details and management</p>
        </div>
        <button
          v-if="canEdit"
          @click="handleEdit"
          class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Edit
        </button>
      </div>

      <!-- Tabs -->
      <div class="col-span-12">
        <Tabs :tabs="tabs" v-model="activeTab">
          <!-- Overview Tab -->
          <template #overview>
            <div class="space-y-6">
              <!-- Basic Info Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Basic Information</h2>
                <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Organization Name</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ organization.name }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Email</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ organization.owner_email || '—' }}</dd>
                  </div>
                  <div v-if="organization.address">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ organization.address }}</dd>
                  </div>
                  <div v-if="organization.tax_id">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ organization.tax_id }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd class="mt-1">
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          organization.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                        ]"
                      >
                        {{ organization.status === 'active' ? 'Active' : organization.status || 'Active' }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ formatDate(organization.created_at) }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Summary Metrics Cards -->
              <div>
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Summary Metrics</h2>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <!-- Total MCN Partners Card -->
                  <div
                    @click="router.push({ query: { tab: 'mcns' } })"
                    class="cursor-pointer rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total MCN Partners</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ organization.mcn_count || 0 }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent dark:bg-brand-900/20">
                        <svg class="h-6 w-6 text-accent-foreground dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Total Channels Card -->
                  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Channels</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">
                          {{ organization.total_channels_count ?? organization.channel_count ?? 0 }}
                        </p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Total Revenue Card -->
                  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">Coming Soon</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Active Contracts Card -->
                  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Contracts</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ activeContractsCount }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                        <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Content Owners Card -->
                  <div
                    @click="router.push({ query: { tab: 'content-owners' } })"
                    class="cursor-pointer rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Content Owners</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ organizationContentOwners.filter((co: ContentOwner) => co.is_active).length }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Channel Mapping Status -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h2 class="text-lg font-semibold text-foreground dark:text-white">Channel Mapping Status</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Overview of mapped vs unmapped channels for this organization.
                    </p>
                  </div>
                  <button
                    @click="router.push({ query: { tab: 'content-owners' } })"
                    class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Manage Mapping
                  </button>
                </div>

                <!-- Archived gap warning -->
                <div
                  v-if="(organization.archived_channels_count ?? 0) > 0"
                  class="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
                >
                  <svg class="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {{ organization.archived_channels_count }} channel(s) no longer found in the latest YouTube sync
                    </p>
                    <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      They've been moved to Archived instead of counting as unmapped. Open a Content Owner's
                      <button
                        type="button"
                        @click="router.push({ query: { tab: 'content-owners' } })"
                        class="underline hover:no-underline"
                      >Mapping</button>
                      page and check the Archived tab to review them.
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-4 mb-4">
                  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Unmapped Channels</p>
                    <p class="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {{ organization.unmapped_channels_count ?? 0 }}
                    </p>
                  </div>
                  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Mapped Channels</p>
                    <p class="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                      {{ organization.mapped_channels_count ?? 0 }}
                    </p>
                  </div>
                  <div
                    class="rounded-lg p-4"
                    :class="(organization.archived_channels_count ?? 0) > 0
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'"
                  >
                    <p class="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Archived Channels
                      <svg v-if="(organization.archived_channels_count ?? 0) > 0" class="h-3.5 w-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </p>
                    <p
                      class="mt-2 text-2xl font-bold"
                      :class="(organization.archived_channels_count ?? 0) > 0
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-gray-500 dark:text-gray-400'"
                    >
                      {{ organization.archived_channels_count ?? 0 }}
                    </p>
                  </div>
                  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Channels</p>
                    <p class="mt-2 text-2xl font-bold text-foreground dark:text-white">
                      {{ organization.total_channels_count ?? organization.channel_count ?? 0 }}
                    </p>
                  </div>
                </div>

                <div v-if="topUnmappedChannels.length > 0" class="mt-4">
                  <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top Unmapped Channels
                  </h3>
                  <ul class="divide-y divide-gray-200 dark:divide-gray-800">
                    <li
                      v-for="channel in topUnmappedChannels"
                      :key="channel.id"
                      class="flex items-center justify-between py-3"
                    >
                      <div class="flex items-center gap-3">
                        <img
                          v-if="channel.thumbnail_url"
                          :src="channel.thumbnail_url"
                          :alt="channel.title || channel.channel_id"
                          class="h-8 w-8 rounded-full object-cover"
                        />
                        <div
                          v-else
                          class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
                        >
                          <YoutubeIcon variant="black" class="h-5 w-5" />
                        </div>
                        <div>
                          <p class="text-sm font-medium text-foreground dark:text-white">
                            {{ channel.title || channel.channel_id }}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            Content Owner: {{ channel.content_owner_id }}
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatNumber(channel.subscriber_count) }} subscribers
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatNumber(channel.view_count) }} views
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No unmapped channels snapshot available yet. Fetch channels and start mapping from the Content Owners tab.
                </div>
              </div>

              <!-- Quick Actions Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Quick Actions</h2>
                <div class="flex flex-wrap gap-4">
                  <button
                    @click="handleAddMCN"
                    class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    + Add MCN Partner
                  </button>
                  <button
                    v-if="canEdit"
                    @click="handleAddContentOwner"
                    class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    + Add Content Owner
                  </button>
                  <button
                    v-if="canInvite"
                    @click="handleInviteOrganizationOwner"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Invite Organization Owner
                  </button>
                  <button
                    v-if="canInviteMcnAdmin"
                    @click="handleInviteMcnAdmin"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Invite MCN Admin
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Content Owners Tab -->
          <template #content-owners>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Content Owners</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage YouTube Content Owners for financial reporting</p>
                </div>
                <button
                  v-if="canEdit"
                  @click="handleAddContentOwner"
                  class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  + Add Content Owner
                </button>
              </div>

              <div class="space-y-4">
                <DataTable
                  :columns="contentOwnerColumns"
                  :data="organizationContentOwners"
                  :loading="contentOwnersLoading"
                  empty-message="No content owners found. Add a content owner to get started with YouTube financial reporting."
                >
                  <template #cell-content_owner_id="{ value }">
                    <code class="rounded bg-gray-100 px-2 py-1 text-xs text-foreground dark:bg-gray-800 dark:text-white">
                      {{ value }}
                    </code>
                  </template>
                  <template #cell-display_name="{ value }">
                    <p class="text-gray-600 dark:text-gray-400">{{ value || '—' }}</p>
                  </template>
                  <template #cell-is_active="{ value }">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        value
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                      ]"
                    >
                      {{ value ? 'Active' : 'Inactive' }}
                    </span>
                  </template>
                  <template #cell-created_at="{ value }">
                    <p class="text-gray-500 text-sm dark:text-gray-400">
                      {{ formatDate(value) }}
                    </p>
                  </template>
                  <template #actions="{ row }">
                    <div class="flex items-center gap-2">
                      <button
                        v-if="row.is_active"
                        @click="handleFetchChannels(row)"
                        class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                      >
                        Fetch Channels
                      </button>
                      <button
                        v-if="row.is_active"
                        @click="handleOpenMappingModal(row)"
                        class="rounded bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        Mapping
                      </button>
                      <button
                        v-if="canEdit"
                        @click="handleEditContentOwner(row)"
                        class="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        v-if="canEdit"
                        @click="handleDeleteContentOwner(row)"
                        class="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        Delete
                      </button>
                    </div>
                  </template>
                </DataTable>

              </div>
            </div>
          </template>

          <!-- MCN Partners Tab -->
          <template #mcns>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">MCN Partners</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage MCN Partners in this organization</p>
                </div>
                <button
                  @click="handleAddMCN"
                  class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  + Add MCN Partner
                </button>
              </div>

              <DataTable
                :columns="mcnColumns"
                :data="organizationMcns"
                :loading="mcnsLoading"
                empty-message="No MCN Partners found in this organization. Add an MCN Partner to get started."
              >
                <template #cell-name="{ row }">
                  <NuxtLink
                    :to="`/app/mcns/${row.id}`"
                    class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {{ row.name }}
                  </NuxtLink>
                </template>
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
                <template #cell-alias="{ value }">
                  <p class="text-gray-600 dark:text-gray-400">{{ value || '—' }}</p>
                </template>
                <template #cell-channel_count="{ row }">
                  <button
                    type="button"
                    @click="filterChannelsByMcn(row.id)"
                    class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    :title="(row.deleted_channels_count || 0) > 0 ? `+ ${row.deleted_channels_count} removed (not shown)` : undefined"
                  >
                    {{ row.channel_count || 0 }}
                  </button>
                </template>
                <template #actions="{ row }">
                  <NuxtLink
                    :to="`/app/mcns/${row.id}`"
                    class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                  >
                    View
                  </NuxtLink>
                </template>
              </DataTable>

              <!-- MCN totals footer: self-verifying against Overview total -->
              <div v-if="organizationMcns.length > 0" class="rounded-lg border border-border bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                Total across {{ organizationMcns.length }} partner(s):
                <span class="font-semibold text-foreground dark:text-white">{{ mcnChannelsTotal }} channels</span>
                <span class="text-gray-500 dark:text-gray-500">({{ mcnChannelsBreakdown }})</span>
                <span class="ml-1">— sums to the org Total Channels above.</span>
              </div>
            </div>
          </template>

          <!-- Channels Tab -->
          <template #channels>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Channels</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">All channels across MCNs in this organization</p>
                </div>
              </div>

              <!-- Channel summary strip: reconciles with Overview totals -->
              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Mapped Channels</p>
                  <p class="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                    {{ organization?.mapped_channels_count ?? channelsPagination.total ?? 0 }}
                  </p>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Unmapped Channels</p>
                  <button
                    type="button"
                    @click="router.push({ query: { ...route.query, tab: 'content-owners' } })"
                    class="mt-2 text-2xl font-bold text-yellow-700 hover:underline dark:text-yellow-300"
                  >
                    {{ organization?.unmapped_channels_count ?? 0 }}
                  </button>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Archived Channels</p>
                  <p class="mt-2 text-2xl font-bold text-gray-500 dark:text-gray-400">
                    {{ organization?.archived_channels_count ?? 0 }}
                  </p>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Showing</p>
                  <p class="mt-2 text-2xl font-bold text-foreground dark:text-white">
                    {{ channelsPagination.total > 0 ? `${(channelsPagination.page - 1) * channelsPagination.page_size + 1}–${Math.min(channelsPagination.page * channelsPagination.page_size, channelsPagination.total)} of ${channelsPagination.total}` : `0 of ${channelsPagination.total}` }}
                  </p>
                </div>
              </div>

              <!-- Channel controls: search + MCN filter + sort + page size -->
              <div class="flex flex-col gap-3 md:flex-row md:items-end">
                <div class="flex-1">
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search channels</label>
                  <input
                    v-model="channelSearch"
                    type="text"
                    placeholder="Search by channel name..."
                    class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    @input="onChannelFilterChange"
                  />
                </div>
                <div class="md:w-56">
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">MCN Partner</label>
                  <select
                    v-model="channelMcnFilter"
                    class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    @change="onChannelFilterChange"
                  >
                    <option value="">All partners</option>
                    <option v-for="mcn in organizationMcns" :key="mcn.id" :value="mcn.id">
                      {{ mcn.name }} ({{ mcn.channel_count || 0 }})
                    </option>
                  </select>
                </div>
                <div class="md:w-56">
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
                  <select
                    v-model="channelSort"
                    class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    @change="onChannelFilterChange"
                  >
                    <option value="created_at:desc">Newest</option>
                    <option value="title:asc">Title A–Z</option>
                    <option value="subscriber_count:desc">Most subscribers</option>
                    <option value="view_count:desc">Most views</option>
                  </select>
                </div>
                <div class="md:w-28">
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Per page</label>
                  <select
                    v-model.number="channelPageSize"
                    class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    @change="onChannelFilterChange"
                  >
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                  </select>
                </div>
              </div>

              <DataTable
                :columns="channelColumns"
                :data="organizationChannels"
                :loading="channelsLoading"
                empty-message="No channels found in this organization."
              >
                <template #cell-title="{ row }">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="row.thumbnail_url"
                      :src="row.thumbnail_url"
                      :alt="row.title"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
                    >
                      <YoutubeIcon variant="black" class="h-6 w-6" />
                    </div>
                    <div>
                      <p class="font-medium text-foreground dark:text-white">{{ row.title }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ row.mcn_name || 'No MCN' }}</p>
                    </div>
                  </div>
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
                <template #cell-mcn_name="{ value }">
                  <p class="text-gray-500 text-sm dark:text-gray-400">
                    {{ value || 'No MCN' }}
                  </p>
                </template>
                <template #actions="{ row }">
                  <NuxtLink
                    :to="`/app/channels/${row.id}`"
                    class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                  >
                    View
                  </NuxtLink>
                </template>
              </DataTable>

              <!-- Channels pagination -->
              <div v-if="channelsPagination.total_pages > 1" class="flex items-center justify-between">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Showing {{ (channelsPagination.page - 1) * channelsPagination.page_size + 1 }} to
                  {{ Math.min(channelsPagination.page * channelsPagination.page_size, channelsPagination.total) }} of
                  {{ channelsPagination.total }} channels
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="goToChannelPage(channelsPagination.page - 1)"
                    :disabled="channelsPagination.page <= 1 || channelsLoading"
                    class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="pageNum in visibleChannelPages"
                      :key="pageNum"
                      @click="goToChannelPage(pageNum)"
                      :class="[
                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pageNum === channelsPagination.page
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                        pageNum === '...' ? 'border-none bg-transparent hover:bg-transparent cursor-default' : ''
                      ]"
                      :disabled="pageNum === '...' || channelsLoading"
                    >
                      {{ pageNum }}
                    </button>
                  </div>
                  <button
                    @click="goToChannelPage(channelsPagination.page + 1)"
                    :disabled="channelsPagination.page >= channelsPagination.total_pages || channelsLoading"
                    class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Contracts Tab -->
          <template #contracts>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Contracts</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage contracts for this organization</p>
                </div>
              </div>

              <DataTable
                :columns="contractColumns"
                :data="organizationContracts"
                :loading="contractsLoading"
                empty-message="No contracts found for this organization."
              >
                <template #cell-contract_number="{ value }">
                  <span class="font-mono text-sm font-medium text-foreground dark:text-white">
                    {{ value || '—' }}
                  </span>
                </template>
                <template #cell-entity_name="{ row }">
                  <div>
                    <p class="font-medium text-foreground dark:text-white">{{ row.entity_name || '—' }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ getContractTypeLabel(row.contract_type) }}</p>
                  </div>
                </template>
                <template #cell-revenue_share_pct="{ value }">
                  <span class="font-semibold text-accent-foreground dark:text-brand-400">
                    {{ value }}%
                  </span>
                </template>
                <template #cell-start_date="{ value }">
                  <p class="text-gray-500 text-sm dark:text-gray-400">
                    {{ formatDate(value) }}
                  </p>
                </template>
                <template #cell-end_date="{ row }">
                  <ContractEndDateCell :row="row as Contract" />
                </template>
                <template #cell-status="{ row }">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      getStatusColor(row.status),
                    ]"
                  >
                    {{ getStatusLabel(row.status) }}
                  </span>
                </template>
                <template #actions="{ row }">
                  <NuxtLink
                    :to="`/app/contracts/${row.id}`"
                    class="text-accent-foreground hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                  >
                    Manage
                  </NuxtLink>
                </template>
              </DataTable>
            </div>
          </template>

          <!-- Users Tab -->
          <template #users>
            <div class="space-y-6">
              <!-- Page Header -->
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Users</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage users in this organization</p>
                </div>
                <div class="flex gap-3">
                  <button
                    v-if="canInvite"
                    @click="handleInviteOrganizationOwner"
                    class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Invite Organization Owner
                  </button>
                  <button
                    v-if="canInviteMcnAdmin"
                    @click="handleInviteMcnAdmin"
                    class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Invite User
                  </button>
                </div>
              </div>

              <!-- Error State -->
              <div v-if="usersError && !usersLoading" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-red-800 dark:text-red-300">{{ usersError }}</p>
                  </div>
                  <button
                    @click="loadUsers"
                    class="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
                  >
                    Retry
                  </button>
                </div>
              </div>

              <!-- Users Table -->
              <div v-else>
                <DataTable
                  :columns="userColumns"
                  :data="organizationUsers"
                  :loading="usersLoading"
                  empty-message="No users found in this organization. Invite users to get started."
                >
                  <template #cell-name="{ row }">
                    <p class="font-medium text-foreground dark:text-white">{{ row.name }}</p>
                  </template>

                  <template #cell-email="{ value }">
                    <p class="text-gray-600 dark:text-gray-400">{{ value }}</p>
                  </template>

                  <template #cell-role="{ value }">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {{ formatRoleName(value) }}
                    </span>
                  </template>

                  <template #cell-status="{ value }">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        value === 'pending_verification'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : value === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                      ]"
                    >
                      {{ formatStatus(value) }}
                    </span>
                  </template>

                  <template #actions="{ row }">
                    <div class="flex items-center gap-2">
                      <button
                        v-if="canEditUser"
                        @click="handleEditUser(row as User)"
                        class="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        v-if="canDeleteUser"
                        @click="handleDeleteUser(row as User)"
                        class="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        Delete
                      </button>
                    </div>
                  </template>
                </DataTable>
              </div>
            </div>
          </template>
        </Tabs>
      </div>
    </template>

    <!-- Edit Organization Modal -->
    <OrganizationFormModal
      :isOpen="isEditModalOpen"
      :organization="organization"
      @close="handleCloseEditModal"
      @success="handleEditModalSuccess"
    />

    <!-- MCN Form Modal -->
    <MCNFormModal
      :isOpen="isMCNModalOpen"
      :prefillOrganizationId="organization?.id"
      @close="handleMCNModalClose"
      @success="handleMCNModalSuccess"
    />

    <!-- Invite Organization Owner Modal -->
    <InviteOrganizationOwnerModal
      :isOpen="isInviteModalOpen"
      :prefillOrganizationId="organization?.id"
      @close="handleCloseInviteModal"
      @success="handleInviteModalSuccess"
    />

    <!-- Invite MCN Admin Modal -->
    <InviteMCNAdminModal
      :isOpen="isInviteMcnAdminModalOpen"
      :prefillOrganizationId="organization?.id"
      @close="handleCloseInviteMcnAdminModal"
      @success="handleInviteMcnAdminModalSuccess"
    />

    <!-- Edit User Modal -->
    <EditUserModal
      :isOpen="isEditUserModalOpen"
      :user="selectedUser"
      @close="handleEditUserModalClose"
      @success="handleEditUserModalSuccess"
    />

    <!-- Delete User Modal -->
    <DeleteUserModal
      :isOpen="isDeleteUserModalOpen"
      :user="selectedUser"
      @close="handleDeleteUserModalClose"
      @success="handleDeleteUserModalSuccess"
    />

    <!-- Content Owner Form Modal -->
    <ContentOwnerFormModal
      :isOpen="isContentOwnerModalOpen"
      :contentOwner="selectedContentOwner"
      :prefillOrganizationId="organization?.id"
      @close="handleContentOwnerModalClose"
      @success="handleContentOwnerModalSuccess"
    />

    <!-- Delete Content Owner Modal -->
    <DeleteContentOwnerModal
      :isOpen="isDeleteContentOwnerModalOpen"
      :contentOwner="selectedContentOwner"
      @close="handleDeleteContentOwnerModalClose"
      @success="handleDeleteContentOwnerModalSuccess"
    />

    <!-- Fetch Channels Modal -->
    <FetchChannelsModal
      v-if="selectedContentOwnerForFetch"
      :isOpen="isFetchChannelsModalOpen"
      :contentOwnerId="selectedContentOwnerForFetch.content_owner_id"
      :organizationId="organization?.id"
      @close="handleFetchChannelsModalClose"
      @success="handleFetchChannelsModalSuccess"
      @map-channels="handleMapChannels"
    />

  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Tabs from '~/components/common/Tabs.vue'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'
import ContractEndDateCell from '~/components/contracts/ContractEndDateCell.vue'
import DataTable from '~/components/ui/DataTable.vue'
import OrganizationFormModal from '~/components/modals/OrganizationFormModal.vue'
import MCNFormModal from '~/components/modals/MCNFormModal.vue'
import InviteOrganizationOwnerModal from '~/components/modals/InviteOrganizationOwnerModal.vue'
import InviteMCNAdminModal from '~/components/modals/InviteMCNAdminModal.vue'
import EditUserModal from '~/components/modals/EditUserModal.vue'
import DeleteUserModal from '~/components/modals/DeleteUserModal.vue'
import ContentOwnerFormModal from '~/components/modals/ContentOwnerFormModal.vue'
import DeleteContentOwnerModal from '~/components/modals/DeleteContentOwnerModal.vue'
import FetchChannelsModal from '~/components/modals/FetchChannelsModal.vue'
import type { Organization } from '~/types/organization'
import type { MCN } from '~/types/mcn'
import { getPartnerTypeLabel } from '~/composables/useMcns'
import { useFetchChannels } from '~/composables/useFetchChannels'
import type { User } from '~/types/user'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { Tab } from '~/components/common/Tabs.vue'
import type { TableColumn } from '~/components/ui/DataTable.vue'
import type { Contract } from '~/types/contract'
import type { ContentOwner } from '~/types/content-owner'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fetchOrganization, loading, error } = useOrganizations()
const { mcns: allMcns, loading: mcnsLoading, fetchMcns } = useMcns()
const { channels, loading: channelsLoading, fetchChannels, pagination: channelsPagination } = useChannels()
const { contracts, loading: contractsLoading, fetchContracts, getContractTypeLabel, getStatusLabel, getStatusColor } = useContracts()
const organization = ref<Organization | null>(null)
const topUnmappedChannels = computed(() => organization.value?.top_unmapped_channels || [])

// Initialize activeTab from URL parameter or default to 'overview'
const activeTab = ref<string>((route.query.tab as string) || 'overview')
const isEditModalOpen = ref(false)
const isMCNModalOpen = ref(false)
const isInviteModalOpen = ref(false)
const isInviteMcnAdminModalOpen = ref(false)
const isEditUserModalOpen = ref(false)
const isDeleteUserModalOpen = ref(false)
const selectedUser = ref<User | null>(null)
const isContentOwnerModalOpen = ref(false)
const isDeleteContentOwnerModalOpen = ref(false)
const isFetchChannelsModalOpen = ref(false)
const selectedContentOwner = ref<ContentOwner | null>(null)
const selectedContentOwnerForFetch = ref<ContentOwner | null>(null)

const { users: allUsers, loading: usersLoading, error: usersError, fetchUsers } = useUsers()
const { success: showSuccessToast, error: showErrorToast } = useToast()
const {
  contentOwners,
  loading: contentOwnersLoading,
  fetchContentOwners,
  deleteContentOwner,
} = useContentOwners()
const { fetchChannelsFromYouTube } = useFetchChannels()

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'mcns', label: 'MCN Partners' },
  { id: 'content-owners', label: 'Content Owners' },
  { id: 'channels', label: 'Channels' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'users', label: 'Users' },
]

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: 'Home', to: '/app/home' },
  { label: 'Organizations', to: '/app/organizations' },
  { label: organization.value?.name || 'Loading...' },
])

const canEdit = computed(() => {
  return authStore.isAdmin
})

const canInvite = computed(() => {
  return authStore.isAdmin
})

const canInviteMcnAdmin = computed(() => {
  return authStore.isAdmin || authStore.isOrgAdmin
})

const canEditUser = computed(() => {
  return authStore.isAdmin || authStore.isOrgAdmin
})

const canDeleteUser = computed(() => {
  return authStore.isAdmin || authStore.isOrgAdmin
})

const organizationUsers = computed(() => {
  if (!organization.value) return []
  return allUsers.value.filter((user) => user.organization_id === organization.value!.id)
})

const organizationMcns = computed(() => {
  if (!organization.value) return []
  // Filter MCNs to only show those belonging to this organization
  return allMcns.value.filter((mcn: MCN) => mcn.organization_id === organization.value!.id)
})
const organizationContentOwners = computed(() => {
  if (!organization.value) return []
  return contentOwners.value.filter(
    (co: ContentOwner) => co.organization_id === organization.value!.id
  )
})
const organizationChannels = computed(() => channels.value)
const organizationContracts = computed(() => contracts.value)
const activeContractsCount = computed(() => organizationContracts.value.filter((c: Contract) => c.status === 'active').length)

// Channels tab state: search + MCN filter + sort + pagination
const channelSearch = ref('')
const channelMcnFilter = ref('')
const channelSort = ref('created_at:desc')
const channelPageSize = ref(10)
let channelSearchTimer: ReturnType<typeof setTimeout> | null = null

const mcnChannelsTotal = computed(() =>
  organizationMcns.value.reduce((sum: number, mcn: MCN) => sum + (mcn.channel_count || 0), 0)
)
const mcnChannelsBreakdown = computed(() =>
  organizationMcns.value.map((mcn: MCN) => `${mcn.name} ${mcn.channel_count || 0}`).join(' · ')
)

const syncChannelMcnToUrl = async () => {
  const mcn = channelMcnFilter.value || undefined
  if (route.query.mcn === mcn) return
  await router.replace({
    query: {
      ...route.query,
      ...(mcn ? { mcn } : { mcn: undefined }),
    },
  })
}

const loadOrgChannels = async (page: number = 1) => {
  if (!organization.value) return
  // MCN filter options need the org's partners; the mcns tab may never have loaded them
  if (organizationMcns.value.length === 0) {
    await fetchMcns({ organization_id: organization.value.id })
  }
  await syncChannelMcnToUrl()
  const [sortBy, sortDir] = channelSort.value.split(':')
  await fetchChannels({
    organization_id: organization.value.id,
    mcn_id: channelMcnFilter.value || undefined,
    title: channelSearch.value.trim() || undefined,
    page,
    page_size: channelPageSize.value,
    sort_by: sortBy,
    sort_dir: (sortDir === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
  })
}

const onChannelFilterChange = () => {
  if (channelSearchTimer) clearTimeout(channelSearchTimer)
  // Debounce search typing; selects reset immediately via the same path
  channelSearchTimer = setTimeout(() => {
    loadOrgChannels(1)
  }, 300)
}

const goToChannelPage = async (page: number) => {
  if (page < 1 || page > channelsPagination.value.total_pages || channelsLoading.value) return
  await loadOrgChannels(page)
}

const visibleChannelPages = computed<(number | string)[]>(() => {
  const total = channelsPagination.value.total_pages
  const current = channelsPagination.value.page
  const pages: (number | string)[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current <= 4) {
      for (let i = 2; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const filterChannelsByMcn = async (mcnId: string) => {
  channelMcnFilter.value = mcnId
  if (activeTab.value === 'channels') {
    await loadOrgChannels(1)
  } else {
    // The activeTab watcher loads page 1 for the channels tab
    activeTab.value = 'channels'
  }
}

const userColumns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
]

const mcnColumns: TableColumn[] = [
  { key: 'name', label: 'Partner Name' },
  { key: 'partner_type', label: 'Partner Type' },
  { key: 'alias', label: 'Alias' },
  { key: 'channel_count', label: 'Channels' },
]

const channelColumns: TableColumn[] = [
  { key: 'title', label: 'Channel Name' },
  { key: 'mcn_name', label: 'MCN Partner' },
  { key: 'subscriber_count', label: 'Subscribers' },
  { key: 'view_count', label: 'Views' },
]

const contractColumns: TableColumn[] = [
  { key: 'contract_number', label: 'Contract Number' },
  { key: 'entity_name', label: 'Entity' },
  { key: 'revenue_share_pct', label: 'Revenue Share' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'status', label: 'Status' },
]

const contentOwnerColumns: TableColumn[] = [
  { key: 'content_owner_id', label: 'Content Owner ID' },
  { key: 'display_name', label: 'Display Name' },
  { key: 'is_active', label: 'Status' },
  { key: 'created_at', label: 'Created' },
]

const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}

const formatRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    atlas_superadmin: 'Atlas Superadmin',
    atlas_admin: 'Atlas Admin',
    org_owner: 'Org Owner',
    org_admin: 'Org Admin',
    mcn_operator: 'MCN Operator',
    creator: 'Creator',
  }
  return roleMap[role] || role
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_verification: 'Pending Verification',
    active: 'Active',
    inactive: 'Inactive',
  }
  return statusMap[status] || status
}

const loadUsers = async () => {
  if (organization.value) {
    await fetchUsers({ organization_id: organization.value.id } as any)
  }
}

const handleEditUser = (user: User) => {
  selectedUser.value = user
  isEditUserModalOpen.value = true
}

const handleDeleteUser = (user: User) => {
  selectedUser.value = user
  isDeleteUserModalOpen.value = true
}

const handleEditUserModalClose = () => {
  isEditUserModalOpen.value = false
  selectedUser.value = null
}

const handleEditUserModalSuccess = async () => {
  isEditUserModalOpen.value = false
  selectedUser.value = null
  showSuccessToast('User updated successfully')
  await loadUsers()
}

const handleDeleteUserModalClose = () => {
  isDeleteUserModalOpen.value = false
  selectedUser.value = null
}

const handleDeleteUserModalSuccess = async () => {
  isDeleteUserModalOpen.value = false
  selectedUser.value = null
  showSuccessToast('User deleted successfully')
  await loadUsers()
}

const handleAddContentOwner = () => {
  selectedContentOwner.value = null
  isContentOwnerModalOpen.value = true
}

const handleEditContentOwner = (contentOwner: ContentOwner) => {
  selectedContentOwner.value = contentOwner
  isContentOwnerModalOpen.value = true
}

const handleDeleteContentOwner = (contentOwner: ContentOwner) => {
  selectedContentOwner.value = contentOwner
  isDeleteContentOwnerModalOpen.value = true
}

const handleContentOwnerModalClose = () => {
  isContentOwnerModalOpen.value = false
  selectedContentOwner.value = null
}

const handleContentOwnerModalSuccess = async () => {
  isContentOwnerModalOpen.value = false
  selectedContentOwner.value = null
  if (organization.value) {
    await fetchContentOwners({ organization_id: organization.value.id })
  }
}

const handleDeleteContentOwnerModalClose = () => {
  isDeleteContentOwnerModalOpen.value = false
  selectedContentOwner.value = null
}

const handleDeleteContentOwnerModalSuccess = async () => {
  isDeleteContentOwnerModalOpen.value = false
  selectedContentOwner.value = null
  if (organization.value) {
    await fetchContentOwners({ organization_id: organization.value.id })
  }
}

const handleFetchChannels = (contentOwner: ContentOwner) => {
  selectedContentOwnerForFetch.value = contentOwner
  isFetchChannelsModalOpen.value = true
}

const handleFetchChannelsModalClose = () => {
  isFetchChannelsModalOpen.value = false
  selectedContentOwnerForFetch.value = null
}

const handleFetchChannelsModalSuccess = async () => {
  isFetchChannelsModalOpen.value = false
  selectedContentOwnerForFetch.value = null
}

const handleMapChannels = (data: { contentOwnerId: string, organizationId: string | undefined, channels: any[] }) => {
  // Backend now persists fetched channels to staging table. Just show a toast.
  showSuccessToast(`Fetched ${data.channels.length} channel(s). Click "Mapping" to assign to an MCN Partner.`)
}

const handleOpenMappingModal = (contentOwner: ContentOwner) => {
  if (!organization.value) {
    showErrorToast('Organization not loaded. Please try again.')
    return
  }

  const contentOwnerId = (contentOwner.content_owner_id || '').trim()
  router.push({
    path: `/app/organizations/channel-mapping/${organization.value.id}`,
    query: { content_owner_id: contentOwnerId },
  })
}

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

const loadOrganization = async () => {
  const orgId = route.params.id as string
  if (!orgId) return

  try {
    const data = await fetchOrganization(orgId)
    organization.value = data
    
    // Fetch contracts for this organization
    if (organization.value) {
      await fetchContracts({ organization_id: organization.value.id })
      // If landing directly on a data tab via ?tab=, preload its data
      // (the activeTab watcher only fires on tab switches)
      if (activeTab.value === 'channels') {
        const mcnParam = route.query.mcn
        if (typeof mcnParam === 'string' && mcnParam) {
          channelMcnFilter.value = mcnParam
        }
        await loadOrgChannels(1)
      } else if (activeTab.value === 'mcns') {
        await fetchMcns({ organization_id: organization.value.id })
      } else if (activeTab.value === 'content-owners') {
        await fetchContentOwners({ organization_id: organization.value.id })
      }
    }
  } catch (err) {
    // Error is handled by the composable and displayed in the template
    console.error('Failed to load organization:', err)
  }
}

const handleEdit = () => {
  isEditModalOpen.value = true
}

const handleCloseEditModal = () => {
  isEditModalOpen.value = false
}

const handleEditModalSuccess = async (updatedOrganization: Organization) => {
  isEditModalOpen.value = false
  showSuccessToast(`Organization "${updatedOrganization.name}" updated successfully`)
  
  // Refresh organization data
  await loadOrganization()
}

const handleAddMCN = () => {
  isMCNModalOpen.value = true
}

const handleMCNModalClose = () => {
  isMCNModalOpen.value = false
}

const handleMCNModalSuccess = async (mcn: MCN) => {
  isMCNModalOpen.value = false
  
  showSuccessToast(`MCN Partner "${mcn.name}" created successfully`)
  
  // Refresh organization data to update MCN count
  await loadOrganization()
  
  // Refresh MCN Partners list for this organization
  if (organization.value) {
    await fetchMcns({ organization_id: organization.value.id })
  }
  
  // Navigate to MCN detail page
  router.push(`/app/mcns/${mcn.id}`)
}

const handleInviteOrganizationOwner = () => {
  isInviteModalOpen.value = true
}

const handleCloseInviteModal = () => {
  isInviteModalOpen.value = false
}

const handleInviteModalSuccess = async () => {
  isInviteModalOpen.value = false
  // Refresh organization data to show updated owner_email if applicable
  await loadOrganization()
}

const handleInviteMcnAdmin = () => {
  isInviteMcnAdminModalOpen.value = true
}

const handleCloseInviteMcnAdminModal = () => {
  isInviteMcnAdminModalOpen.value = false
}

const handleInviteMcnAdminModalSuccess = async () => {
  isInviteMcnAdminModalOpen.value = false
  // Refresh organization data
  await loadOrganization()
  // Refresh users list
  await loadUsers()
}

// Watch for URL query parameter changes
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && typeof newTab === 'string') {
      const validTabs = tabs.map(t => t.id)
      if (validTabs.includes(newTab)) {
        activeTab.value = newTab
      }
    }
  }
)

// Watch for activeTab changes and update URL
watch(
  () => activeTab.value,
  async (newTab) => {
    // Update URL without triggering navigation
    await router.replace({
      query: {
        ...route.query,
        tab: newTab
      }
    })
    
    if (!organization.value) return
    
    if (newTab === 'users') {
      await loadUsers()
    } else if (newTab === 'mcns') {
      await fetchMcns({ organization_id: organization.value.id })
    } else if (newTab === 'content-owners') {
      if (organization.value) {
        await fetchContentOwners({ organization_id: organization.value.id })
        await fetchMcns({ organization_id: organization.value.id })
      }
    } else if (newTab === 'channels') {
      // Deep-link support: ?tab=channels&mcn=<id> preselects the MCN filter
      const mcnParam = route.query.mcn
      if (typeof mcnParam === 'string' && mcnParam) {
        channelMcnFilter.value = mcnParam
      }
      await loadOrgChannels(1)
    } else if (newTab === 'contracts') {
      await fetchContracts({ organization_id: organization.value.id })
    }
  }
)

onMounted(() => {
  loadOrganization()
})
</script>

