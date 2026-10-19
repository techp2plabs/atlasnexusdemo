<template>
  <div class="grid grid-cols-12 gap-4 md:gap-5">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Header — matches design: title + description left, Compare / Import / Add right -->
    <div class="col-span-12 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight text-foreground dark:text-white">Creator Discovery</h1>
        <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Build and explore your creator bank. Search, filter, and compare creators to find the best fit for your campaign.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          :disabled="compareIds.length < 2"
          :title="compareIds.length < 2 ? 'Select at least 2 creators to compare' : `Compare ${compareIds.length} creators`"
          :class="[
            'rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
            compareIds.length >= 2
              ? 'border-border bg-white text-gray-800 hover:border-brand-300 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
              : 'border-border bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500',
          ]"
          @click="goToCompare"
        >
          Compare ({{ compareIds.length }})
        </button>
        <details class="relative">
          <summary class="cursor-pointer list-none rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 [&::-webkit-details-marker]:hidden">
            Import creators
          </summary>
          <div class="absolute right-0 z-20 mt-2 min-w-60 rounded-xl border border-border bg-white p-1.5 shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
            <NuxtLink to="/app/youtube-brand-campaign/creator-discovery/sync" class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5">Sync from Channels</NuxtLink>
            <button type="button" class="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-white/5" :disabled="syncingReports" @click="runSyncFromBrandDealReports">{{ syncingReports ? 'Syncing…' : 'Sync from Brand Deal Reports' }}</button>
          </div>
        </details>
        <NuxtLink to="/app/youtube-brand-campaign/creator-discovery/add" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
          + Add Creator
        </NuxtLink>
      </div>
    </div>

    <!-- Toolbar card: search + sort + view toggle, filter pills, niche quick chips -->
    <div class="col-span-12 rounded-xl border border-border bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <!-- Row 1: search + sort + view toggle -->
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form class="relative min-w-0 flex-1" @submit.prevent="applyFilters">
          <svg aria-hidden="true" class="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="draftFilters.q"
            type="search"
            placeholder="Search creator name, handle, or channel ID..."
            class="h-10 w-full rounded-lg border border-transparent bg-gray-100 pl-10 pr-3 text-sm text-foreground placeholder:text-gray-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
            @input="onSearchInput"
          />
        </form>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="whitespace-nowrap text-sm">Sort by</span>
            <span class="relative">
              <select :value="appliedFilters.sort" class="h-10 appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-9 text-sm font-medium text-foreground focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white" @change="applySort">
                <option value="channel_synced_at_desc">Recently updated</option>
                <option value="avg_views_desc">Avg. views/video</option>
                <option value="engagement_rate_desc">Engagement rate</option>
                <option value="subscriber_count_desc">Subscribers</option>
                <option value="title_asc">Name (A-Z)</option>
              </select>
              <svg aria-hidden="true" class="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
          </label>
          <div class="ml-1 flex items-center rounded-lg border border-border p-1 dark:border-gray-700" role="group" aria-label="View mode">
            <button
              type="button"
              :aria-pressed="viewMode === 'grid'"
              title="Grid view"
              :class="['flex h-8 w-9 items-center justify-center rounded-md transition-colors', viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300']"
              @click="viewMode = 'grid'"
            >
              <svg aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button
              type="button"
              :aria-pressed="viewMode === 'list'"
              title="List view"
              :class="['flex h-8 w-9 items-center justify-center rounded-md transition-colors', viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300']"
              @click="viewMode = 'list'"
            >
              <svg aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Row 2: filter pills -->
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <FilterPill label="Subscribers" icon="users" :active="draftFilters.min_subscribers != null">
          <div class="w-64 p-1">
            <p class="px-2 pb-2 pt-1 text-xs font-medium text-gray-500">Minimum subscribers</p>
            <div class="flex flex-wrap gap-1.5 px-2">
              <button v-for="opt in SUBS_PRESETS" :key="opt.label" type="button" :class="pillOptionClass(draftFilters.min_subscribers === opt.value)" @click="setNumericFilter('min_subscribers', opt.value)">{{ opt.label }}</button>
            </div>
            <div class="mt-2 flex items-center gap-2 px-2 pb-1">
              <input v-model.number="draftFilters.min_subscribers" type="number" min="0" placeholder="Custom…" class="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" @change="applyFilters" />
            </div>
          </div>
        </FilterPill>

        <FilterPill label="Avg. views / video" icon="chart" :active="draftFilters.min_avg_views != null">
          <div class="w-64 p-1">
            <p class="px-2 pb-2 pt-1 text-xs font-medium text-gray-500">Minimum average views</p>
            <div class="flex flex-wrap gap-1.5 px-2">
              <button v-for="opt in VIEWS_PRESETS" :key="opt.label" type="button" :class="pillOptionClass(draftFilters.min_avg_views === opt.value)" @click="setNumericFilter('min_avg_views', opt.value)">{{ opt.label }}</button>
            </div>
            <div class="mt-2 flex items-center gap-2 px-2 pb-1">
              <input v-model.number="draftFilters.min_avg_views" type="number" min="0" placeholder="Custom…" class="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" @change="applyFilters" />
            </div>
          </div>
        </FilterPill>

        <FilterPill label="Engagement rate" icon="trend" :active="draftFilters.min_engagement_rate != null">
          <div class="w-64 p-1">
            <p class="px-2 pb-2 pt-1 text-xs font-medium text-gray-500">Minimum engagement rate</p>
            <div class="flex flex-wrap gap-1.5 px-2">
              <button v-for="opt in ENGAGEMENT_PRESETS" :key="opt.label" type="button" :class="pillOptionClass(draftFilters.min_engagement_rate === opt.value)" @click="setNumericFilter('min_engagement_rate', opt.value)">{{ opt.label }}</button>
            </div>
            <div class="mt-2 flex items-center gap-2 px-2 pb-1">
              <input v-model.number="draftFilters.min_engagement_rate" type="number" min="0" max="100" step="0.1" placeholder="Custom %…" class="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" @change="applyFilters" />
            </div>
          </div>
        </FilterPill>

        <FilterPill label="Niche" icon="tag" :active="draftFilters.topics.length > 0" :badge="draftFilters.topics.length || undefined">
          <div class="w-72 p-1">
            <div class="px-2 pb-2 pt-1">
              <input v-model="topicSearch" type="search" placeholder="Find a niche…" class="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
            </div>
            <div class="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto px-2 pb-2">
              <button
                v-for="t in filteredTopics"
                :key="t.topic"
                type="button"
                :aria-pressed="draftFilters.topics.includes(t.topic)"
                :class="pillOptionClass(draftFilters.topics.includes(t.topic))"
                @click="toggleTopicAndApply(t.topic)"
              >
                {{ t.topic }}
              </button>
              <p v-if="topicsLoading" class="px-2 py-1 text-xs text-gray-500">Loading niches…</p>
              <p v-else-if="filteredTopics.length === 0" class="px-2 py-1 text-xs text-gray-500">{{ topicSearch ? 'No niches match this search.' : 'No niches available yet.' }}</p>
            </div>
          </div>
        </FilterPill>

        <FilterPill label="Country" icon="globe" :active="Boolean(draftFilters.country)">
          <div class="w-64 p-1">
            <p class="px-2 pb-2 pt-1 text-xs font-medium text-gray-500">Channel country (2-letter code)</p>
            <div class="flex flex-wrap gap-1.5 px-2">
              <button v-for="c in COUNTRY_PRESETS" :key="c" type="button" :class="pillOptionClass(draftFilters.country === c)" @click="setCountryFilter(c)">{{ c }}</button>
            </div>
            <div class="mt-2 px-2 pb-1">
              <input v-model="draftFilters.country" maxlength="2" placeholder="e.g. ID" class="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm uppercase dark:border-gray-700 dark:bg-gray-800" @change="applyFilters" />
            </div>
          </div>
        </FilterPill>

        <FilterPill label="More filters" icon="sliders" :active="Boolean(draftFilters.source) || draftFilters.has_verified_youtube_rates === true">
          <div class="w-72 space-y-3 p-3">
            <label v-if="summaryData?.capabilities?.source_filter" class="block text-sm">
              <span class="mb-1 block text-xs font-medium text-gray-500">Source</span>
              <select v-model="draftFilters.source" class="h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-800" @change="applyFilters">
                <option value="">Any source</option>
                <option value="managed_channel">Managed channel</option>
                <option value="manual_lookup">Manual lookup</option>
                <option value="import">Import</option>
                <option value="brand_deal_report">Brand Deal Report</option>
              </select>
            </label>
            <label v-if="summaryData?.capabilities?.verified_youtube_rate_filter" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input v-model="draftFilters.has_verified_youtube_rates" type="checkbox" :true-value="true" :false-value="undefined" class="h-4 w-4 rounded border-gray-300 accent-violet-600" @change="applyFilters" />
              Has verified YouTube rates
            </label>
          </div>
        </FilterPill>
      </div>

      <!-- Row 3: niche quick chips + clear -->
      <div class="mt-3 flex items-center gap-2">
        <div class="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          <button
            type="button"
            :aria-pressed="draftFilters.topics.length === 0"
            :class="[
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              draftFilters.topics.length === 0
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                : 'bg-gray-100 text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            ]"
            @click="clearTopicsAndApply"
          >
            All niches
          </button>
          <button
            v-for="t in quickTopics"
            :key="t.topic"
            type="button"
            :title="`${t.topic} · ${t.count} creators`"
            :aria-pressed="draftFilters.topics.includes(t.topic)"
            :class="[
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              draftFilters.topics.includes(t.topic)
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                : 'bg-gray-100 text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            ]"
            @click="toggleTopicAndApply(t.topic)"
          >
            {{ t.topic }}
          </button>
        </div>
        <button type="button" class="shrink-0 text-xs font-medium text-violet-600 underline decoration-violet-300 underline-offset-4 hover:text-violet-700 dark:text-violet-400" @click="clearFilters">
          Clear filters
        </button>
      </div>
    </div>

    <!-- Count row -->
    <div class="col-span-12 flex flex-wrap items-center gap-x-2 gap-y-1">
      <p class="text-sm font-semibold text-foreground dark:text-white" aria-live="polite">{{ loading && !hasLoaded ? 'Finding creators…' : `${total} creators found` }}</p>
      <details v-if="summaryData" class="relative">
        <summary class="cursor-pointer text-xs text-gray-400 underline decoration-dotted underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300">Source breakdown</summary>
        <div class="absolute left-0 z-10 mt-2 grid min-w-64 grid-cols-2 gap-3 rounded-xl border border-border bg-white p-4 shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
          <SummaryCard label="Managed channels" :value="summaryData?.synced_from_channels ?? '—'" />
          <SummaryCard label="Externally discovered" :value="summaryData?.externally_discovered ?? '—'" />
          <SummaryCard label="Brand Deal Reports" :value="summaryData?.from_brand_deal_reports ?? '—'" />
          <SummaryCard label="Niches represented" :value="summaryData?.niches_represented ?? '—'" />
        </div>
      </details>
      <span v-if="activeFilterCount" class="text-xs text-gray-400">· {{ activeFilterCount }} active {{ activeFilterCount === 1 ? 'filter' : 'filters' }}</span>
    </div>

    <!-- Compare selection bar -->
    <div v-if="discovery.selected.length" class="sticky top-16 z-20 col-span-12 flex flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-white p-3 shadow-theme-sm dark:border-violet-800 dark:bg-gray-900" aria-label="Comparison selection">
      <button v-for="creator in discovery.selected" :key="creator.id" type="button" class="flex max-w-full items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm" :aria-label="`Remove ${creator.title} from comparison`" @click="discovery.toggle(creator)"><img v-if="creator.thumbnail_url" :src="creator.thumbnail_url" alt="" class="h-6 w-6 rounded-full object-cover" /><span class="truncate">{{ creator.title }}</span><span aria-hidden="true">×</span></button>
      <span class="text-xs text-gray-500" role="status">{{ discovery.message || (compareIds.length === 1 ? 'Choose one more creator to compare.' : `${compareIds.length} creators selected.`) }}</span>
      <NuxtLink v-if="compareIds.length >= 2" :to="{ path: '/app/youtube-brand-campaign/creator-discovery/compare', query: { ids: compareIds.join(',') } }" class="ml-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900">Compare {{ compareIds.length }} creators</NuxtLink>
    </div>

    <!-- Results -->
    <section class="col-span-12" aria-label="Creator results" :aria-busy="loading">
      <div v-if="loading && !hasLoaded" role="status" aria-label="Loading creators" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div v-for="i in 8" :key="i" class="animate-pulse overflow-hidden rounded-xl border border-border bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="aspect-[16/10] bg-gray-100 dark:bg-gray-800"></div>
          <div class="space-y-2.5 p-4">
            <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-8 rounded bg-gray-100 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>

      <div v-else-if="listError" class="rounded-xl border border-border bg-white p-8 text-center text-sm text-error-600 dark:border-gray-800 dark:bg-gray-900" role="alert">
        {{ listError }} <button type="button" class="font-medium underline" @click="fetchList">Try again</button>
      </div>

      <div v-else-if="profiles.length === 0" class="rounded-xl border border-border bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        <EmptyState
          title="No creators match the filters"
          description="Try removing a filter, or add a creator to the bank."
          action-label="Clear filters"
          @action="clearFilters"
        />
      </div>

      <!-- Grid view — aligns with design cards -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <CreatorCard
          v-for="creator in profiles"
          :key="creator.id"
          :creator="creator"
          :selected="compareIds.includes(creator.id)"
          :saved="savedIds.has(creator.id)"
          @toggle-compare="toggleCompare(creator.id)"
          @toggle-saved="toggleSaved(creator.id)"
          @preview="openPreview(creator)"
        />
      </div>

      <!-- List view -->
      <div v-else class="flex flex-col gap-3">
        <article
          v-for="creator in profiles"
          :key="creator.id"
          :class="compareIds.includes(creator.id) ? 'border-violet-400 dark:border-violet-600' : 'border-border dark:border-gray-800'"
          class="flex flex-col gap-4 rounded-xl border bg-white p-3 transition-colors dark:bg-gray-900 sm:flex-row sm:items-center"
        >
          <button type="button" class="relative block w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 sm:w-60" @click="openPreview(creator)" :aria-label="`Quick look at ${creator.title}`">
            <span class="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-violet-50 via-gray-50 to-slate-100 dark:from-violet-950/40 dark:via-gray-800 dark:to-slate-900">
              <img v-if="creator.thumbnail_url" :src="creator.thumbnail_url" :alt="`${creator.title} channel avatar`" class="h-24 w-24 rounded-full object-contain ring-4 ring-white/80 shadow-md dark:ring-gray-700/80" loading="lazy" />
              <span v-else class="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-2xl font-semibold text-violet-700 ring-4 ring-white/80 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-gray-700/80">{{ (creator.title || '??').slice(0, 2).toUpperCase() }}</span>
            </span>
          </button>
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-3">
              <div class="min-w-0">
                <p class="flex min-w-0 items-center gap-1.5">
                  <svg aria-hidden="true" class="h-4 w-4 shrink-0 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.4 3.5 12 3.5 12 3.5s-4.4 0-7.7.4c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.4 7.6.4s4.4 0 7.7-.4c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.8 15V8.4l6.2 3.3L9.8 15z" /></svg>
                  <NuxtLink :to="`/app/youtube-brand-campaign/creator-discovery/${creator.id}`" class="truncate text-sm font-semibold text-gray-900 hover:text-violet-700 dark:text-white">{{ creator.title || 'Untitled channel' }}</NuxtLink>
                  <svg v-if="isVerified(creator)" aria-label="Verified creator" class="h-3.5 w-3.5 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2l2.4 2.4 3.4-.5.9 3.3 3 1.7-1.5 3.1 1.5 3.1-3 1.7-.9 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-.9-3.3-3-1.7L3.8 12 2.3 8.9l3-1.7.9-3.3 3.4.5L12 2zm-1.2 13.6l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z" clip-rule="evenodd" /></svg>
                </p>
                <p class="truncate text-xs text-gray-500">{{ creator.custom_url || creator.channel_id }}</p>
              </div>
              <button type="button" :aria-pressed="savedIds.has(creator.id)" :aria-label="savedIds.has(creator.id) ? `Unsave ${creator.title}` : `Save ${creator.title}`" class="ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5" @click="toggleSaved(creator.id)">
                <svg aria-hidden="true" class="h-4 w-4" :fill="savedIds.has(creator.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" /></svg>
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span v-for="topic in creator.topics.slice(0, 3)" :key="topic" class="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{{ topic }}</span>
              <span v-if="creator.topics.length > 3" class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">+{{ creator.topics.length - 3 }}</span>
            </div>
            <dl class="mt-2 flex max-w-md gap-6">
              <div><dt class="sr-only">Subscribers</dt><dd class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{{ formatCompactNumber(creator.subscriber_count) }}</dd><dd class="text-[11px] text-gray-500">Subscribers</dd></div>
              <div><dt class="sr-only">Avg. views</dt><dd class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{{ creator.performance_summary?.avg_views_per_video == null ? '—' : formatCompactNumber(creator.performance_summary.avg_views_per_video) }}</dd><dd class="text-[11px] text-gray-500">Avg. views</dd></div>
              <div><dt class="sr-only">Engagement</dt><dd class="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{{ engagementLabel(creator) }}</dd><dd class="text-[11px] text-gray-500">Engagement</dd></div>
            </dl>
          </div>
          <div class="flex shrink-0 gap-2 sm:w-56 sm:flex-col">
            <NuxtLink :to="`/app/youtube-brand-campaign/creator-discovery/${creator.id}`" class="flex-1 rounded-lg border border-border px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5">View profile</NuxtLink>
            <button type="button" :class="['flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', compareIds.includes(creator.id) ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900']" @click="toggleCompare(creator.id)">{{ compareIds.includes(creator.id) ? '✓ In compare' : 'Add to compare' }}</button>
          </div>
        </article>
      </div>

      <div v-if="!loading && profiles.length && totalPages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs text-gray-500 dark:text-gray-400">Page {{ page }} of {{ totalPages }} ({{ total }} total)</p>
        <nav class="flex items-center gap-1" aria-label="Creator pages">
          <button type="button" :disabled="page <= 1" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:hover:bg-gray-800" @click="goToPage(page - 1)">Prev</button>
          <button
            v-for="pageNumber in pageNumbers"
            :key="pageNumber"
            type="button"
            :aria-current="pageNumber === page ? 'page' : undefined"
            :aria-label="`Go to page ${pageNumber}`"
            :class="['min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700', pageNumber === page ? 'border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800']"
            @click="goToPage(pageNumber)"
          >{{ pageNumber }}</button>
          <button type="button" :disabled="page >= totalPages" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:hover:bg-gray-800" @click="goToPage(page + 1)">Next</button>
        </nav>
      </div>
    </section>

    <!-- Preview drawer — quick look before opening the full profile -->
    <PreviewDrawer v-model:open="isPreviewOpen" :title="previewCreator?.title ?? ''">
      <template v-if="previewCreator" #summary>
        <div class="flex items-center gap-3">
          <img v-if="previewCreator.thumbnail_url" :src="previewCreator.thumbnail_url" class="h-12 w-12 rounded-full object-cover" />
          <div v-else class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-white/5">
            {{ (previewCreator.title ?? '??').slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="truncate font-medium text-gray-800 dark:text-white/90">{{ previewCreator.title }}</p>
            <p class="truncate text-sm text-gray-500 dark:text-gray-400">{{ previewCreator.custom_url }}</p>
          </div>
          <span
            v-for="label in sourceLabels(previewCreator)"
            :key="label"
            class="ml-auto shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400"
          >
            {{ label }}
          </span>
        </div>
      </template>
      <template v-if="previewCreator" #stats>
        <MetricValue label="Subscribers" :value="formatCompactNumber(previewCreator.subscriber_count)" />
        <MetricValue label="Total views" :value="formatCompactNumber(previewCreator.view_count)" />
        <MetricValue label="Videos" :value="previewCreator.video_count ?? '—'" />
        <MetricValue label="Avg. views / video" :value="previewCreator.performance_summary?.avg_views_per_video == null ? 'Unavailable' : formatCompactNumber(previewCreator.performance_summary.avg_views_per_video)" />
        <MetricValue label="Engagement rate" :value="engagementLabel(previewCreator)" />
        <MetricValue label="Country" :value="previewCreator.country || '—'" />
      </template>

      <template v-if="previewCreator">
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-300">{{ youtubeRateState(previewCreator.rate_card) }}</p>
        <p class="mb-4 text-xs text-gray-500">{{ previewCreator.performance_summary?.sample_video_count != null ? `${previewCreator.performance_summary.sample_video_count} public uploads sampled` : 'Sample context unavailable' }}<span v-if="previewCreator.stats_fetched_at"> · Profile refreshed {{ new Date(previewCreator.stats_fetched_at).toLocaleDateString() }}</span></p>
        <div v-if="previewCreator.topics.length" class="mb-4">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Topics</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="t in previewCreator.topics" :key="t" class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">{{ t }}</span>
          </div>
        </div>

        <div v-if="previewCreator.description" class="mb-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">About</p>
          <p class="line-clamp-4 text-sm text-gray-600 dark:text-gray-300">{{ previewCreator.description }}</p>
        </div>

        <div v-if="previewCreator.rate_card?.shorts?.min != null || previewCreator.rate_card?.shorts?.max != null || previewCreator.rate_card?.longform?.min != null || previewCreator.rate_card?.longform?.max != null" class="mb-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Rate card</p>
          <div class="grid grid-cols-2 gap-3">
            <div v-if="previewCreator.rate_card?.shorts?.min != null || previewCreator.rate_card?.shorts?.max != null">
              <p class="text-xs text-gray-400">Shorts</p>
              <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ previewCreator.rate_card.currency_verified && previewCreator.rate_card.currency ? formatCurrencyRange(previewCreator.rate_card.shorts.min, previewCreator.rate_card.shorts.max, previewCreator.rate_card.currency) : `${formatNumber(previewCreator.rate_card.shorts.min)} – ${formatNumber(previewCreator.rate_card.shorts.max)} · Currency unverified` }}</p>
            </div>
            <div v-if="previewCreator.rate_card?.longform?.min != null || previewCreator.rate_card?.longform?.max != null">
              <p class="text-xs text-gray-400">Long-form</p>
              <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ previewCreator.rate_card.currency_verified && previewCreator.rate_card.currency ? formatCurrencyRange(previewCreator.rate_card.longform.min, previewCreator.rate_card.longform.max, previewCreator.rate_card.currency) : `${formatNumber(previewCreator.rate_card.longform.min)} – ${formatNumber(previewCreator.rate_card.longform.max)} · Currency unverified` }}</p>
            </div>
          </div>
        </div>

        <div v-if="previewCreator.contact?.email || previewCreator.contact?.whatsapp || previewCreator.social_links.length" class="border-t border-gray-100 pt-4 dark:border-gray-800">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Contact</p>
          <div class="flex flex-col gap-1 text-sm">
            <a v-if="previewCreator.contact?.email" :href="`mailto:${previewCreator.contact.email}`" class="text-brand-600 hover:underline">{{ previewCreator.contact.email }}</a>
            <a v-if="previewCreator.contact?.whatsapp" :href="`https://wa.me/${previewCreator.contact.whatsapp.replace(/\D/g, '')}`" target="_blank" rel="noopener" class="text-brand-600 hover:underline">{{ previewCreator.contact.whatsapp }}</a>
            <span v-for="s in previewCreator.social_links" :key="s.platform + s.handle_or_url" class="text-gray-500 dark:text-gray-400">{{ s.platform }}: {{ s.handle_or_url }}</span>
          </div>
        </div>
      </template>

      <template v-if="previewCreator" #actions>
        <button
          type="button"
          :disabled="!compareIds.includes(previewCreator.id) && compareIds.length >= 3"
          :class="[
            'rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50',
            compareIds.includes(previewCreator.id)
              ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5',
          ]"
          @click="toggleCompare(previewCreator.id)"
        >
          {{ compareIds.includes(previewCreator.id) ? '✓ Added to compare' : '+ Add to compare' }}
        </button>
      </template>
      <template #footer-link>
        <NuxtLink :to="`/app/youtube-brand-campaign/creator-discovery/${previewCreator?.id}`" class="text-sm font-medium text-brand-600 hover:underline">
          Open full profile →
        </NuxtLink>
      </template>
    </PreviewDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, nextTick, reactive, ref, resolveComponent, watch } from 'vue'
