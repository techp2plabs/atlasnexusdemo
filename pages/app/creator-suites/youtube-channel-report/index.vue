<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">YouTube Channel Report</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Review channel videos and understand what your content delivers</p>
      </div>
      <button
        @click="showNewReportModal = true"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + New Report
      </button>
    </div>

    <!-- Active/Archived tabs (admin only) -->
    <div v-if="authStore.isAdmin" class="col-span-12">
      <Tabs v-model="statusFilter" :tabs="statusTabs" />
    </div>

    <!-- Discovery-style search, filter pills, active chips, and result count -->
    <section class="col-span-12 rounded-xl border border-border bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 sm:p-5" aria-label="Search and filter reports">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form class="relative min-w-0 flex-1" @submit.prevent="applySearch">
          <svg aria-hidden="true" class="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <label class="sr-only" for="channel-report-search">Search reports and channels</label>
          <input id="channel-report-search" v-model="searchInput" type="search" placeholder="Search report name, channel, handle, or channel ID..." class="h-10 w-full rounded-lg border border-transparent bg-gray-100 pl-10 pr-10 text-sm text-foreground placeholder:text-gray-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800" />
          <button v-if="searchInput" type="button" @click="clearSearch" aria-label="Clear search" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-gray-700">×</button>
        </form>
        <div class="flex flex-wrap items-center gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="whitespace-nowrap">Sort by</span>
            <span class="relative">
              <select v-model="sortBy" class="h-10 appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-9 text-sm font-medium text-foreground focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="recent">Recently updated</option><option value="name">Report name (A–Z)</option>
              </select>
              <svg aria-hidden="true" class="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
          </label>
          <div class="flex items-center rounded-lg border border-border p-1 dark:border-gray-700" role="group" aria-label="View mode">
            <button type="button" :aria-pressed="viewMode === 'grid'" aria-label="Grid view" title="Grid view" :class="['flex h-8 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500', viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300']" @click="setViewMode('grid')"><svg aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
            <button type="button" :aria-pressed="viewMode === 'list'" aria-label="List view" title="List view" :class="['flex h-8 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500', viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300']" @click="setViewMode('list')"><svg aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          </div>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <details class="relative">
          <summary :class="['flex cursor-pointer list-none items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden', periodStartFilter || periodEndFilter ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : 'border-border bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300']">Report period<span v-if="periodStartFilter || periodEndFilter" class="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] leading-none text-white">1</span><svg class="h-3.5 w-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary>
          <div class="absolute left-0 z-30 mt-2 grid w-[min(20rem,calc(100vw-2rem))] gap-3 rounded-xl border border-border bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-2 sm:w-[34rem]">
            <DatePicker v-model="periodStartFilter" label="From" placeholder="Start date" id="channel-report-period-start" :max-date="periodEndFilter || undefined" />
            <DatePicker v-model="periodEndFilter" label="To" placeholder="End date" id="channel-report-period-end" :min-date="periodStartFilter || undefined" />
          </div>
        </details>
        <details class="relative">
          <summary :class="['flex cursor-pointer list-none items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden', jobStatus !== 'all' ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : 'border-border bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300']">Report status<span v-if="jobStatus !== 'all'" class="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] leading-none text-white">1</span><svg class="h-3.5 w-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary>
          <div class="absolute left-0 z-30 mt-2 min-w-52 rounded-xl border border-border bg-white p-3 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
            <p class="px-2 pb-2 text-xs font-medium text-gray-500">Show reports with status</p>
            <div class="flex flex-wrap gap-1.5"><button v-for="option in reportStatusOptions" :key="option.value" type="button" :aria-pressed="jobStatus === option.value" :class="filterOptionClass(jobStatus === option.value)" @click="jobStatus = option.value">{{ option.label }}</button></div>
          </div>
        </details>
      </div>

      <div v-if="activeFilterCount" class="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <span class="text-xs text-gray-500 dark:text-gray-400">Applied filters</span>
        <button v-if="searchQuery" type="button" class="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" @click="clearSearch">Search: {{ searchQuery }} <span aria-hidden="true">×</span></button>
        <button v-if="periodStartFilter || periodEndFilter" type="button" class="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" @click="clearPeriod">Period: {{ periodStartFilter || 'Any' }} – {{ periodEndFilter || 'Any' }} <span aria-hidden="true">×</span></button>
        <button v-if="jobStatus !== 'all'" type="button" class="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" @click="jobStatus = 'all'">Status: {{ jobStatusLabel }} <span aria-hidden="true">×</span></button>
        <button type="button" class="ml-auto shrink-0 text-xs font-medium text-violet-600 underline decoration-violet-300 underline-offset-4 hover:text-violet-700 dark:text-violet-400" @click="clearFilters">Clear filters</button>
      </div>
    </section>

    <div class="col-span-12 flex flex-wrap items-center gap-x-2 gap-y-1">
      <p class="text-sm font-semibold text-foreground dark:text-white" aria-live="polite">{{ loading && !reports ? 'Loading reports…' : `${reports?.total ?? 0} reports found` }}</p>
      <span v-if="activeFilterCount" class="text-xs text-gray-400">· {{ activeFilterCount }} active {{ activeFilterCount === 1 ? 'filter' : 'filters' }}</span>
    </div>

    <!-- Reports as discovery cards -->
    <section class="col-span-12" aria-label="Channel report results" :aria-busy="loading">
      <div v-if="loading && !reports" role="status" aria-label="Loading reports" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div v-for="i in 6" :key="i" class="animate-pulse overflow-hidden rounded-xl border border-border bg-white dark:border-gray-800 dark:bg-gray-900"><div class="aspect-[16/10] bg-gray-100 dark:bg-gray-800"></div><div class="space-y-3 p-4"><div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div><div class="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800"></div><div class="h-12 rounded bg-gray-100 dark:bg-gray-800"></div></div></div>
      </div>

      <div v-else-if="error" class="rounded-xl border border-border bg-white p-8 text-center text-sm text-error-600 dark:border-gray-800 dark:bg-gray-900" role="alert">{{ error }} <button type="button" class="font-medium underline" @click="load">Try again</button></div>

      <div v-else-if="!reports?.items?.length" class="rounded-xl border border-border bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        <EmptyState v-if="activeFilterCount" title="No reports match the filters" description="Try removing a filter, or use a different search." action-label="Clear filters" @action="clearFilters" />
        <EmptyState v-else title="No reports yet" description="Create your first channel report to review channel performance." action-label="Create channel report" @action="showNewReportModal = true" />
      </div>

      <div v-else>
        <div v-if="reports.items.some((r) => r.period_in_progress)" class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">Some reports cover a period that has not ended yet. Figures may be incomplete.</div>

        <div :class="viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6' : 'flex flex-col gap-3'">
          <article v-for="report in reports.items" :key="report.id" :class="['overflow-hidden rounded-xl border border-border bg-white transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700', viewMode === 'list' ? 'sm:flex' : 'flex h-full flex-col']">
            <div :class="['relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-gray-50 to-slate-100 dark:from-violet-950/40 dark:via-gray-800 dark:to-slate-900', viewMode === 'list' ? 'aspect-video sm:aspect-auto sm:w-56 sm:shrink-0' : 'aspect-[16/10]']">
              <img v-if="report.primary_channel_thumbnail_url" :src="report.primary_channel_thumbnail_url" :alt="`${report.report_name} channel thumbnail`" class="h-24 w-24 rounded-full object-cover ring-4 ring-white/80 shadow-md dark:ring-gray-700/80" loading="lazy" @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')" />
              <span v-else class="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-2xl font-semibold text-violet-700 ring-4 ring-white/80 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-gray-700/80">{{ report.report_name.slice(0, 2).toUpperCase() }}</span>
              <span class="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm dark:bg-gray-900/90 dark:text-gray-200">YouTube report</span>
              <span :class="statusBadgeClass(report.status)" class="absolute right-3 top-3 shadow-sm">{{ statusLabel(report.status) }}</span>
            </div>

            <div class="flex min-w-0 flex-1 flex-col p-4">
              <h2 class="line-clamp-2 min-h-10 text-sm font-semibold text-gray-900 dark:text-white" :title="report.report_name">{{ report.report_name }}</h2>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ report.selection_mode === 'mcn' && report.selected_mcn_name ? report.selected_mcn_name : `${report.selected_channel_count} channel${report.selected_channel_count !== 1 ? 's' : ''}` }}<span v-if="report.period_start"> · {{ formatPeriodShort(report.period_start) }}<template v-if="report.period_end && formatPeriodShort(report.period_start) !== formatPeriodShort(report.period_end)"> – {{ formatPeriodShort(report.period_end) }}</template></span><span v-if="report.period_in_progress" class="ml-1 font-medium text-amber-700 dark:text-amber-300">Period in progress</span></p>

              <dl class="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <div class="text-left"><dd class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{{ formatMetricCompact(report.metrics?.total_views) }}</dd><dt class="text-[11px] text-gray-500 dark:text-gray-400">Views</dt></div>
                <div class="text-left"><dd class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{{ report.metrics?.total_views != null && report.metrics?.total_videos ? formatMetricCompact(report.metrics.total_views / report.metrics.total_videos) : '—' }}</dd><dt class="text-[11px] text-gray-500 dark:text-gray-400">Avg. views / video</dt></div>
                <div class="text-left"><dd class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{{ formatEngagement(report.metrics?.avg_engagement_rate) }}</dd><dt class="text-[11px] text-gray-500 dark:text-gray-400">Engagement</dt></div>
              </dl>

              <div class="mt-auto flex items-end justify-between gap-3 pt-4">
                <div class="min-w-0"><p class="truncate text-xs text-gray-500 dark:text-gray-400">Updated {{ formatDate(report.updated_at || report.created_at) }}</p><p class="truncate text-[11px] text-gray-400 dark:text-gray-500">{{ report.video_count }} videos<span v-if="showOwnerColumn && report.owner_email"> · {{ report.owner_email }}</span></p></div>
                <div class="flex shrink-0 items-center gap-2">
                  <NuxtLink :to="`/app/creator-suites/youtube-channel-report/${report.id}`" class="rounded-lg bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">Open report</NuxtLink>
                  <button v-if="statusFilter === 'archived'" type="button" @click="handleRestore(report)" class="rounded-lg border border-border px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Restore</button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-if="reports.total_pages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
          <p class="text-xs text-gray-500 dark:text-gray-400">Showing {{ (reports.page - 1) * reports.page_size + 1 }}–{{ Math.min(reports.page * reports.page_size, reports.total) }} of {{ reports.total }} reports</p>
          <nav class="flex flex-wrap items-center gap-1" aria-label="Report pages">
            <button type="button" :disabled="page <= 1" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:hover:bg-gray-800" @click="changePage(page - 1)">Prev</button>
            <button v-for="pageNumber in pageNumbers" :key="pageNumber" type="button" :aria-current="pageNumber === page ? 'page' : undefined" :aria-label="`Go to report page ${pageNumber}`" :class="['min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700', pageNumber === page ? 'border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800']" @click="changePage(pageNumber)">{{ pageNumber }}</button>
            <button type="button" :disabled="page >= reports.total_pages" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:hover:bg-gray-800" @click="changePage(page + 1)">Next</button>
          </nav>
        </div>
      </div>
    </section>

    <!-- New Report Modal -->
    <Modal
      :isOpen="showNewReportModal"
      title="New YouTube Channel Report"
      size="lg"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.reportName"
            type="text"
            placeholder="e.g. Q3 2026 Growth Report"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coverage <span class="text-red-500">*</span></label>
          <ChannelReportCoveragePicker
            v-model:selection-mode="form.selectionMode"
            v-model:mcn-id="form.mcnId"
            v-model:channel-ids="form.channelIds"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Month <span class="text-red-500">*</span></label>
          <ChannelReportPeriodPicker
            v-model:month="form.periodMonth"
            v-model:year="form.periodYear"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Manual Video URLs <span class="text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            v-model="form.manualVideoUrlsText"
            rows="3"
            placeholder="One YouTube video URL per line"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          ></textarea>
          <label class="mt-2 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <input
              v-model="form.includeManualVideoUrls"
              type="checkbox"
              class="mt-0.5 rounded border-gray-300 text-accent-foreground focus:ring-ring dark:border-gray-700 dark:bg-gray-800"
            />
            <span>
              Include manual video URLs in calculation — merges the URLs above with the automatically detected videos for this coverage/period (duplicates removed).
            </span>
          </label>
          <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {{ form.includeManualVideoUrls
              ? 'These URLs will be combined with the automatically detected videos for the selected coverage and period.'
              : 'Videos are normally fetched automatically for the selected coverage and period. Left unchecked, these URLs are only used as a fallback if that comes up empty (e.g. no uploads that month).' }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Data <span class="text-xs font-normal text-gray-400">(optional)</span></label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="onFileChange($event, 'additionalDataFile')"
              class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Stored for reference/download only — not yet analyzed.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube Shopping Data <span class="text-xs font-normal text-gray-400">(optional)</span></label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="onFileChange($event, 'shoppingDataFile')"
              class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Stored for reference/download only — not yet analyzed.</p>
          </div>
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
          @click="submitReport"
          :disabled="submitting"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Creating...' : 'Create Report' }}
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import DatePicker from '~/components/forms/DatePicker.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import Modal from '~/components/ui/Modal.vue'
import Tabs from '~/components/common/Tabs.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import ChannelReportCoveragePicker from '~/components/tools/channel-report/ChannelReportCoveragePicker.vue'
import ChannelReportPeriodPicker from '~/components/tools/channel-report/ChannelReportPeriodPicker.vue'
import {
  useChannelReport,
  firstDayOfMonth,
  lastDayOfMonth,
  parseVideoUrls,
  type ChannelReportListItem,
  type ChannelReportSelectionMode,
} from '~/composables/useChannelReport'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator', 'creator'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success: showSuccessToast, error: showErrorToast } = useToast()
const {
  loading,
  error,
  fetchReports,
  createReport,
  restoreReport,
  uploadAdditionalData,
  uploadShoppingData,
} = useChannelReport()

const reports = ref<Awaited<ReturnType<typeof fetchReports>> | null>(null)
const page = ref(Number(route.query.page) > 0 ? Number(route.query.page) : 1)
const pageNumbers = computed(() => Array.from({ length: reports.value?.total_pages ?? 0 }, (_, index) => index + 1))
const showNewReportModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

const statusTabs = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
]
const statusFilter = ref<string>(
  route.query.status === 'archived' ? 'archived' : 'active'
)

