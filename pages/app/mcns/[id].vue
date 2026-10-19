<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Breadcrumb -->
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Loading State -->
    <div v-if="loading && !mcn" class="col-span-12">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading MCN Partner...</p>
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
              <p v-if="error === 'MCN not found'" class="mt-1 text-xs text-red-600 dark:text-red-400">
                The MCN you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink
              v-if="error === 'MCN not found'"
              to="/app/mcns"
              class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Back to MCN Partners
            </NuxtLink>
            <button
              v-else
              @click="loadMcn"
              class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MCN Detail Content -->
    <template v-else-if="mcn">
      <!-- Page Header -->
      <div class="col-span-12 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ mcn.name }}</h1>
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                mcn.partner_type === 'inhouse'
                  ? 'bg-accent text-brand-800 dark:bg-brand-900/30 dark:text-brand-300'
                  : mcn.partner_type === 'agency'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
              ]"
            >
              {{ getPartnerTypeLabel(mcn.partner_type) }}
            </span>
            <span v-if="mcn.alias" class="text-sm text-gray-500 dark:text-gray-400">({{ mcn.alias }})</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">MCN Partner details and management</p>
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
              <!-- Incomplete setup: no active Organization → MCN contract -->
              <div
                v-if="hasNoActiveOrgToMcnContract"
                class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="flex gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">Complete partner setup</p>
                      <p class="mt-1 text-sm text-amber-800 dark:text-amber-100/90">
                        This MCN partner does not have an active Organization → MCN contract yet. Add one to formalize revenue share and terms between your organization and this partner.
                      </p>
                    </div>
                  </div>
                  <button
                    v-if="canCreateOrgToMcnContract"
                    type="button"
                    @click="openCreateOrgToMcnContractModal"
                    class="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!canCreateOrgToMcnContractForContext"
                  >
                    Create contract
                  </button>
                </div>
              </div>

              <!-- Basic Info Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div class="mb-4 flex items-center gap-2">
                  <svg class="h-5 w-5 text-accent-foreground dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Basic Information</h2>
                </div>
                <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Partner Name</dt>
                    <dd class="mt-1 text-sm font-medium text-foreground dark:text-white">{{ mcn.name }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Partner Type</dt>
                    <dd class="mt-1">
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          mcn.partner_type === 'inhouse'
                            ? 'bg-accent text-brand-800 dark:bg-brand-900/30 dark:text-brand-300'
                            : mcn.partner_type === 'agency'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                        ]"
                      >
                        {{ getPartnerTypeLabel(mcn.partner_type) }}
                      </span>
                    </dd>
                  </div>
                  <div v-if="mcn.alias">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Alias</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ mcn.alias }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</dt>
                    <dd class="mt-1 text-sm">
                      <NuxtLink
                        v-if="mcn.organization_name && mcn.organization_id"
                        :to="`/app/organizations/${mcn.organization_id}`"
                        class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {{ mcn.organization_name }}
                      </NuxtLink>
                      <span v-else class="text-foreground dark:text-white">{{ mcn.organization_name || '—' }}</span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd class="mt-1">
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          mcn.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                        ]"
                      >
                        {{ mcn.status === 'active' ? 'Active' : mcn.status || 'Active' }}
                      </span>
                    </dd>
                  </div>
                  <div v-if="mcn.description" class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white whitespace-pre-wrap">{{ mcn.description }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ formatDate(mcn.created_at) }}</dd>
                  </div>
                  <div v-if="mcn.updated_at && mcn.updated_at !== mcn.created_at">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                    <dd class="mt-1 text-sm text-foreground dark:text-white">{{ formatDate(mcn.updated_at) }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Partner Information Section -->
              <div class="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div class="mb-4 flex items-center gap-2">
                  <svg class="h-5 w-5 text-accent-foreground dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Partner Information</h2>
                </div>
                <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <!-- Website -->
                  <div v-if="mcn.website_url" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Website</dt>
                      <dd class="mt-1 text-sm">
                        <a :href="mcn.website_url" target="_blank" rel="noopener noreferrer" class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 break-words">
                          {{ mcn.website_url }}
                          <svg class="inline-block h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </dd>
                    </div>
                  </div>

                  <!-- Director & Company -->
                  <div v-if="mcn.director" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Director</dt>
                      <dd class="mt-1 text-sm text-foreground dark:text-white break-words">{{ mcn.director }}</dd>
                    </div>
                  </div>
                  <div v-if="mcn.director_id_file_url" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Director ID File</dt>
                      <dd class="mt-1 text-sm">
                        <a :href="mcn.director_id_file_url" target="_blank" rel="noopener noreferrer" class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 break-words">
                          View file
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div v-if="mcn.international_company_name" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">International Company Name</dt>
                      <dd class="mt-1 text-sm text-foreground dark:text-white break-words">{{ mcn.international_company_name }}</dd>
                    </div>
                  </div>

                  <!-- Tax -->
                  <div v-if="mcn.tax_id" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tax Identification Number</dt>
                      <dd class="mt-1 text-sm text-foreground dark:text-white font-mono break-words">{{ mcn.tax_id }}</dd>
                    </div>
                  </div>
                  <div v-if="mcn.tax_id_file_url" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID File</dt>
                      <dd class="mt-1 text-sm">
                        <a :href="mcn.tax_id_file_url" target="_blank" rel="noopener noreferrer" class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 break-words">
                          View file
                        </a>
                      </dd>
                    </div>
                  </div>
                  
                  <!-- Address Information -->
                  <div v-if="mcn.address" class="sm:col-span-2 flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                      <dd class="mt-1 text-sm text-foreground dark:text-white break-words">{{ mcn.address }}</dd>
                    </div>
                  </div>
                  <div v-if="mcn.city || mcn.country" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                      <dd class="mt-1 text-sm text-foreground dark:text-white break-words">
                        {{ [mcn.city, mcn.country].filter(Boolean).join(', ') || '—' }}
                      </dd>
                    </div>
                  </div>

                  <!-- Bank Information -->
                  <div v-if="mcn.bank_name || mcn.bank_account_name || mcn.bank_account_number" class="flex items-start gap-3 sm:col-span-2">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5a1 1 0 01-1-1v-4H9v4a1 1 0 01-1 1H3a1 1 0 01-1-1V10z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0 space-y-1">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Information</dt>
                      <dd class="mt-1 text-sm text-foreground dark:text-white break-words">
                        <span v-if="mcn.bank_name">{{ mcn.bank_name }}</span>
                        <span v-if="mcn.bank_account_name"> • {{ mcn.bank_account_name }}</span>
                        <span v-if="mcn.bank_account_number"> • {{ mcn.bank_account_number }}</span>
                      </dd>
                      <dd v-if="mcn.bank_swift_code" class="text-xs text-gray-600 dark:text-gray-400">
                        SWIFT: {{ mcn.bank_swift_code }}
                      </dd>
                      <dd v-if="mcn.bank_branch" class="text-xs text-gray-600 dark:text-gray-400">
                        Branch: {{ mcn.bank_branch }}
                      </dd>
                      <dd v-if="mcn.bank_country" class="text-xs text-gray-600 dark:text-gray-400">
                        Country: {{ mcn.bank_country }}
                      </dd>
                      <dd v-if="mcn.bank_address" class="text-xs text-gray-600 dark:text-gray-400 break-words">
                        Address: {{ mcn.bank_address }}
                      </dd>
                    </div>
                  </div>

                  <!-- PIC Partner -->
                  <div v-if="mcn.pic_partner_name || mcn.pic_partner_email || mcn.pic_partner_phone" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0 space-y-1">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">PIC Partner</dt>
                      <dd v-if="mcn.pic_partner_name" class="mt-1 text-sm text-foreground dark:text-white break-words">
                        {{ mcn.pic_partner_name }}
                      </dd>
                      <dd v-if="mcn.pic_partner_phone" class="text-xs text-gray-600 dark:text-gray-400 break-words">
                        Phone: {{ mcn.pic_partner_phone }}
                      </dd>
                      <dd v-if="mcn.pic_partner_email" class="text-xs">
                        <a :href="`mailto:${mcn.pic_partner_email}`" class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 break-words">
                          {{ mcn.pic_partner_email }}
                        </a>
                      </dd>
                    </div>
                  </div>

                  <!-- PIC Legal -->
                  <div v-if="mcn.pic_legal_name || mcn.pic_legal_email || mcn.pic_legal_phone" class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17l4 4 4-4m-4-5v9M5 10V5a2 2 0 012-2h10a2 2 0 012 2v5" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0 space-y-1">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">PIC Legal</dt>
                      <dd v-if="mcn.pic_legal_name" class="mt-1 text-sm text-foreground dark:text-white break-words">
                        {{ mcn.pic_legal_name }}
                      </dd>
                      <dd v-if="mcn.pic_legal_phone" class="text-xs text-gray-600 dark:text-gray-400 break-words">
                        Phone: {{ mcn.pic_legal_phone }}
                      </dd>
                      <dd v-if="mcn.pic_legal_email" class="text-xs">
                        <a :href="`mailto:${mcn.pic_legal_email}`" class="font-medium text-accent-foreground hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 break-words">
                          {{ mcn.pic_legal_email }}
                        </a>
                      </dd>
                    </div>
                  </div>
                  
                  <!-- Empty State -->
                  <div v-if="!mcn.website_url && !mcn.pic_contact_name && !mcn.pic_contact_email && !mcn.pic_contact_phone && !mcn.address && !mcn.city && !mcn.country && !mcn.tax_id" class="sm:col-span-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400 italic">No partner information available. Edit to add details.</p>
                  </div>
                </dl>
              </div>

              <!-- Summary Metrics Cards -->
              <div>
                <h2 class="mb-4 text-lg font-semibold text-foreground dark:text-white">Summary Metrics</h2>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <!-- Total Channels Card -->
                  <div
                    @click="router.push({ query: { tab: 'channels' } })"
                    class="cursor-pointer rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Channels</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ mcn.channel_count || 0 }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Total Creator Users Card -->
                  <div
                    @click="router.push({ query: { tab: 'users' } })"
                    class="cursor-pointer rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Creator Users</p>
                        <p class="mt-2 text-3xl font-bold text-foreground dark:text-white">{{ creatorUsers.length || 0 }}</p>
                      </div>
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent dark:bg-brand-900/20">
                        <svg class="h-6 w-6 text-accent-foreground dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                  <div
                    @click="router.push({ query: { ...route.query, tab: 'contracts' } })"
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
                  <button
                    @click="handleAddChannel"
                    class="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    + Add Channel
                  </button>
                  <button
                    v-if="canInviteMcnAdmin"
                    @click="handleInviteMcnAdmin"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Invite MCN Admin
                  </button>
                  <button
                    v-if="canInviteCreator"
                    @click="handleInviteCreatorUser"
                    class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Invite Creator User
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Channels Tab -->
          <template #channels>
            <div class="space-y-6">
              <!-- Page Header -->
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Channels</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage channels in this MCN</p>
                </div>
                <div class="flex gap-3">
                  <button
                    @click="handleAddChannel"
                    class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    + Add Channel
                  </button>
                </div>
              </div>

              <!-- Error State -->
              <div v-if="channelsError && !channelsLoading" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-red-800 dark:text-red-300">{{ channelsError }}</p>
                  </div>
                  <button
                    @click="loadChannels"
                    class="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
                  >
                    Retry
                  </button>
                </div>
              </div>

              <!-- Channels Table -->
              <div v-else>
                <DataTable
                  :columns="channelColumns"
                  :data="channels"
                  :loading="channelsLoading"
                  empty-message="No channels found in this MCN. Fetch from YouTube or add manually."
                >
                  <template #cell-title="{ row }">
                    <div class="flex items-center gap-3">
                      <div class="relative h-10 w-10 flex-shrink-0">
                        <img
                          v-if="row.thumbnail_url && !row._thumbnailError"
                          :src="row.thumbnail_url"
                          :alt="row.title"
                          class="h-10 w-10 rounded-full object-cover border border-border dark:border-gray-700"
                          @error="(e) => handleThumbnailError(e, row)"
                          style="display: block;"
                        />
                        <div
                          v-if="!row.thumbnail_url || row._thumbnailError"
                          class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                        >
                          <YoutubeIcon variant="black" class="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <p class="font-medium text-foreground dark:text-white">{{ row.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ row.channel_id }}</p>
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

                  <template #actions="{ row }">
                    <div class="flex items-center gap-2">
                      <NuxtLink
                        :to="`/app/channels/${row.id}`"
                        class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
                      >
                        View
                      </NuxtLink>
                    </div>
                  </template>
                </DataTable>
              </div>
            </div>
          </template>

          <!-- Contracts Tab -->
          <template #contracts>
             <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-foreground dark:text-white">Contracts</h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage contracts for this MCN</p>
                </div>
                <div>
                  <button
                    v-if="canCreateOrgToMcnContract"
                    type="button"
                    @click="openCreateOrgToMcnContractModal"
                    class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!canCreateOrgToMcnContractForContext"
                  >
                    Create Contract
                  </button>
                </div>
              </div>
              
              <DataTable
                :columns="contractColumns"
                :data="mcnContracts"
                :loading="contractsLoading"
                empty-message="No contracts yet. Create an Organization → MCN contract to finish setup."
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
                  <p class="text-sm text-gray-600 dark:text-gray-400">Manage users in this MCN</p>
                </div>
                <div class="flex gap-3">
                  <button
                    v-if="canInviteMcnAdmin"
                    @click="handleInviteMcnAdmin"
                    class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Invite MCN Admin
                  </button>
                  <button
                    v-if="canInviteCreator"
                    @click="handleInviteCreatorUser"
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

              <!-- Users Table (MCN Partner Admins + Creator Users) -->
              <div v-else>
                <DataTable
                  :columns="userColumns"
                  :data="allMcnUsers"
                  :loading="usersLoading"
                  empty-message="No users found in this MCN. Invite MCN Partner Admin or Creator User to get started."
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

    <!-- MCN Form Modal -->
    <MCNFormModal
      :isOpen="isModalOpen"
      :mcn="mcn"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />

    <!-- Invite MCN Admin Modal -->
    <InviteMCNAdminModal
      :isOpen="isInviteMcnAdminModalOpen"
      :prefillOrganizationId="mcn?.organization_id"
      :prefillMcnId="mcn?.id"
      :prefillMcnName="mcn?.name"
      @close="handleCloseInviteMcnAdminModal"
      @success="handleInviteMcnAdminModalSuccess"
    />

    <!-- Invite Creator User Modal -->
    <InviteCreatorUserModal
      :isOpen="isInviteCreatorUserModalOpen"
      :prefillOrganizationId="mcn?.organization_id"
      :prefillMcnId="mcn?.id"
      :prefillMcnName="mcn?.name"
      @close="handleCloseInviteCreatorUserModal"
      @success="handleInviteCreatorUserModalSuccess"
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

    <!-- Channel Form Modal -->
    <ChannelFormModal
      :isOpen="isChannelModalOpen"
      :prefillMcnId="mcn?.id"
      :prefillOrganizationId="mcn?.organization_id"
      @close="handleChannelModalClose"
      @success="handleChannelModalSuccess"
    />

    <!-- Create Organization → MCN contract -->
    <ContractFormModal
      v-if="isCreateOrgToMcnContractModalOpen && mcn"
      :isOpen="isCreateOrgToMcnContractModalOpen"
      :contract="null"
      :prefillOrganizationId="mcn.organization_id || undefined"
      :prefillMcnId="mcn.id"
      :prefillContractType="'org_to_mcn'"
      :lockPrefilledEntities="true"
      @close="handleCreateOrgToMcnContractModalClose"
      @success="handleCreateOrgToMcnContractModalSuccess"
    />

  </div>
</template>


<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Tabs from '~/components/common/Tabs.vue'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'
import ContractEndDateCell from '~/components/contracts/ContractEndDateCell.vue'
import DataTable from '~/components/ui/DataTable.vue'
import MCNFormModal from '~/components/modals/MCNFormModal.vue'
import ChannelFormModal from '~/components/modals/ChannelFormModal.vue'
import ContractFormModal from '~/components/modals/ContractFormModal.vue'
import InviteMCNAdminModal from '~/components/modals/InviteMCNAdminModal.vue'

import InviteCreatorUserModal from '~/components/modals/InviteCreatorUserModal.vue'
import EditUserModal from '~/components/modals/EditUserModal.vue'
import DeleteUserModal from '~/components/modals/DeleteUserModal.vue'
import type { MCN } from '~/types/mcn'
import { getPartnerTypeLabel } from '~/composables/useMcns'
import type { User } from '~/types/user'
import type { YouTubeChannel } from '~/types/channel'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { Tab } from '~/components/common/Tabs.vue'
import type { TableColumn } from '~/components/ui/DataTable.vue'

import type { Contract } from '~/types/contract'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fetchMcn, loading, error } = useMcns()
const { contracts, loading: contractsLoading, fetchContracts, getContractTypeLabel, getStatusLabel, getStatusColor } = useContracts()