import { useCreatorDiscoverySessionStore } from '~/stores/creatorDiscovery'
import { parseDiscoveryQuery, discoveryQuery, youtubeRateState } from '~/utils/creatorDiscoveryState.mjs'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import MetricValue from '~/components/common/MetricValue.vue'
import PreviewDrawer from '~/components/campaigns/PreviewDrawer.vue'
import SummaryCard from '~/components/youtubeBrandCampaign/SummaryCard.vue'
import { useCreatorDiscovery, type CreatorProfile } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import { formatCompactNumber, formatCurrencyRange, formatNumber } from '~/utils/youtubeBrandCampaignFormat'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'],
})

// ── Small local building blocks (kept in-file so the discovery page stays self-contained) ──

const FilterPill = defineComponent({
  name: 'FilterPill',
  props: {
    label: { type: String, required: true },
    icon: { type: String, default: '' },
    active: { type: Boolean, default: false },
    badge: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    const icons: Record<string, string> = {
      users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
      chart: 'M18 20V10M12 20V4M6 20v-6',
      trend: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
      tag: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
      globe: 'M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
      sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    }
    return () =>
      h(
        'details',
        {
          class:
            'group relative rounded-lg border text-sm transition-colors ' +
            (props.active
              ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
              : 'border-border bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              ),
        },
        [
          h(
            'summary',
            {
              class:
                'flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden',
            },
            [
              props.icon && icons[props.icon]
                ? h('svg', { class: 'h-3.5 w-3.5 opacity-70', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
                    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: icons[props.icon] }),
                  ])
                : null,
              h('span', props.label),
              props.badge
                ? h('span', { class: 'rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white' }, String(props.badge))
                : null,
              h('svg', { class: 'h-3.5 w-3.5 opacity-50 transition-transform group-open:rotate-180', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
                h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 9l-7 7-7-7' }),
              ]),
            ],
          ),
          h(
            'div',
            { class: 'absolute left-0 z-20 mt-2 min-w-56 rounded-xl border border-border bg-white shadow-theme-md dark:border-gray-700 dark:bg-gray-900' },
            slots.default?.(),
          ),
        ],
      )
  },
})

