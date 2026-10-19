<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Breadcrumb -->
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Loading State -->
    <div v-if="loading && !channel" class="col-span-12">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading channel...</p>
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
              <p v-if="error === 'Channel not found'" class="mt-1 text-xs text-red-600 dark:text-red-400">
                The channel you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              v-if="error === 'Channel not found'"
              to="/app/channels"
              class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Back to Channels
            </NuxtLink>
            <button
              v-else
              @click="loadChannel"
              class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Channel Detail Content -->
    <template v-else-if="channel">
      <!-- Page Header -->
      <div class="col-span-12 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ channel.title }}</h1>
          <p class="text-gray-600 dark:text-gray-400">Channel details and management</p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            v-if="channel.channel_id"
            :to="`/app/analytics/channels/${channel.channel_id}`"
            class="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </NuxtLink>
          <button
            v-if="canInviteCreator && channel.mcn_id"
            @click="handleInviteCreatorUser"
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Invite Creator User
          </button>
          <button
            v-if="canEdit"
            @click="handleEdit"
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="col-span-12">
        <Tabs :tabs="tabs" v-model="activeTab">
          <!-- Overview Tab -->
          <template #overview>
            <div class="space-y-6">
              <!-- Channel Thumbnail -->
              <div class="flex justify-center">
                <div class="relative h-32 w-32">
                  <img
                    v-if="channel.thumbnail_url && !thumbnailError"
                    :src="channel.thumbnail_url"
                    :alt="channel.title"
                    class="h-32 w-32 rounded-full object-cover border-2 border-border dark:border-gray-700"
                    @error="handleThumbnailError"
                  />
                  <div
                    v-else
                    class="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                  >
                    <YoutubeIcon variant="black" class="h-16 w-16" />
                  </div>
                </div>
              </div>

              <!-- Basic Information Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Basic Information</h2>
                <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Channel Name</dt>
                    <dd class="mt-1 text-sm">
                      <a
                        :href="youtubeChannelUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 font-medium text-accent-foreground hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                        title="Open on YouTube"
                      >
                        {{ channel.title }}
                        <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </dd>
                  </div>
                  <div v-if="channel.channel_type">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Channel Type</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">
                      <span
                        class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >
                        {{ formatChannelType(channel.channel_type) }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Channel ID</dt>
                    <dd class="mt-1">
                      <div class="flex items-center gap-2">
                        <code class="rounded bg-gray-100 px-2 py-1 text-sm text-foreground dark:bg-gray-800 dark:text-white">{{ channel.channel_id }}</code>
                        <button
                          @click="copyChannelId"
                          class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                          title="Copy Channel ID"
                        >
                          Copy
                        </button>
                      </div>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Creator User</dt>
                    <dd class="mt-1 text-sm">
                      <NuxtLink
                        v-if="channel.creator_user_id"
                        :to="`/app/users/${channel.creator_user_id}`"
                        class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {{ channel.creator_user_name || '—' }}
                      </NuxtLink>
                      <span v-else class="text-foreground dark:text-white">—</span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">MCN</dt>
                    <dd class="mt-1 text-sm">
                      <NuxtLink
                        v-if="channel.mcn_id"
                        :to="`/app/mcns/${channel.mcn_id}`"
                        class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {{ channel.mcn_name || '—' }}
                      </NuxtLink>
                      <span v-else class="text-foreground dark:text-white">—</span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</dt>
                    <dd class="mt-1 text-sm">
                      <NuxtLink
                        v-if="channel.organization_id"
                        :to="`/app/organizations/${channel.organization_id}`"
                        class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {{ channel.organization_name || '—' }}
                      </NuxtLink>
                      <span v-else class="text-foreground dark:text-white">—</span>
                    </dd>
                  </div>
                  <div v-if="channel.content_owner_id">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Content Owner ID</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ channel.content_owner_id }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ formatDate(channel.created_at) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Synced Date</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">
                      {{ channel.synced_at ? formatDate(channel.synced_at) : 'Never' }}
                    </dd>
                  </div>
                </dl>
              </div>

              <!-- YouTube Analytics Access Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground dark:text-white">
                  <YoutubeIcon variant="red" class="h-5 w-5" />
                  YouTube Analytics Access
                </h2>

                <div v-if="oauthStatusLoading" class="text-sm text-gray-500 dark:text-gray-400">
                  Checking connection status...
                </div>

                <template v-else-if="oauthStatus?.connected">
                  <div class="mb-3 flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                    <span class="text-sm font-medium text-foreground dark:text-white">Connected</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Connected since: {{ oauthStatus.connected_at ? formatDate(oauthStatus.connected_at) : '—' }}
                  </p>
                  <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Scopes: {{ formatOAuthScopes(oauthStatus.scopes) }}
                  </p>
                  <div class="flex gap-3">
                    <NuxtLink
                      v-if="channel.channel_id"
                      :to="`/app/analytics/channels/${channel.channel_id}`"
                      class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30"
                    >
                      View Analytics →
                    </NuxtLink>
                    <button
                      v-if="canManageOAuth"
                      @click="handleDisconnectOAuth"
                      :disabled="oauthDisconnecting"
                      class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {{ oauthDisconnecting ? 'Disconnecting...' : 'Disconnect' }}
                    </button>
                  </div>
                  <p v-if="canManageOAuth" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Disconnecting revokes Atlas's access with Google and deletes the stored connection
                    immediately. You can also manage or revoke Atlas's access at any time from your
                    <a
                      href="https://myaccount.google.com/connections"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-accent-foreground underline hover:text-brand-700 dark:text-brand-400"
                    >Google Account's third-party access settings</a>. See our
                    <NuxtLink to="/privacy" target="_blank" class="text-accent-foreground underline hover:text-brand-700 dark:text-brand-400">Privacy Policy</NuxtLink>
                    for how we handle previously-collected data.
                  </p>
                </template>

                <template v-else>
                  <div class="mb-3 flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                    <span class="text-sm font-medium text-foreground dark:text-white">Not connected</span>
                  </div>
                  <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Analytics data is unavailable for this channel. Connect the channel owner's YouTube account to enable analytics.
                  </p>
                  <button
                    v-if="canManageOAuth"
                    @click="handleConnectOAuth"
                    :disabled="oauthConnecting"
                    class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {{ oauthConnecting ? 'Redirecting...' : 'Connect YouTube Account' }}
                  </button>
                  <p v-if="canManageOAuth" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    By connecting, you agree to Atlas's
                    <NuxtLink to="/terms" target="_blank" class="text-accent-foreground underline hover:text-brand-700 dark:text-brand-400">Terms of Service</NuxtLink>
                    and
                    <NuxtLink to="/privacy" target="_blank" class="text-accent-foreground underline hover:text-brand-700 dark:text-brand-400">Privacy Policy</NuxtLink>,
                    including the use of Google OAuth to access YouTube Analytics data as described there.
                  </p>
                  <p v-else class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Only the assigned channel owner or an operator in this channel's scope can connect the owner's YouTube account. Please contact your operator if you need access.
                  </p>
                </template>
              </div>

              <!-- Quick Metrics Cards -->
              <div>
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Quick Metrics</h2>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <!-- Subscribers Card -->
                  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ formatNumber(channel.subscriber_count) }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Videos Card -->
                  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Videos</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ formatNumber(channel.video_count) }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent dark:bg-brand-900/20">
                        <svg class="h-6 w-6 text-accent-foreground dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Views Card -->
                  <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Views</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ formatNumber(channel.view_count) }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Active Contracts Card -->
                  <div
                    @click="router.push({ query: { tab: 'contracts' } })"
                    class="cursor-pointer rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
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
                </div>
              </div>

              <!-- Quick Actions Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Quick Actions</h2>
                <div class="flex flex-wrap gap-4">
                  <NuxtLink
                    v-if="channel.mcn_id"
                    :to="`/app/mcns/${channel.mcn_id}`"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    View in MCN
                  </NuxtLink>
                  <NuxtLink
                    v-if="channel.creator_user_id"
                    :to="`/app/users/${channel.creator_user_id}`"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    View Creator User
                  </NuxtLink>
                  <button
                    v-if="canEdit"
                    @click="handleEdit"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit Channel
                  </button>
                  <button
                    v-if="canSync"
                    @click="handleSync"
                    :disabled="isSyncing"
                    class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span v-if="isSyncing">Syncing...</span>
                    <span v-else>Sync from YouTube</span>
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
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage contracts for this channel</p>
                </div>
                <div>
                  <button
                    v-if="canCreateChannelContract"
                    @click="openCreateChannelContractModal"
                    class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!canCreateChannelContractForContext"
                  >
                    Create Contract
                  </button>
                </div>
              </div>
              
              <DataTable
                :columns="contractColumns"
                :data="channelContracts"
                :loading="contractsLoading"
                empty-message="No contracts found for this channel."
              >
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
                  <button
                    v-if="row.id"
                    @click="router.push(`/app/contracts/${row.id}`)"
                    class="text-accent-foreground hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                  >
                    Manage
                  </button>
                </template>
              </DataTable>
            </div>
          </template>

          <!-- Revenue Simulator Tab -->
          <template #revenue>
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-foreground dark:text-white">Revenue Simulator</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Simulate revenue distribution for this channel</p>
              </div>
              
              <RevenuePreview
                :channelId="channel.id"
                :initialAmount="1000"
              />
            </div>
          </template>
        </Tabs>
      </div>

      <!-- Channel Form Modal -->
      <ChannelFormModal
        v-if="isModalOpen"
        :isOpen="isModalOpen"
        :channel="channel"
        @close="handleModalClose"
        @success="handleModalSuccess"
      />

      <!-- Invite Creator User Modal -->
      <InviteCreatorUserModal
        :isOpen="isInviteCreatorUserModalOpen"
        :prefillOrganizationId="channel.organization_id"
        :prefillMcnId="channel.mcn_id"
        :prefillMcnName="channel.mcn_name ?? undefined"
        :prefillChannelIds="channel.mcn_id ? [channel.id] : undefined"
        @close="handleCloseInviteCreatorUserModal"
        @success="handleInviteCreatorUserModalSuccess"
      />

      <!-- Create Contract Modal (channel context) -->
      <ContractFormModal
        v-if="isCreateContractModalOpen && channel"
        :isOpen="isCreateContractModalOpen"
        :contract="null"
        :prefillOrganizationId="channel.organization_id || undefined"
        :prefillMcnId="channel.mcn_id || undefined"
        :prefillChannelId="channel.id"
        :prefillContractType="'mcn_to_channel'"
        :lockPrefilledEntities="true"
        @close="handleCreateContractModalClose"
        @success="handleCreateContractModalSuccess"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Tabs from '~/components/common/Tabs.vue'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'