const mcn = ref<MCN | null>(null)

// Initialize activeTab from URL parameter or default to 'overview'
const activeTab = ref<string>((route.query.tab as string) || 'overview')
const isModalOpen = ref(false)
const isChannelModalOpen = ref(false)
const isInviteMcnAdminModalOpen = ref(false)

const isInviteCreatorUserModalOpen = ref(false)
const isEditUserModalOpen = ref(false)
const isDeleteUserModalOpen = ref(false)
const selectedUser = ref<User | null>(null)
const isCreateOrgToMcnContractModalOpen = ref(false)

const canCreateOrgToMcnContract = useCanCreateMcnPartner()

const { users: allUsers, loading: usersLoading, error: usersError, fetchUsers } = useUsers()
const { channels, loading: channelsLoading, error: channelsError, fetchChannels } = useChannels()
const { success: showSuccessToast, error: showErrorToast } = useToast()


const tabs: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'channels', label: 'Channels' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'users', label: 'Users' },
]

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: 'Home', to: '/app/home' },
  { label: 'MCN Partners', to: '/app/mcns' },
  { label: mcn.value?.name || 'Loading...' },
])

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

const canEditUser = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator'
  )
})

const canDeleteUser = computed(() => {
  const role = authStore.user?.role
  return (
    role === 'atlas_superadmin' ||
    role === 'atlas_admin' ||
    role === 'org_owner' ||
    role === 'org_admin' ||
    role === 'mcn_operator'
  )
})