const CreatorCard = defineComponent({
  name: 'CreatorCard',
  props: {
    creator: { type: Object as () => CreatorProfile, required: true },
    selected: { type: Boolean, default: false },
    saved: { type: Boolean, default: false },
  },
  emits: ['toggle-compare', 'toggle-saved', 'preview'],
  setup(props, { emit }) {
    function engagement(c: CreatorProfile): string {
      const v = c.performance_summary?.engagement_rate
      if (v == null || !Number.isFinite(v)) return '—'
      return `${v.toFixed(1)}%`
    }
    function verified(c: CreatorProfile): boolean {
      return (c.sources || []).includes('managed_channel')
    }
    function coverSrc(): string {
      return props.creator.thumbnail_url || ''
    }
    const NuxtLinkComp = resolveComponent('NuxtLink')
    return () => {
      const c = props.creator
      return h(
        'article',
        {
          class:
            'flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all dark:bg-gray-900 ' +
            (props.selected
              ? 'border-violet-500 shadow-theme-sm ring-2 ring-violet-500/20 dark:border-violet-500'
              : 'border-border hover:border-gray-300 hover:shadow-theme-sm dark:border-gray-800'),
        },
        [
          // Show the channel avatar as the card cover, with initials as fallback.
          h('div', { class: 'relative flex aspect-[16/10] cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-gray-50 to-slate-100 dark:from-violet-950/40 dark:via-gray-800 dark:to-slate-900', onClick: () => emit('preview') }, [
            coverSrc()
              ? h('img', {
                  src: coverSrc(),
                  alt: `${c.title || 'Creator'} channel avatar`,
                  loading: 'lazy',
                  class: 'h-32 w-32 rounded-full object-contain ring-4 ring-white/80 shadow-md dark:ring-gray-700/80',
                })
              : h('span', { class: 'flex h-32 w-32 items-center justify-center rounded-full bg-violet-100 text-3xl font-semibold text-violet-700 ring-4 ring-white/80 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-gray-700/80' }, (c.title || '??').slice(0, 2).toUpperCase()),
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': props.selected,
                'aria-label': props.selected ? `Remove ${c.title} from compare` : `Select ${c.title} for compare`,
                class:
                  'absolute left-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-md border shadow-sm transition-colors ' +
                  (props.selected ? 'border-violet-600 bg-violet-600 text-white' : 'border-gray-200 bg-white/95 text-transparent hover:border-violet-400'),
                onClick: () => emit('toggle-compare'),
              },
              [
                h('svg', { class: 'h-3.5 w-3.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
                  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '3', d: 'M5 13l4 4L19 7' }),
                ]),
              ],
            ),
            h(
              'button',
              {
                type: 'button',
                'aria-pressed': props.saved,
                'aria-label': props.saved ? `Unsave ${c.title}` : `Save ${c.title}`,
                class: 'absolute right-2.5 top-2.5 rounded-md bg-white/95 p-1.5 shadow-sm transition-colors hover:text-gray-900 ' + (props.saved ? 'text-violet-600' : 'text-gray-500'),
                onClick: () => emit('toggle-saved'),
              },
              [
                h('svg', { class: 'h-4 w-4', fill: props.saved ? 'currentColor' : 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
                  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z' }),
                ]),
              ],
            ),
          ]),
          // Body
          h('div', { class: 'flex flex-1 flex-col p-3.5' }, [
            h('div', { class: 'flex items-center gap-2.5' }, [
              h('div', { class: 'min-w-0' }, [
                h('p', { class: 'flex min-w-0 items-center gap-1' }, [
                  h('svg', { class: 'h-4 w-4 shrink-0 text-red-600', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' }, [
                    h('path', { d: 'M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.4 3.5 12 3.5 12 3.5s-4.4 0-7.7.4c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.4 7.6.4s4.4 0 7.7-.4c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.8 15V8.4l6.2 3.3L9.8 15z' }),
                  ]),
                  h('span', { class: 'truncate text-sm font-semibold text-gray-900 dark:text-white', title: c.title || 'Untitled channel' }, c.title || 'Untitled channel'),
                  verified(c)
                    ? h('svg', { class: 'h-3.5 w-3.5 shrink-0 text-blue-500', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-label': 'Verified creator' }, [
                        h('path', { 'fill-rule': 'evenodd', d: 'M12 2l2.4 2.4 3.4-.5.9 3.3 3 1.7-1.5 3.1 1.5 3.1-3 1.7-.9 3.3-3.4-.5L12 22l-2.4-2.4-3.4.5-.9-3.3-3-1.7L3.8 12 2.3 8.9l3-1.7.9-3.3 3.4.5L12 2zm-1.2 13.6l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z', 'clip-rule': 'evenodd' }),
                      ])
                    : null,
                ]),
                h('p', { class: 'truncate text-xs text-gray-500 dark:text-gray-400' }, c.custom_url || c.channel_id),
              ]),
            ]),
            h('div', { class: 'mt-2.5 h-10 overflow-hidden flex flex-wrap content-start items-start gap-1.5' }, [
              ...(c.topics || []).slice(0, 2).map((t: string) =>
                h('span', { key: t, class: 'rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' }, t),
              ),
              (c.topics || []).length > 2
                ? h('span', { class: 'rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400' }, `+${(c.topics || []).length - 2}`)
                : null,
            ]),
            h('dl', { class: 'mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800' }, [
              h('div', { class: 'text-left' }, [
                h('dd', { class: 'text-sm font-bold tabular-nums text-gray-900 dark:text-white' }, formatCompactNumber(c.subscriber_count)),
                h('dt', { class: 'text-[11px] text-gray-500 dark:text-gray-400' }, 'Subscribers'),
              ]),
              h('div', { class: 'text-left' }, [
                h('dd', { class: 'text-sm font-bold tabular-nums text-gray-900 dark:text-white' }, c.performance_summary?.avg_views_per_video == null ? '—' : formatCompactNumber(c.performance_summary.avg_views_per_video)),
                h('dt', { class: 'text-[11px] text-gray-500 dark:text-gray-400' }, 'Avg. views'),
              ]),
              h('div', { class: 'text-left' }, [
                h('dd', { class: 'text-sm font-bold tabular-nums text-gray-900 dark:text-white' }, engagement(c)),
                h('dt', { class: 'text-[11px] text-gray-500 dark:text-gray-400' }, 'Engagement'),
              ]),
            ]),
            h('div', { class: 'mt-3 grid grid-cols-1 gap-2' }, [
              h(NuxtLinkComp, { to: `/app/youtube-brand-campaign/creator-discovery/${c.id}`, class: 'rounded-lg border border-border px-3 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5' }, () => 'View profile'),
              h(
                'button',
                {
                  type: 'button',
                  class: 'rounded-lg px-3 py-2 text-sm font-medium transition-colors ' + (props.selected ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'),
                  onClick: () => emit('toggle-compare'),
                },
                props.selected ? '✓ In compare' : 'Add to compare',
              ),
            ]),
          ]),
        ],
      )
    }
  },
})