import ChannelFormModal from '~/components/modals/ChannelFormModal.vue'
import InviteCreatorUserModal from '~/components/modals/InviteCreatorUserModal.vue'
import ContractEndDateCell from '~/components/contracts/ContractEndDateCell.vue'
import RevenuePreview from '~/components/contracts/RevenuePreview.vue'
import DataTable from '~/components/ui/DataTable.vue'
import ContractFormModal from '~/components/modals/ContractFormModal.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { Tab } from '~/components/common/Tabs.vue'
import type { YouTubeChannel } from '~/types/channel'
import type { TableColumn } from '~/components/ui/DataTable.vue'
import type { Contract } from '~/types/contract'
import type { OAuthStatus } from '~/composables/useChannelOAuth'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fetchChannel, updateChannel, fetchChannelStats, loading, error } = useChannels()
const { contracts, loading: contractsLoading, fetchContracts, getContractTypeLabel, getStatusLabel, getStatusColor } = useContracts()
const { success: showSuccessToast, error: showErrorToast } = useToast()
const {
  loading: oauthStatusLoading,
  disconnecting: oauthDisconnecting,
  error: oauthError,
  initiateConnect: initiateOAuthConnect,
  disconnect: disconnectOAuth,
  fetchOAuthStatus,
} = useChannelOAuth()