const mcnUsers = computed(() => {
  if (!mcn.value) return []
  return allUsers.value.filter((user) => user.mcn_id === mcn.value!.id && user.role !== 'creator')
})

const creatorUsers = computed(() => {
  if (!mcn.value) return []
  return allUsers.value.filter((user) => user.mcn_id === mcn.value!.id && user.role === 'creator')
})

// All users in this MCN (admins + creators) for the Users tab
const allMcnUsers = computed(() => {
  if (!mcn.value) return []
  return allUsers.value.filter((user) => user.mcn_id === mcn.value!.id)
})

const userColumns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
]

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
  if (mcn.value) {
    await fetchUsers({ mcn_id: mcn.value.id })
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

const loadMcn = async () => {
  const mcnId = route.params.id as string
  if (!mcnId) return

  try {
    const data = await fetchMcn(mcnId)
    mcn.value = data
    if (mcn.value) {
        // Fetch Org->MCN contracts
        // Assuming fetchContracts can filter by mcn_id (recipient)
        // If fetchContracts(params) supports 'mcn_id', it returns MCN->Channel contracts AND Org->MCN contracts probably?
        // Let's assume we want ALL contracts related to this MCN.
        // Actually for the "Contracts" tab of an MCN, we probably want to see the contract granting this MCN rights (Org->MCN) 
        // AND maybe contracts this MCN issued (MCN->Channel) although that might be too noisy.
        // Let's stick to contracts where MCN is the *subject* (Org->MCN) for "Active Contracts" count?
        // Or "Active Contracts" usually means how many creators signed with us?
        // Ah, typically "Active Contracts" in an MCN dashboard means the contracts they manage (Creator Contracts).
        // Let's prioritize MCN->Channel contracts for the count if that's what the user expects.
        // Wait, "Active Contracts" card in MCN detail... if it's 0 it looks bad.
        // Let's fetch all contracts where mcn_id is present.
        await fetchContracts({ mcn_id: mcn.value.id })

        // The active-tab watcher only runs after a tab change. Honor deep links
        // directly so a channel or user tab has data on the first page load.
        if (activeTab.value === 'channels') {
          await loadChannels()
        } else if (activeTab.value === 'users') {
          await loadUsers()
        }
    }
  } catch (err) {
    // Error is handled by the composable and displayed in the template
    console.error('Failed to load MCN:', err)
  }
}

const loadChannels = async () => {
  if (mcn.value) {
    await fetchChannels({ mcn_id: mcn.value.id })
  }
}

const handleEdit = () => {
  isModalOpen.value = true
}

const handleModalClose = () => {
  isModalOpen.value = false
}

const handleModalSuccess = async (updatedMcn: MCN) => {
  isModalOpen.value = false
  
  const { success } = useToast()
  success('MCN updated successfully')
  
  // Refresh the MCN data
  await loadMcn()
}




const handleAddChannel = () => {
  isChannelModalOpen.value = true
}

const handleChannelModalClose = () => {
  isChannelModalOpen.value = false
}

const handleChannelModalSuccess = async (channel: YouTubeChannel) => {
  isChannelModalOpen.value = false
  showSuccessToast('Channel created successfully')
  // Refresh MCN data to update channel count
  await loadMcn()
  // Refresh channels list
  await loadChannels()
  // Navigate to channel detail page

  router.push(`/app/channels/${channel.id}`)
}

const handleInviteMcnAdmin = () => {
  isInviteMcnAdminModalOpen.value = true
}

const handleCloseInviteMcnAdminModal = () => {
  isInviteMcnAdminModalOpen.value = false
}

const handleInviteMcnAdminModalSuccess = async () => {
  isInviteMcnAdminModalOpen.value = false
  // Refresh MCN data
  await loadMcn()
}

const handleInviteCreatorUser = () => {
  isInviteCreatorUserModalOpen.value = true
}

const handleCloseInviteCreatorUserModal = () => {
  isInviteCreatorUserModalOpen.value = false
}

const handleInviteCreatorUserModalSuccess = async () => {
  isInviteCreatorUserModalOpen.value = false
  // Refresh MCN data
  await loadMcn()
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
    
    if (newTab === 'users' && mcn.value) {
      loadUsers()
    } else if (newTab === 'channels' && mcn.value) {
      loadChannels()
    } else if (newTab === 'contracts' && mcn.value) {
      await fetchContracts({ mcn_id: mcn.value.id })
    }
  }
)