// ── Page state ──

const {
  list, syncFromChannels, syncFromBrandDealReports,
  topicsFacet, summary: fetchSummary,
} = useCreatorDiscovery()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const discovery = useCreatorDiscoverySessionStore()

const breadcrumbItems = [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Creator Discovery' },
]

const profiles = ref<CreatorProfile[]>([])
const total = ref(0)
const page = ref(1)
// 6 cards per row → 24 fills exactly 4 rows, no ragged last row.
const PAGE_SIZE = 24
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))
const loading = ref(false)
const hasLoaded = ref(false)
const listError = ref('')
let latestListRequest = 0
const topicOptions = ref<{ topic: string; count: number }[]>([])
const topicsLoading = ref(false)
const summaryData = ref<Awaited<ReturnType<typeof fetchSummary>> | null>(null)
const compareIds = computed(() => discovery.selected.map((item) => item.id))
const appliedFilters = computed(() => parseDiscoveryQuery(route.query))
const topicSearch = ref('')
const topicsError = ref('')
const filteredTopics = computed(() => topicOptions.value.filter((item) => item.topic.toLowerCase().includes(topicSearch.value.toLowerCase())))
const quickTopics = computed(() => topicOptions.value.slice(0, 12))

const viewMode = ref<'grid' | 'list'>('grid')
const savedIds = ref<Set<string>>(new Set())