const searchQuery = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const searchInput = ref<string>(searchQuery.value)
const periodStartFilter = ref(typeof route.query.period_start === 'string' ? route.query.period_start : '')
const periodEndFilter = ref(typeof route.query.period_end === 'string' ? route.query.period_end : '')
const jobStatus = ref(typeof route.query.report_status === 'string' ? route.query.report_status : 'all')
const sortBy = ref(route.query.sort === 'name' ? 'name' : 'recent')
const viewMode = ref(route.query.view === 'list' ? 'list' : 'grid')
const activeFilterCount = computed(() => Number(Boolean(searchQuery.value)) + Number(Boolean(periodStartFilter.value)) + Number(Boolean(periodEndFilter.value)) + Number(jobStatus.value !== 'all'))
const reportStatusOptions = [
  { value: 'all', label: 'Any status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
]
const jobStatusLabel = computed(() => reportStatusOptions.find((option) => option.value === jobStatus.value)?.label || 'Any status')
const filterOptionClass = (active: boolean) => [
  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  active ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-500/10 dark:text-violet-300' : 'border-border bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
]
let loadSequence = 0

const now = new Date()

const defaultForm = () => ({
  reportName: '',
  selectionMode: 'channel' as ChannelReportSelectionMode,
  mcnId: null as string | null,
  channelIds: [] as string[],
  periodMonth: now.getMonth() + 1,
  periodYear: now.getFullYear(),
  manualVideoUrlsText: '',
  includeManualVideoUrls: false,
  additionalDataFile: null as File | null,
  shoppingDataFile: null as File | null,
})

const form = reactive(defaultForm())

const showOwnerColumn = computed(() => reports.value?.items?.some((r) => r.owner_email) ?? false)

// A Channel Report always covers exactly one calendar month.
const periodStart = computed(() => firstDayOfMonth(form.periodYear, form.periodMonth))
const periodEnd = computed(() => lastDayOfMonth(form.periodYear, form.periodMonth))

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'Creator Suites', to: '/app/creator-suites' },
  { label: 'YouTube Channel Report' },
]