const channel = ref<YouTubeChannel | null>(null)

// Initialize activeTab from URL parameter or default to 'overview'
const activeTab = ref<string>((route.query.tab as string) || 'overview')
const isModalOpen = ref(false)
const isInviteCreatorUserModalOpen = ref(false)
const isSyncing = ref(false)
const thumbnailError = ref(false)
const isCreateContractModalOpen = ref(false)
const oauthStatus = ref<OAuthStatus | null>(null)
const oauthConnecting = ref(false)

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

const canInviteCreator = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator'
  )
})

const canSync = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator' ||
    role === 'atlas_superadmin' ||
    role === 'atlas_admin'
  )
})

const canManageOAuth = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator' ||
    role === 'creator'
  )
})

const canCreateChannelContract = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator' ||
    role === 'atlas_superadmin' ||
    role === 'atlas_admin'
  )
})

const youtubeChannelUrl = computed(() => {
  const customUrl = channel.value?.custom_url
  if (customUrl) {
    return customUrl.startsWith('http')
      ? customUrl
      : `https://www.youtube.com/${customUrl.replace(/^\/+/, '')}`
  }
  return `https://www.youtube.com/channel/${channel.value?.channel_id}`
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', to: '/app/home' },
    { label: 'Channels', to: '/app/channels' },
  ]
  if (channel.value) {
    items.push({ label: channel.value.title })
  }
  return items
})

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'revenue', label: 'Revenue Simulator' },
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