const SUBS_PRESETS = [
  { label: 'Any', value: undefined as number | undefined },
  { label: '10K+', value: 10000 },
  { label: '100K+', value: 100000 },
  { label: '1M+', value: 1000000 },
]
const VIEWS_PRESETS = [
  { label: 'Any', value: undefined as number | undefined },
  { label: '10K+', value: 10000 },
  { label: '100K+', value: 100000 },
  { label: '500K+', value: 500000 },
]
const ENGAGEMENT_PRESETS = [
  { label: 'Any', value: undefined as number | undefined },
  { label: '1%+', value: 1 },
  { label: '3%+', value: 3 },
  { label: '5%+', value: 5 },
]
const COUNTRY_PRESETS = ['ID', 'MY', 'SG', 'PH', 'US']

function pillOptionClass(on: boolean) {
  return [
    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
    on
      ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
      : 'border-border bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
  ]
}

const draftFilters = reactive({
  q: '',
  topics: [] as string[],
  country: '',
  source: '',
  has_verified_youtube_rates: undefined as boolean | undefined,
  min_subscribers: undefined as number | undefined,
  min_avg_views: undefined as number | undefined,
  min_engagement_rate: undefined as number | undefined,
  sort: 'channel_synced_at_desc',
})

const activeFilterCount = computed(() => {
  const filters = appliedFilters.value
  const numericFilters = [filters.min_subscribers, filters.min_avg_views, filters.min_engagement_rate]
    .filter((value) => value !== undefined && value !== null && value !== '').length
  return Number(Boolean(filters.q)) + filters.topics.length + numericFilters + Number(Boolean(filters.country)) + Number(Boolean(filters.source)) + Number(Boolean(filters.has_verified_youtube_rates))
})