const load = async () => {
  const sequence = ++loadSequence
  try {
    const result = await fetchReports(
      page.value,
      24,
      statusFilter.value as 'active' | 'archived',
      {
        q: searchQuery.value || undefined,
        periodStart: periodStartFilter.value || undefined,
        periodEnd: periodEndFilter.value || undefined,
        reportStatus: jobStatus.value === 'all' ? undefined : jobStatus.value,
        sort: sortBy.value as 'recent' | 'name',
      }
    )
    if (sequence === loadSequence) reports.value = result
  } catch {
    // error is reactive from composable
  }
}

const syncQuery = () => {
  const query: Record<string, string> = { ...(route.query as Record<string, string>) }
  if (searchQuery.value) query.q = searchQuery.value
  else delete query.q
  if (statusFilter.value !== 'active') query.status = statusFilter.value
  else delete query.status
  if (periodStartFilter.value) query.period_start = periodStartFilter.value
  else delete query.period_start
  if (periodEndFilter.value) query.period_end = periodEndFilter.value
  else delete query.period_end
  if (jobStatus.value !== 'all') query.report_status = jobStatus.value
  else delete query.report_status
  if (sortBy.value !== 'recent') query.sort = sortBy.value
  else delete query.sort
  if (viewMode.value !== 'grid') query.view = viewMode.value
  else delete query.view
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

const applyFilters = () => {
  page.value = 1
  searchQuery.value = searchInput.value.trim()
}

const setViewMode = (mode: 'grid' | 'list') => {
  viewMode.value = mode
  syncQuery()
}

const clearPeriod = () => {
  periodStartFilter.value = ''
  periodEndFilter.value = ''
}

const clearFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  clearPeriod()
  jobStatus.value = 'all'
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    const normalized = value.trim()
    if (normalized !== searchQuery.value) applyFilters()
  }, 350)
})