const channelColumns: TableColumn[] = [
  { key: 'title', label: 'Channel Name' },
  { key: 'subscriber_count', label: 'Subscribers' },
  { key: 'view_count', label: 'Views' },
]

const mcnContracts = computed(() => {
    // Filter to show contracts relevant to this view
    // Maybe we want to see contracts where this MCN is the recipient (Org->MCN) ??
    // Or contracts this MCN issued (MCN->Channel).
    // Let's show both if they exist in `contracts`.
    // The backend `fetchContracts({ mcn_id })` likely returns contracts where mcn_id is involved.
    return contracts.value
})

const hasNoActiveOrgToMcnContract = computed(
  () =>
    !mcnContracts.value.some(
      (c: Contract) => c.contract_type === 'org_to_mcn' && c.status === 'active',
    ),
)

const canCreateOrgToMcnContractForContext = computed(
  () => !!(mcn.value?.organization_id && mcn.value?.id),
)

const openCreateOrgToMcnContractModal = () => {
  if (!mcn.value || !canCreateOrgToMcnContractForContext.value) return
  isCreateOrgToMcnContractModalOpen.value = true
}

const handleCreateOrgToMcnContractModalClose = () => {
  isCreateOrgToMcnContractModalOpen.value = false
}

const handleCreateOrgToMcnContractModalSuccess = async () => {
  isCreateOrgToMcnContractModalOpen.value = false
  showSuccessToast('Contract created successfully')
  if (mcn.value) {
    await fetchContracts({ mcn_id: mcn.value.id })
  }
}

const activeContractsCount = computed(() => mcnContracts.value.filter((c: Contract) => c.status === 'active').length)

const contractColumns: TableColumn[] = [
  { key: 'contract_number', label: 'Contract Number' },
  { key: 'entity_name', label: 'Entity' },
  { key: 'revenue_share_pct', label: 'Revenue Share' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'status', label: 'Status' },
]

const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
}

const handleThumbnailError = (event: Event, row: any) => {
  // Hide the broken image and mark row as having thumbnail error
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Mark this row as having a thumbnail error so placeholder shows
  row._thumbnailError = true
}

onMounted(() => {
  loadMcn()
})
</script>