function toggleTopicFilter(topic: string) {
  const idx = draftFilters.topics.indexOf(topic)
  if (idx >= 0) {
    draftFilters.topics.splice(idx, 1)
  } else {
    draftFilters.topics.push(topic)
  }
}

function toggleTopicAndApply(topic: string) {
  toggleTopicFilter(topic)
  applyFilters()
}

function clearTopicsAndApply() {
  draftFilters.topics = []
  applyFilters()
}

function setNumericFilter(field: 'min_subscribers' | 'min_avg_views' | 'min_engagement_rate', value: number | undefined) {
  draftFilters[field] = value
  // Close the pill dropdown for immediate feedback.
  if (typeof document !== 'undefined') {
    for (const el of Array.from(document.querySelectorAll('details[group-open]'))) (el as HTMLDetailsElement).open = false
    for (const el of Array.from(document.querySelectorAll('details[open]'))) (el as HTMLDetailsElement).open = false
  }
  applyFilters()
}

function setCountryFilter(code: string) {
  draftFilters.country = draftFilters.country === code ? '' : code
  if (typeof document !== 'undefined') {
    for (const el of Array.from(document.querySelectorAll('details[open]'))) (el as HTMLDetailsElement).open = false
  }
  applyFilters()
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 500)
}

function loadFiltersFromQuery() {
  const filters = appliedFilters.value
  Object.assign(draftFilters, filters, { topics: [...filters.topics] })
  page.value = filters.page
}