const formatChannelType = (type: YouTubeChannel['channel_type']) => {
  if (!type) return '—'
  switch (type) {
    case 'music_recording':
      return 'Music Recording'
    case 'publishing':
      return 'Publishing'
    case 'owned_operated':
      return 'Owned & Operated'
    case 'affiliate':
      return 'Affiliate'
    default:
      return type
  }
}

const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const copyChannelId = async () => {
  if (!channel.value) return
  try {
    await navigator.clipboard.writeText(channel.value.channel_id)
    showSuccessToast('Channel ID copied to clipboard')
  } catch (err) {
    showErrorToast('Failed to copy Channel ID')
  }
}

const formatOAuthScopes = (scopes: string[] | null | undefined) => {
  if (!scopes || scopes.length === 0) return '—'
  const labels: string[] = []
  if (scopes.some(s => s.includes('yt-analytics.readonly'))) labels.push('Analytics')
  return labels.length > 0 ? labels.join(', ') : scopes.join(', ')
}

const loadOAuthStatus = async () => {
  if (!channel.value) return
  oauthStatus.value = await fetchOAuthStatus(channel.value.id)
}

const handleConnectOAuth = async () => {
  if (!channel.value || oauthConnecting.value) return
  oauthConnecting.value = true
  try {
    await initiateOAuthConnect(channel.value.id)
    if (oauthError.value) {
      showErrorToast(oauthError.value)
    }
  } finally {
    oauthConnecting.value = false
  }
}