watch([statusFilter, searchQuery, periodStartFilter, periodEndFilter, jobStatus, sortBy], async () => {
  page.value = 1
  syncQuery()
  await load()
})

watch(() => route.query.page, (queryPage) => {
  const nextPage = Number(queryPage) > 0 ? Number(queryPage) : 1
  if (nextPage !== page.value) {
    page.value = nextPage
    load()
  }
})

watch(() => route.query, (query) => {
  const nextQ = typeof query.q === 'string' ? query.q : ''
  if (nextQ !== searchQuery.value) {
    searchQuery.value = nextQ
    searchInput.value = nextQ
  }
  periodStartFilter.value = typeof query.period_start === 'string' ? query.period_start : ''
  periodEndFilter.value = typeof query.period_end === 'string' ? query.period_end : ''
  jobStatus.value = typeof query.report_status === 'string' ? query.report_status : 'all'
  sortBy.value = query.sort === 'name' ? 'name' : 'recent'
  viewMode.value = query.view === 'list' ? 'list' : 'grid'
  page.value = Number(query.page) > 0 ? Number(query.page) : 1
}, { deep: true })

const handleRestore = async (report: ChannelReportListItem) => {
  try {
    await restoreReport(report.id)
    showSuccessToast('Report restored successfully')
    await load()
  } catch {
    // error is reactive from composable
  }
}