async function fetchList() {
  const requestId = ++latestListRequest
  loading.value = true
  listError.value = ''
  try {
    const filters = appliedFilters.value
    if ((filters.source && !summaryData.value?.capabilities?.source_filter) || (filters.has_verified_youtube_rates && !summaryData.value?.capabilities?.verified_youtube_rate_filter)) {
      listError.value = 'These filters are not available in this workspace yet. Clear filters to continue.'
      hasLoaded.value = true
      return
    }
    const result = await list({ ...filters, country: filters.country || undefined, source: filters.source || undefined, page_size: PAGE_SIZE })
    if (requestId !== latestListRequest) return
    profiles.value = result.items
    total.value = result.total
    hasLoaded.value = true
  } catch {
    if (requestId === latestListRequest) listError.value = 'Could not load creators. Try again.'
  } finally {
    if (requestId === latestListRequest) loading.value = false
  }
}

function isVerified(creator: CreatorProfile): boolean {
  return (creator.sources || []).includes('managed_channel')
}

function toggleSaved(id: string) {
  const next = new Set(savedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  savedIds.value = next
  try {
    localStorage.setItem('creator-discovery-saved', JSON.stringify([...next]))
  } catch { /* private mode — saved state stays in memory */ }
}

function applyFilters() {
  const query = discoveryQuery({ ...draftFilters, page: 1 })
  void router.push({ query })
}

function goToCompare() {
  if (compareIds.value.length < 2) return
  void router.push({ path: '/app/youtube-brand-campaign/creator-discovery/compare', query: { ids: compareIds.value.join(',') } })
}

function goToPage(p: number) {
  void router.push({ query: discoveryQuery({ ...appliedFilters.value, page: p }) })
}

watch(() => route.fullPath, () => {
  loadFiltersFromQuery()
  fetchList()
})

function clearFilters() {
  draftFilters.q = ''
  draftFilters.topics = []
  draftFilters.country = ''
  draftFilters.source = ''
  draftFilters.has_verified_youtube_rates = undefined
  draftFilters.min_subscribers = undefined
  draftFilters.min_avg_views = undefined
  draftFilters.min_engagement_rate = undefined
  draftFilters.sort = 'channel_synced_at_desc'
  applyFilters()
}

function toggleCompare(id: string) {
  const creator = profiles.value.find((item) => item.id === id) || discovery.selected.find((item) => item.id === id)
  if (creator) discovery.toggle(creator)
}

const isPreviewOpen = ref(false)
const previewCreator = ref<CreatorProfile | null>(null)
function openPreview(creator: CreatorProfile) {
  previewCreator.value = creator
  isPreviewOpen.value = true
}

const syncing = ref(false)
async function runSync() {
  // mcn_operator's scope is already a single MCN (no hierarchy choice to make),
  // so they keep the v1 one-click sync; every other role picks scope first —
  // see release-plan-20260831-...-enhancement-sync-flow-and-public-data-fallback.md §3.1.
  if (!authStore.isMcnOperator) {
    navigateTo('/app/youtube-brand-campaign/creator-discovery/sync')
    return
  }
  syncing.value = true
  try {
    await syncFromChannels()
    await Promise.all([fetchList(), refreshSummary()])
  } finally {
    syncing.value = false
  }
}

async function refreshSummary() {
  topicsLoading.value = true
  topicsError.value = ''
  const [summary, topics] = await Promise.allSettled([fetchSummary(), topicsFacet()])
  if (summary.status === 'fulfilled') summaryData.value = summary.value
  if (topics.status === 'fulfilled') topicOptions.value = topics.value
  else topicsError.value = 'Could not load niches.'
  topicsLoading.value = false
}

const syncingReports = ref(false)
async function runSyncFromBrandDealReports() {
  syncingReports.value = true
  try {
    await syncFromBrandDealReports()
    await Promise.all([fetchList(), refreshSummary()])
  } finally {
    syncingReports.value = false
  }
}

const SOURCE_LABELS: Record<string, string> = {
  managed_channel: 'Managed channel',
  manual_lookup: 'Discovered',
  import: 'Discovered',
  brand_deal_report: 'Brand Deal Report',
}
function sourceLabels(creator: CreatorProfile): string[] {
  const raw = creator.sources?.length ? creator.sources : [creator.source]
  return [...new Set(raw.map((s) => SOURCE_LABELS[s] ?? s))]
}

function engagementLabel(creator: CreatorProfile): string {
  const value = creator.performance_summary?.engagement_rate
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(1)}%`
}

onMounted(async () => {
  try {
    const raw = localStorage.getItem('creator-discovery-saved')
    if (raw) savedIds.value = new Set(JSON.parse(raw))
    const vm = localStorage.getItem('creator-discovery-view')
    if (vm === 'list' || vm === 'grid') viewMode.value = vm
  } catch { /* ignore */ }
  loadFiltersFromQuery()
  await refreshSummary()
  await fetchList()
  await nextTick()
  if (discovery.listingPath === route.fullPath) window.scrollTo({ top: discovery.scrollY })
})

watch(viewMode, (v) => {
  try { localStorage.setItem('creator-discovery-view', v) } catch { /* ignore */ }
})

onBeforeRouteLeave(() => {
  discovery.listingPath = route.fullPath
  discovery.scrollY = window.scrollY
})

function applySort(event: Event) {
  void router.push({ query: discoveryQuery({ ...appliedFilters.value, sort: (event.target as HTMLSelectElement).value, page: 1 }) })
}
</script>