const handleDisconnectOAuth = async () => {
  if (!channel.value || oauthDisconnecting.value) return
  const ok = await disconnectOAuth(channel.value.id)
  if (ok) {
    showSuccessToast('YouTube account disconnected')
    await loadOAuthStatus()
  } else {
    showErrorToast('Failed to disconnect YouTube account')
  }
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'YouTube connection was cancelled.',
  invalid_state: 'The connection request expired. Please try again.',
  channel_ownership_mismatch: 'This Google account does not manage this channel. Please sign in with the account that manages this channel.',
  token_exchange_failed: 'Failed to complete YouTube connection. Please try again.',
  internal_error: 'An unexpected error occurred while connecting your YouTube account.',
}

const handleOAuthRedirectParams = async () => {
  const oauthResult = route.query.oauth as string | undefined
  if (!oauthResult) return

  if (oauthResult === 'success') {
    showSuccessToast('YouTube account connected successfully')
    await loadOAuthStatus()
  } else if (oauthResult === 'error') {
    const reason = route.query.reason as string | undefined
    showErrorToast(reason && OAUTH_ERROR_MESSAGES[reason] ? OAUTH_ERROR_MESSAGES[reason] : 'Failed to connect YouTube account.')
  }

  // Clear oauth query params from the URL after display
  const { oauth, reason, ...rest } = route.query
  await router.replace({ query: rest })
}

const handleThumbnailError = () => {
  // Set error flag to show placeholder
  thumbnailError.value = true
}

const loadChannel = async () => {
  const channelId = route.params.id as string
  try {
    const data = await fetchChannel(channelId)
    channel.value = data
    // Reset thumbnail error when channel loads
    thumbnailError.value = false
  } catch (err) {
    console.error('Failed to load channel:', err)
  }
}

const handleEdit = () => {
  isModalOpen.value = true
}

const handleModalClose = () => {
  isModalOpen.value = false
}

const handleModalSuccess = async (updatedChannel: YouTubeChannel) => {
  isModalOpen.value = false
  channel.value = updatedChannel
  showSuccessToast('Channel updated successfully')
}

const handleInviteCreatorUser = () => {
  isInviteCreatorUserModalOpen.value = true
}

const handleCloseInviteCreatorUserModal = () => {
  isInviteCreatorUserModalOpen.value = false
}

const handleInviteCreatorUserModalSuccess = async () => {
  isInviteCreatorUserModalOpen.value = false
  await loadChannel()
}

const canCreateChannelContractForContext = computed(() => {
  if (!channel.value) return false
  return !!(channel.value.organization_id && channel.value.mcn_id)
})

const openCreateChannelContractModal = () => {
  if (!channel.value || !canCreateChannelContractForContext.value) return
  isCreateContractModalOpen.value = true
}

const handleCreateContractModalClose = () => {
  isCreateContractModalOpen.value = false
}

const handleCreateContractModalSuccess = async () => {
  isCreateContractModalOpen.value = false
  if (channel.value) {
    await fetchContracts({ channel_id: channel.value.id })
  }
}

  const handleSync = async () => {
    if (!channel.value || isSyncing.value) return

    isSyncing.value = true
    try {
      // Use the dedicated stats endpoint with refresh=true
      const stats = await fetchChannelStats(channel.value.id, true)
      
      // Update local state with new stats
      channel.value = {
        ...channel.value,
        ...stats
      }
      
      showSuccessToast('Channel stats synced successfully from YouTube')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to sync channel from YouTube'
      showErrorToast(errorMessage)
    } finally {
      isSyncing.value = false
    }
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
  }
)

onMounted(async () => {
  await loadChannel()
  if (channel.value) {
    // Fetch contracts for this channel
    await fetchContracts({ channel_id: channel.value.id })
    await loadOAuthStatus()
    await handleOAuthRedirectParams()
  }
})

// Contract Logic
const channelContracts = computed(() => contracts.value)
const activeContractsCount = computed(() => channelContracts.value.filter((c: Contract) => c.status === 'active').length)

const contractColumns: TableColumn[] = [
  { key: 'entity_name', label: 'Entity' },
  { key: 'revenue_share_pct', label: 'Revenue Share' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'status', label: 'Status' },
]
</script>