const closeModal = () => {
  showNewReportModal.value = false
  Object.assign(form, defaultForm())
  formError.value = null
}

const onFileChange = (event: Event, field: 'additionalDataFile' | 'shoppingDataFile') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (file) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      showErrorToast('Only .csv, .xlsx, or .xls files are accepted')
      target.value = ''
      form[field] = null
      return
    }
  }
  form[field] = file
}

const submitReport = async () => {
  formError.value = null

  if (!form.reportName.trim()) { formError.value = 'Report name is required'; return }
  if (form.selectionMode === 'mcn' && !form.mcnId) { formError.value = 'Please select an MCN'; return }
  if (form.selectionMode === 'channel' && form.channelIds.length === 0) { formError.value = 'Please select at least one channel'; return }

  submitting.value = true
  try {
    const report = await createReport({
      report_name: form.reportName.trim(),
      selection_mode: form.selectionMode,
      mcn_id: form.selectionMode === 'mcn' ? form.mcnId : null,
      channel_ids: form.selectionMode === 'channel' ? form.channelIds : [],
      period_start: periodStart.value,
      period_end: periodEnd.value,
      video_urls: parseVideoUrls(form.manualVideoUrlsText),
      include_manual_video_urls: form.includeManualVideoUrls,
    })

    // Best-effort file uploads — a failure here doesn't roll back report
    // creation or block navigation, matching the precedent set by the
    // auto-fetch-comments release for other non-critical side effects.
    if (form.additionalDataFile) {
      try {
        await uploadAdditionalData(report.id, form.additionalDataFile)
      } catch {
        showErrorToast('Report created, but the Additional Data file failed to upload. You can retry from the Setup tab.')
      }
    }
    if (form.shoppingDataFile) {
      try {
        await uploadShoppingData(report.id, form.shoppingDataFile)
      } catch {
        showErrorToast('Report created, but the YouTube Shopping Data file failed to upload. You can retry from the Setup tab.')
      }
    }

    closeModal()
    router.push(`/app/creator-suites/youtube-channel-report/${report.id}`)
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to create report'
  } finally {
    submitting.value = false
  }
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }
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

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

const formatMetricCompact = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

const formatEngagement = (rate: number | null | undefined) => {
  if (rate === null || rate === undefined) return '—'
  return `${rate.toFixed(1)}%`
}

const formatPeriodShort = (d: string | null | undefined) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

onMounted(async () => {
  await load()
})
</script>
