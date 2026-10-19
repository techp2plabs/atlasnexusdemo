<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div v-if="loading" class="col-span-12 rounded-xl border border-border bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
      Loading…
    </div>
    <div v-else-if="!creator" class="col-span-12">
      <EmptyState title="Creator not found" description="This creator may have been removed from the bank, or you don't have access to it." />
    </div>

    <template v-else>
      <div class="col-span-12 flex flex-wrap items-center gap-4">
        <img v-if="creator.thumbnail_url" :src="creator.thumbnail_url" class="h-14 w-14 rounded-full object-cover" />
        <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-500 dark:bg-white/5">
          {{ (creator.title ?? '??').slice(0, 2).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ creator.title }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ creator.custom_url || creator.channel_id }} · {{ sourceLabels(creator).join(' · ') }}</p>
        </div>
        <button type="button" class="rounded-lg border border-border px-3 py-2 text-sm" @click="discovery.toggle(creator)">{{ discovery.selected.some((item) => item.id === creator.id) ? 'Remove from compare' : 'Add to compare' }}</button>
        <NuxtLink v-if="discovery.selected.length >= 2" :to="{ path: '/app/youtube-brand-campaign/creator-discovery/compare', query: { ids: discovery.selected.map((item) => item.id).join(',') } }" class="text-sm text-brand-700 underline">Compare {{ discovery.selected.length }}</NuxtLink>
        <button v-if="canManageCampaigns" type="button" class="ml-auto rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" @click="campaignPickerOpen = true">Add to campaign</button>
        <details class="relative">
          <summary class="cursor-pointer list-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:text-gray-300">More</summary>
          <div class="absolute right-0 z-20 mt-2 min-w-44 rounded-lg border border-border bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <button type="button" class="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-white/5" :disabled="refreshing" @click="doRefresh">{{ refreshing ? 'Refreshing…' : 'Refresh YouTube data' }}</button>
        <button
          v-if="creator.source !== 'managed_channel'"
          type="button"
          class="rounded-lg border border-error-200 px-3 py-2 text-sm text-error-600 hover:bg-error-50 disabled:opacity-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
          :disabled="removing"
          @click="doRemove"
        >
          {{ removing ? 'Removing…' : 'Remove' }}
        </button>
          </div>
        </details>
      </div>
      <p v-if="discovery.message" class="col-span-12 text-sm text-gray-500" role="status">{{ discovery.message }}</p>
      <p v-if="refreshError" class="col-span-12 rounded-lg border border-error-200 p-3 text-sm text-error-600" role="alert">{{ refreshError }} <button type="button" class="underline" @click="doRefresh">Try again</button></p>

      <div class="col-span-12 grid grid-cols-2 gap-4 rounded-xl border border-border bg-white p-4 sm:grid-cols-3 dark:border-gray-800 dark:bg-gray-900" aria-label="Creator performance summary">
        <MetricValue label="Subscribers" :value="formatCompactNumber(creator.subscriber_count)" />
        <MetricValue label="Avg. views / video" :value="metricValue(creator.performance_summary?.avg_views_per_video)" />
        <MetricValue label="Engagement rate" :value="engagementLabel" />
        <p class="col-span-2 text-xs text-gray-500 sm:col-span-3">{{ perfHint }}<span v-if="creator.stats_fetched_at"> Last refreshed {{ formatDate(creator.stats_fetched_at) }}.</span></p>
      </div>

      <div class="col-span-12">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4 text-sm dark:bg-gray-900">
          <div><p class="font-medium">{{ youtubeRateState(creator.rate_card) }}</p><p class="mt-1 text-xs text-gray-500">Review rates and currency before planning a YouTube package.</p></div>
          <button type="button" class="text-brand-700 underline dark:text-brand-400" @click="activeTab = 'rate-card'">View rates and estimator</button>
        </div>
        <Tabs v-model="activeTab" :tabs="tabs">
          <template #overview>
            <PlaceholderSection title="Overview">
              <p v-if="creator.description" class="mb-4 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{{ creator.description }}</p>
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MetricValue label="Country" :value="creator.country || '—'" />
                <MetricValue label="Subscribers" :value="formatCompactNumber(creator.subscriber_count)" />
                <MetricValue label="Total views" :value="formatCompactNumber(creator.view_count)" />
                <MetricValue label="Videos" :value="creator.video_count ?? '—'" />
              </div>

              <div class="mt-4" v-if="creator.topics.length">
                <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Topics</p>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="t in creator.topics" :key="t" class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">{{ t }}</span>
                </div>
              </div>

              <div v-if="!editingOverview" class="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold text-gray-800 dark:text-white/90">Contact information</h2>
                  <button type="button" class="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400" @click="beginOverviewEdit">Edit overview</button>
                </div>
                <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">{{ creator.contact?.email || creator.contact?.whatsapp ? [creator.contact.email, creator.contact.whatsapp].filter(Boolean).join(' · ') : 'No contact details added.' }}</p>
                <div class="mt-4">
                  <h3 class="text-sm font-semibold text-gray-800 dark:text-white/90">Social accounts</h3>
                  <ul v-if="creator.social_links.length" class="mt-2 space-y-2">
                    <li v-for="social in creator.social_links" :key="social.platform + social.handle_or_url" class="text-sm text-gray-600 dark:text-gray-300">{{ platformLabel(social.platform, social.platform_label) }} · {{ social.handle_or_url }}<span v-if="social.note"> · {{ social.note }}</span></li>
                  </ul>
                  <p v-else class="mt-2 text-sm text-gray-500">No social accounts added.</p>
                </div>
              </div>
              <div v-else class="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p v-if="overviewError" class="mb-3 text-sm text-error-600" role="alert">{{ overviewError }}</p>
                <p class="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Contact information</p>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <input v-model="editContact.email" type="email" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">WhatsApp / Phone</label>
                    <input v-model="editContact.whatsapp" type="text" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                <div class="mt-4">
                  <div class="mb-2 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-gray-800 dark:text-white/90">Other social platforms</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Add accounts here. These platforms will be available in Rate Card.</p>
                    </div>
                    <button type="button" class="text-xs font-medium text-brand-600 hover:underline" @click="addSocialLink">+ Add platform</button>
                  </div>
                  <div v-if="editSocialLinks.length === 0" class="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No other social platforms added yet.
                  </div>
                  <div v-for="(s, i) in editSocialLinks" :key="i" class="mb-3 grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-5 dark:border-gray-800">
                    <div>
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Platform</label>
                      <select v-model="s.platformChoice" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option v-for="option in socialPlatformOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                      </select>
                    </div>
                    <div v-if="s.platformChoice === 'other'">
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Platform name</label>
                      <input v-model="s.customPlatform" placeholder="e.g. Lemon8" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div :class="s.platformChoice === 'other' ? 'sm:col-span-2' : 'sm:col-span-2'">
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Handle or profile URL</label>
                      <input v-model="s.handle_or_url" placeholder="@handle or profile URL" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div class="flex items-end gap-2">
                      <input v-model="s.note" aria-label="Social profile note" placeholder="Note (optional)" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                      <button type="button" class="h-9 shrink-0 px-2 text-sm text-error-600" aria-label="Remove social platform" @click="removeSocialLink(i)">Remove</button>
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex gap-2">
                  <button type="button" class="rounded-lg border border-border px-4 py-2 text-sm" @click="cancelOverviewEdit">Cancel</button>
                  <button type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" :disabled="savingContact" @click="saveContact">
                    {{ savingContact ? 'Saving...' : 'Save overview' }}
                  </button>
                </div>
              </div>
            </PlaceholderSection>
          </template>

          <template #performance>
            <PlaceholderSection title="Performance" :description="perfHint">
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <MetricValue label="Avg. views / video" :value="metricValue(creator.performance_summary?.avg_views_per_video)" hint="Atlas-derived" />
                <MetricValue label="Engagement rate" :value="engagementLabel" hint="Atlas-derived" />
              </div>
              <p v-if="creator.performance_summary?.sample_start_at && creator.performance_summary?.sample_end_at" class="mt-3 text-xs text-gray-500">Sample window{{ creator.performance_summary.sample_window_complete ? '' : ' (known dates only)' }}: {{ formatDate(creator.performance_summary.sample_start_at) }} – {{ formatDate(creator.performance_summary.sample_end_at) }}</p>
              <p v-if="creator.performance_summary?.engagement_sample_video_count != null" class="mt-2 text-xs text-gray-500">Engagement averages (likes + comments) ÷ views × 100 for {{ creator.performance_summary.engagement_sample_video_count }} videos with views. Zero-view videos are excluded.</p>
              <p v-if="creator.performance_summary?.computed_at" class="mt-2 text-xs text-gray-500">Metrics computed {{ formatDate(creator.performance_summary.computed_at) }}. Public sample metrics describe sampled uploads, not the entire channel.</p>

              <CommerceBaselineSection :profile-id="creator.id" />

              <div v-if="videos.length" class="mt-6 rounded-lg border border-border p-4 dark:border-gray-800">
                <p class="text-sm font-medium text-gray-800 dark:text-white">{{ videos.length }} recent public uploads are available.</p>
                <button type="button" class="mt-2 text-sm font-medium text-brand-700 underline dark:text-brand-400" @click="activeTab = 'content'">View sampled uploads</button>
              </div>
            </PlaceholderSection>
          </template>

          <template #content>
            <PlaceholderSection title="Content" description="Recent uploads pulled from the channel's public uploads playlist.">
              <div v-if="videosLoading" class="text-sm text-gray-400">Loading videos…</div>
              <div v-else-if="videosError" class="text-sm text-error-600" role="alert">{{ videosError }} <button type="button" class="underline" @click="loadVideos">Try again</button></div>
              <div v-else-if="videos.length === 0" class="text-sm text-gray-400">No public videos found.</div>
              <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a v-for="v in videos" :key="v.video_id" :href="v.url" target="_blank" rel="noopener" class="flex gap-3 rounded-lg border border-gray-100 p-2 hover:border-brand-300 dark:border-gray-800">
                  <img v-if="v.thumbnail_url" :src="v.thumbnail_url" class="h-16 w-28 shrink-0 rounded object-cover" />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-gray-800 dark:text-white/90">{{ v.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(v.published_at) }}</p>
                    <p class="text-xs text-gray-400">{{ formatCompactNumber(v.view_count) }} views · {{ formatCompactNumber(v.like_count) }} likes</p>
                  </div>
                </a>
              </div>
            </PlaceholderSection>
          </template>

          <template #rate-card>
            <PlaceholderSection title="Rate Card">
              <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">Manage YouTube and social packages here. Add social platforms in Overview first.</p>

              <div v-if="!editingRateCard" class="mb-5 space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="font-medium text-gray-800 dark:text-white">{{ creator.rate_card?.currency || 'Currency not set' }} <span v-if="creator.rate_card?.currency_verified" class="text-xs text-green-700">· Verified</span><span v-else class="text-xs text-amber-700">· Currency unverified</span></p>
                    <p class="mt-1 text-xs text-gray-500">Rates are planning references and do not confirm a campaign quote.</p>
                  </div>
                  <button type="button" class="rounded-lg border border-border px-3 py-2 text-sm font-medium" @click="beginRateCardEdit">Edit rate card</button>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-lg border border-border p-4"><h3 class="text-sm font-semibold">YouTube Shorts</h3><p class="mt-2 tabular-nums text-sm">{{ creator.rate_card?.shorts?.min != null || creator.rate_card?.shorts?.max != null ? displayRateRange(creator.rate_card.shorts.min, creator.rate_card.shorts.max) : 'Rate not added' }}</p><p v-if="creator.rate_card?.shorts?.note" class="mt-1 text-xs text-gray-500">{{ creator.rate_card.shorts.note }}</p></div>
                  <div class="rounded-lg border border-border p-4"><h3 class="text-sm font-semibold">YouTube long-form</h3><p class="mt-2 tabular-nums text-sm">{{ creator.rate_card?.longform?.min != null || creator.rate_card?.longform?.max != null ? displayRateRange(creator.rate_card.longform.min, creator.rate_card.longform.max) : 'Rate not added' }}</p><p v-if="creator.rate_card?.longform?.note" class="mt-1 text-xs text-gray-500">{{ creator.rate_card.longform.note }}</p></div>
                </div>
                <div v-for="group in creator.rate_card?.social || []" :key="group.platform" class="rounded-lg border border-border p-4"><h3 class="font-semibold">{{ platformLabel(group.platform, group.platform_label) }}</h3><ul class="mt-2 space-y-2 text-sm"><li v-for="item in group.packages" :key="item.name">{{ item.name }} · {{ item.price != null ? displayRateAmount(item.price) : displayRateRange(item.min, item.max) }}<span v-if="item.note" class="text-gray-500"> · {{ item.note }}</span></li></ul></div>
              </div>

              <div v-else>
              <div class="mb-5 rounded-lg border border-border p-4 dark:border-gray-800">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label for="rate-currency" class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Rate card currency</label>
                    <select id="rate-currency" v-model="editRateCard.currency" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      <option value="">Choose currency</option>
                      <option value="IDR">IDR - Indonesian Rupiah</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>
                  <label class="flex items-center gap-2 self-end pb-2 text-sm text-gray-700 dark:text-gray-300">
                    <input v-model="editRateCard.currencyVerified" type="checkbox" :disabled="!editRateCard.currency" class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                    I confirm this currency for the listed prices
                  </label>
                </div>
                <div v-if="currencyHasChanged" class="mt-3 rounded-lg border border-amber-200 p-3 text-sm dark:border-amber-800">
                  <label for="currency-change-mode" class="mb-1 block font-medium">Changing currency for existing prices</label>
                  <select id="currency-change-mode" v-model="currencyChangeMode" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 dark:border-gray-700 dark:bg-gray-800">
                    <option value="">Choose how to handle existing amounts</option>
                    <option value="keep">Keep amount, change currency label</option>
                    <option value="convert">Convert each amount using the displayed quote</option>
                  </select>
                  <p v-if="currencyQuote" class="mt-2 text-xs text-gray-500">Indicative rate: 1 {{ creator.rate_card?.currency }} = {{ currencyQuote.rate }} {{ editRateCard.currency }} · as of {{ currencyQuote.rate_as_of || currencyQuote.fetched_at || 'now' }}</p>
                  <p v-else-if="currencyQuoteError" class="mt-2 text-xs text-amber-700">{{ currencyQuoteError }}</p>
                </div>
                <p v-if="creator.rate_card_usd_snapshot?.status === 'pending'" class="mt-2 text-xs text-amber-700">USD equivalent is pending; this rate card cannot be compared across currencies yet.</p>
                <p v-if="hasUnverifiedLegacyRates" class="mt-2 text-xs text-amber-700 dark:text-amber-400">This profile has existing rates without a confirmed currency. Choose and confirm the currency before saving these prices as verified.</p>
              </div>

              <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">YouTube Shorts</p>
                  <div class="flex gap-2">
                    <label class="block min-w-0 flex-1 text-xs text-gray-500">Shorts minimum<input v-model="editRateCard.shorts.min" type="number" min="0" step="0.01" placeholder="Min" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                    <label class="block min-w-0 flex-1 text-xs text-gray-500">Shorts maximum<input v-model="editRateCard.shorts.max" type="number" min="0" step="0.01" placeholder="Max" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                  </div>
                  <p v-if="editRateCard.shorts.min !== '' || editRateCard.shorts.max !== ''" class="mt-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">{{ displayRateRange(editRateCard.shorts.min, editRateCard.shorts.max) }}</p>
                  <label class="block min-w-0 flex-1 text-xs text-gray-500">Shorts package note<input v-model="editRateCard.shorts.note" placeholder="Package note" class="mt-2 h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                </div>
                <div>
                  <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">YouTube long-form</p>
                  <div class="flex gap-2">
                    <label class="block min-w-0 flex-1 text-xs text-gray-500">Long-form minimum<input v-model="editRateCard.longform.min" type="number" min="0" step="0.01" placeholder="Min" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                    <label class="block min-w-0 flex-1 text-xs text-gray-500">Long-form maximum<input v-model="editRateCard.longform.max" type="number" min="0" step="0.01" placeholder="Max" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                  </div>
                  <p v-if="editRateCard.longform.min !== '' || editRateCard.longform.max !== ''" class="mt-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">{{ displayRateRange(editRateCard.longform.min, editRateCard.longform.max) }}</p>
                  <label class="block min-w-0 flex-1 text-xs text-gray-500">Long-form package note<input v-model="editRateCard.longform.note" placeholder="Package note" class="mt-2 h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                </div>
              </div>

              <div class="border-t border-gray-100 pt-4 dark:border-gray-800">
                <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-800 dark:text-white/90">Other platform packages</h3>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose a platform saved in Overview, then define creator-specific package names and rates.</p>
                  </div>
                  <div class="flex gap-2">
                    <select v-model="newRatePlatform" :disabled="availableRatePlatforms.length === 0" aria-label="Platform for new rate card" class="h-9 min-w-36 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      <option value="">Select platform</option>
                      <option v-for="platform in availableRatePlatforms" :key="platform.value" :value="platform.value">{{ platform.label }}</option>
                    </select>
                    <button type="button" class="h-9 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5" :disabled="!newRatePlatform" @click="addRatePlatform">Add</button>
                  </div>
                </div>

                <div v-if="availableRatePlatforms.length === 0" class="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Add a social platform in the <button type="button" class="font-medium text-brand-600 hover:underline" @click="activeTab = 'overview'">Overview tab</button> before creating a rate card.
                </div>
                <div v-else-if="editRateCard.social.length === 0" class="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">No social packages yet. Choose a platform above to add its first package.</div>

                <div v-for="group in editRateCard.social" :key="group.platform" class="mb-4 rounded-lg border border-border p-4 dark:border-gray-800">
                  <div class="mb-3 flex items-center justify-between">
                    <h4 class="font-semibold text-gray-800 dark:text-white/90">{{ platformLabel(group.platform) }}</h4>
                    <button type="button" class="text-xs font-medium text-error-600 hover:underline" @click="removeRatePlatform(group.platform)">Remove packages</button>
                  </div>
                  <div v-for="(item, index) in group.packages" :key="index" class="mb-3 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 sm:grid-cols-6 dark:bg-white/[0.03]">
                    <div class="sm:col-span-2">
                      <label class="mb-1 block text-xs text-gray-500 dark:text-gray-400">Package name</label>
                      <input v-model="item.name" placeholder="e.g. Reels" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label class="mb-1 block text-xs text-gray-500 dark:text-gray-400">Price type</label>
                      <select v-model="item.pricingMode" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="fixed">Fixed</option>
                        <option value="range">Range</option>
                      </select>
                    </div>
                    <div v-if="item.pricingMode === 'fixed'">
                      <label class="mb-1 block text-xs text-gray-500 dark:text-gray-400">{{ editRateCard.currency || 'Price' }}</label>
                      <input v-model="item.price" type="number" min="0" step="0.01" placeholder="Price" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <template v-else>
                      <div>
                        <label class="mb-1 block text-xs text-gray-500 dark:text-gray-400">Min {{ editRateCard.currency }}</label>
                        <input v-model="item.min" type="number" min="0" step="0.01" placeholder="Min" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label class="mb-1 block text-xs text-gray-500 dark:text-gray-400">Max {{ editRateCard.currency }}</label>
                        <input v-model="item.max" type="number" min="0" step="0.01" placeholder="Max" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                      </div>
                    </template>
                    <p v-if="item.pricingMode === 'fixed' ? item.price !== '' : item.min !== '' || item.max !== ''" class="sm:col-span-6 -mt-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">{{ item.pricingMode === 'fixed' ? displayRateAmount(item.price) : displayRateRange(item.min, item.max) }}</p>
                    <div class="flex items-end">
                      <button type="button" class="h-9 text-xs font-medium text-error-600 hover:underline" aria-label="Remove package" @click="group.packages.splice(index, 1)">Remove</button>
                    </div>
                    <div class="sm:col-span-6">
                      <input v-model="item.note" placeholder="Package details (optional)" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                  </div>
                  <button type="button" class="text-xs font-medium text-brand-600 hover:underline" @click="addRatePackage(group)">+ Add package</button>
                </div>
              </div>

              <button type="button" class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" :disabled="savingRateCard" @click="saveRateCard">
                {{ savingRateCard ? 'Saving...' : 'Save rate card' }}
              </button>
              <button type="button" class="ml-2 mt-4 rounded-lg border border-border px-4 py-2 text-sm" :disabled="savingRateCard" @click="cancelRateCardEdit">Cancel</button>
              </div>

              <div class="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">YouTube package cost estimator</p>
                <PackageCostEstimator :rate-card="estimatorRateCard" :currency="editRateCard.currency || 'IDR'" :show-estimate="!!editRateCard.currency && !!editRateCard.currencyVerified" :shorts-available="editRateCard.shorts.min !== '' || editRateCard.shorts.max !== ''" :longform-available="editRateCard.longform.min !== '' || editRateCard.longform.max !== ''" />
              </div>
            </PlaceholderSection>
          </template>

          <template #notes>
            <PlaceholderSection title="Notes" description="Shared operational notes for this creator, visible according to your organization and MCN access.">
              <div v-if="notesLoading" class="py-8 text-center text-sm text-gray-500" role="status">Loading notes…</div>
              <div v-else-if="notesError" class="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300" role="alert">
                <p>{{ notesError }}</p>
                <button type="button" class="mt-2 font-medium underline" @click="loadNotes">Try again</button>
              </div>
              <div v-else>
                <p v-if="notes.length === 0" class="mb-4 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No notes yet. Add a note for operational details such as a negotiated rate or special deal.
                </p>
                <div v-else class="mb-6 space-y-3">
                  <article v-for="note in notes" :key="note.id" class="rounded-lg border border-border p-4 dark:border-gray-800">
                    <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ note.author_display_name }} <span class="font-normal text-gray-500">· {{ note.author_role }}</span></p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(note.created_at) }}<span v-if="note.updated_at !== note.created_at"> · edited {{ formatDate(note.updated_at) }}</span></p>
                      </div>
                      <button v-if="note.can_edit && editingNoteId !== note.id" type="button" class="text-sm font-medium text-brand-600 hover:underline" @click="startEditingNote(note)">Edit</button>
                    </div>
                    <div v-if="editingNoteId === note.id">
                      <label :for="`edit-note-${note.id}`" class="sr-only">Edit your note</label>
                      <textarea :id="`edit-note-${note.id}`" v-model="editingNoteBody" maxlength="50000" rows="5" class="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                      <div class="mt-2 flex items-center justify-between text-xs text-gray-500"><span>{{ editingNoteBody.length.toLocaleString() }} / 50,000</span><div class="flex gap-3"><button type="button" class="hover:underline" @click="cancelEditingNote">Cancel</button><button type="button" class="font-medium text-brand-600 disabled:opacity-50" :disabled="savingNoteId === note.id || !editingNoteBody.trim()" @click="saveEditedNote(note.id)">{{ savingNoteId === note.id ? 'Saving…' : 'Save changes' }}</button></div></div>
                    </div>
                    <p v-else class="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">{{ note.body }}</p>
                  </article>
                </div>
                <form class="border-t border-gray-100 pt-4 dark:border-gray-800" @submit.prevent="saveNewNote">
                  <label for="new-creator-note" class="mb-2 block text-sm font-semibold text-gray-800 dark:text-white">Add a note</label>
                  <textarea id="new-creator-note" v-model="newNoteBody" maxlength="50000" rows="6" placeholder="Add a negotiated rate, special deal, or other context…" class="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  <div class="mt-2 flex items-center justify-between gap-3"><span class="text-xs text-gray-500">{{ newNoteBody.length.toLocaleString() }} / 50,000 characters</span><button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" :disabled="savingNewNote || !newNoteBody.trim()">{{ savingNewNote ? 'Saving…' : 'Save note' }}</button></div>
                </form>
              </div>
            </PlaceholderSection>
          </template>
        </Tabs>
      </div>

              <CreatorCampaignPicker v-if="canManageCampaigns" v-model="campaignPickerOpen" :profile-id="creator.id" :creator-name="creator.title || 'Creator'" :initial-campaign-id="typeof route.query.campaign === 'string' ? route.query.campaign : undefined" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCreatorDiscoverySessionStore } from '~/stores/creatorDiscovery'
import { youtubeRateState } from '~/utils/creatorDiscoveryState.mjs'
import CreatorCampaignPicker from '~/components/youtubeBrandCampaign/CreatorCampaignPicker.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import MetricValue from '~/components/common/MetricValue.vue'
import Tabs from '~/components/common/Tabs.vue'
import PlaceholderSection from '~/components/youtubeBrandCampaign/PlaceholderSection.vue'
import CommerceBaselineSection from '~/components/youtubeBrandCampaign/CommerceBaselineSection.vue'
import PackageCostEstimator from '~/components/youtubeBrandCampaign/PackageCostEstimator.vue'
import { useCreatorDiscovery, type CreatorNote, type CreatorProfile, type CreatorVideo } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import { formatCompactNumber, formatCurrency, formatCurrencyRange, formatNumber } from '~/utils/youtubeBrandCampaignFormat'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator'],
})

const route = useRoute()
const router = useRouter()
const discovery = useCreatorDiscoverySessionStore()
const auth = useAuthStore()
const canManageCampaigns = computed(() => ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'].includes(auth.user?.role || ''))
const activeTab = computed({
  get: () => ['overview', 'performance', 'content', 'rate-card', 'notes'].includes(String(route.query.tab)) ? String(route.query.tab) : 'overview',
  set: (tab: string) => {
    if (editorDirty.value && !window.confirm('Discard unsaved profile changes and switch tabs?')) return
    if (editorDirty.value) { cancelOverviewEdit(); cancelRateCardEdit() }
    void router.replace({ query: { ...route.query, tab } })
  },
})
const campaignPickerOpen = ref(false)
const editingOverview = ref(false)
const { get, refresh, updateProfile, videos: fetchVideos, notes: fetchNotes, createNote, updateNote, remove } = useCreatorDiscovery()
const { success: showSuccessToast, error: showErrorToast } = useToast()

const creator = ref<CreatorProfile | null>(null)
function metricValue(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? 'Unavailable' : formatCompactNumber(value)
}
const engagementLabel = computed(() => {
  const value = creator.value?.performance_summary?.engagement_rate
  return value == null || !Number.isFinite(value) ? 'Unavailable' : `${value.toFixed(2)}%`
})
const loading = ref(true)
const refreshing = ref(false)
const refreshError = ref('')
const videos = ref<CreatorVideo[]>([])
const videosLoading = ref(false)
const videosError = ref('')
const overviewError = ref('')
const overviewBaseline = ref('')
const rateBaseline = ref('')
const notes = ref<CreatorNote[]>([])
const notesLoading = ref(false)
const notesError = ref('')
const newNoteBody = ref('')
const savingNewNote = ref(false)
const editingNoteId = ref<string | null>(null)
const editingNoteBody = ref('')
const savingNoteId = ref<string | null>(null)

async function loadNotes() {
  if (!creator.value) return
  notesLoading.value = true
  notesError.value = ''
  try {
    notes.value = await fetchNotes(creator.value.id)
  } catch (error: any) {
    notesError.value = typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : 'Could not load notes. Please try again.'
  } finally {
    notesLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'notes' && creator.value) void loadNotes()
})

function startEditingNote(note: CreatorNote) {
  editingNoteId.value = note.id
  editingNoteBody.value = note.body
}

function cancelEditingNote() {
  editingNoteId.value = null
  editingNoteBody.value = ''
}

async function saveNewNote() {
  if (!creator.value || !newNoteBody.value.trim()) return
  savingNewNote.value = true
  try {
    await createNote(creator.value.id, newNoteBody.value)
    newNoteBody.value = ''
    await loadNotes()
    showSuccessToast('Note saved.')
  } catch (error: any) {
    showErrorToast(typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : 'Could not save the note. Your text is still here.')
  } finally {
    savingNewNote.value = false
  }
}

async function saveEditedNote(noteId: string) {
  if (!creator.value || !editingNoteBody.value.trim()) return
  savingNoteId.value = noteId
  try {
    await updateNote(creator.value.id, noteId, editingNoteBody.value)
    cancelEditingNote()
    await loadNotes()
    showSuccessToast('Note updated.')
  } catch (error: any) {
    showErrorToast(typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : 'Could not update the note. Your text is still here.')
  } finally {
    savingNoteId.value = null
  }
}


async function load() {
  loading.value = true
  try {
    creator.value = await get(route.params.id as string)
    if (creator.value) {
      editContact.email = creator.value.contact?.email ?? ''
      editContact.whatsapp = creator.value.contact?.whatsapp ?? ''
            editSocialLinks.splice(0, editSocialLinks.length, ...(creator.value.social_links ?? []).map((s) => toEditableSocialLink(s)))
      const savedRateCard = creator.value.rate_card
      editRateCard.shorts = { min: savedRateCard?.shorts?.min == null ? '' : String(savedRateCard.shorts.min), max: savedRateCard?.shorts?.max == null ? '' : String(savedRateCard.shorts.max), note: savedRateCard?.shorts?.note ?? '' }
      editRateCard.longform = { min: savedRateCard?.longform?.min == null ? '' : String(savedRateCard.longform.min), max: savedRateCard?.longform?.max == null ? '' : String(savedRateCard.longform.max), note: savedRateCard?.longform?.note ?? '' }
      editRateCard.currency = savedRateCard?.currency ?? ''
      editRateCard.currencyVerified = savedRateCard?.currency_verified ?? false
      editRateCard.social.splice(0, editRateCard.social.length, ...(savedRateCard?.social ?? []).map((group) => ({
        platform: group.platform,
        platform_label: group.platform_label ?? '',
        packages: (group.packages ?? []).map((item) => ({
          name: item.name,
          pricingMode: item.price != null ? 'fixed' as const : 'range' as const,
          price: item.price == null ? '' : String(item.price),
          min: item.min == null ? '' : String(item.min),
          max: item.max == null ? '' : String(item.max),
          note: item.note ?? '',
        })),
      })))    }
  } catch {
    creator.value = null
  } finally {
    loading.value = false
  }
  if (creator.value) void loadVideos()
}

async function loadVideos() {
  if (!creator.value) return
  videosLoading.value = true; videosError.value = ''
  try { videos.value = await fetchVideos(creator.value.id) }
  catch { videosError.value = 'Could not load the public upload sample.' }
  finally { videosLoading.value = false }
}

const removing = ref(false)
async function doRemove() {
  if (!creator.value) return
  if (!window.confirm(`Remove ${creator.value.title} from the creator bank? This cannot be undone.`)) return
  removing.value = true
  try {
    await remove(creator.value.id)
    navigateTo('/app/youtube-brand-campaign/creator-discovery')
  } catch (e: any) {
    window.alert(e?.response?.data?.detail || 'Failed to remove creator')
  } finally {
    removing.value = false
  }
}

async function doRefresh() {
  if (!creator.value) return
  refreshing.value = true
  refreshError.value = ''
  try {
    creator.value = await refresh(creator.value.id)
    videos.value = await fetchVideos(creator.value.id)
  } catch (cause: any) {
    refreshError.value = typeof cause?.response?.data?.detail === 'string' ? cause.response.data.detail : 'Could not refresh YouTube data. Previously loaded data is retained.'
  } finally {
    refreshing.value = false
  }
}

const editContact = reactive({ email: '', whatsapp: '' })
const savingContact = ref(false)
const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'threads', label: 'Threads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Others' },
]
const socialPlatformOptions = SOCIAL_PLATFORMS
const knownPlatformValues = new Set(SOCIAL_PLATFORMS.filter((item) => item.value !== 'other').map((item) => item.value))
type EditableSocialLink = { platformChoice: string; customPlatform: string; handle_or_url: string; note: string }
const editSocialLinks = reactive<EditableSocialLink[]>([])

function toEditableSocialLink(link: { platform: string; platform_label?: string | null; handle_or_url: string; note?: string | null }): EditableSocialLink {
  const platform = link.platform.trim().toLowerCase()
  const known = knownPlatformValues.has(platform)
  return {
    platformChoice: known ? platform : 'other',
    customPlatform: known ? '' : (link.platform_label || link.platform),
    handle_or_url: link.handle_or_url,
    note: link.note ?? '',
  }
}

function platformSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function addSocialLink() {
  editSocialLinks.push({ platformChoice: '', customPlatform: '', handle_or_url: '', note: '' })
}

function removeSocialLink(index: number) {
  const link = editSocialLinks[index]
  const slug = link.platformChoice === 'other' ? platformSlug(link.customPlatform) : link.platformChoice
  const hasPackages = editRateCard.social.some((group) => group.platform === slug && group.packages.length > 0)
  if (hasPackages && !window.confirm('This platform has saved rate-card packages. Remove the packages first in Rate Card before removing the platform.')) return
  editSocialLinks.splice(index, 1)
}

function socialPayload() {
  return editSocialLinks
    .filter((link) => link.handle_or_url.trim())
    .map((link) => {
      const customName = link.platformChoice === 'other' ? link.customPlatform.trim() : ''
      return {
        platform: link.platformChoice === 'other' ? platformSlug(customName) : link.platformChoice,
        ...(link.platformChoice === 'other' ? { platform_label: customName } : {}),
        handle_or_url: link.handle_or_url.trim(),
        note: link.note.trim() || undefined,
      }
    })
}

function beginOverviewEdit() {
  if (!creator.value) return
  editContact.email = creator.value.contact?.email ?? ''
  editContact.whatsapp = creator.value.contact?.whatsapp ?? ''
  editSocialLinks.splice(0, editSocialLinks.length, ...(creator.value.social_links ?? []).map((link) => toEditableSocialLink(link)))
  editingOverview.value = true
  overviewError.value = ''
  overviewBaseline.value = JSON.stringify({ contact: editContact, social: editSocialLinks })
}

function cancelOverviewEdit() {
  if (!creator.value) return
  editContact.email = creator.value.contact?.email ?? ''
  editContact.whatsapp = creator.value.contact?.whatsapp ?? ''
  editSocialLinks.splice(0, editSocialLinks.length, ...(creator.value.social_links ?? []).map((link) => toEditableSocialLink(link)))
  editingOverview.value = false
}

async function saveContact() {
  if (!creator.value) return
  const invalidPlatform = editSocialLinks.find((link) => !link.platformChoice || !link.handle_or_url.trim() || (link.platformChoice === 'other' && !link.customPlatform.trim()))
  if (invalidPlatform) {
    overviewError.value = 'Choose a platform, enter its handle or URL, and name it when you select Others.'
    return
  }
  if (editContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editContact.email)) { overviewError.value = 'Enter a valid email address.'; return }
  overviewError.value = ''
  savingContact.value = true
  try {
    creator.value = await updateProfile(creator.value.id, {
      contact: { email: editContact.email || undefined, whatsapp: editContact.whatsapp || undefined },
      social_links: socialPayload(),
    })
    editingOverview.value = false
    showSuccessToast('Overview saved.')
  } catch (error: any) {
    overviewError.value = typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : 'Could not save overview changes. Your input is retained.'
  } finally {
    savingContact.value = false
  }
}

type EditableRatePackage = { name: string; pricingMode: 'fixed' | 'range'; price: string; min: string; max: string; note: string }
type EditableRateGroup = { platform: string; platform_label: string; packages: EditableRatePackage[] }
const editRateCard = reactive({
  shorts: { min: '', max: '', note: '' },
  longform: { min: '', max: '', note: '' },
  currency: '',
  currencyVerified: false,
  social: [] as EditableRateGroup[],
})
const newRatePlatform = ref('')
const savingRateCard = ref(false)
const editingRateCard = ref(false)
const { get: apiGet } = useApi()
const currencyChangeMode = ref<'keep' | 'convert' | ''>('')
const currencyQuote = ref<{ rate: string; rate_as_of: string | null; fetched_at: string | null } | null>(null)
const currencyQuoteError = ref('')
const currencyHasChanged = computed(() => !!creator.value?.rate_card?.currency && !!editRateCard.currency && creator.value.rate_card.currency !== editRateCard.currency && !!(creator.value.rate_card.shorts?.min != null || creator.value.rate_card.shorts?.max != null || creator.value.rate_card.longform?.min != null || creator.value.rate_card.longform?.max != null || creator.value.rate_card.social?.some(g => g.packages?.length)))
watch(() => editRateCard.currency, async (currency) => {
  currencyQuote.value = null
  currencyQuoteError.value = ''
  currencyChangeMode.value = ''
  if (!currencyHasChanged.value || !creator.value?.rate_card?.currency) return
  try {
    const { data } = await apiGet<{ rate: string; rate_as_of: string | null; fetched_at: string | null }>('/api/v1/fx/quote', { params: { from_currency: creator.value.rate_card.currency, to_currency: currency } })
    currencyQuote.value = data
  } catch {
    currencyQuoteError.value = 'Quote unavailable. You can keep the amounts or try again later.'
  }
})
const availableRatePlatforms = computed(() => {
  const byPlatform = new Map<string, { value: string; label: string }>()
  for (const link of socialPayload()) {
    if (!link.platform) continue
    byPlatform.set(link.platform, {
      value: link.platform,
      label: link.platform_label || SOCIAL_PLATFORMS.find((item) => item.value === link.platform)?.label || link.platform,
    })
  }
  return [...byPlatform.values()]
})

function platformLabel(platform: string, customLabel?: string | null) {
  if (customLabel) return customLabel
  return availableRatePlatforms.value.find((item) => item.value === platform)?.label
    ?? SOCIAL_PLATFORMS.find((item) => item.value === platform)?.label
    ?? platform
}

function displayRateRange(min: number | string | null | undefined, max: number | string | null | undefined): string {
  if (editRateCard.currency && editRateCard.currencyVerified) return formatCurrencyRange(min, max, editRateCard.currency)
  return `${formatNumber(min)} – ${formatNumber(max)} · Currency unverified`
}

function displayRateAmount(value: number | string | null | undefined): string {
  if (editRateCard.currency && editRateCard.currencyVerified) return formatCurrency(value, editRateCard.currency)
  return `${formatNumber(value)} · Currency unverified`
}

function addRatePlatform() {
  if (!newRatePlatform.value || editRateCard.social.some((group) => group.platform === newRatePlatform.value)) return
  const platform = availableRatePlatforms.value.find((item) => item.value === newRatePlatform.value)
  editRateCard.social.push({ platform: newRatePlatform.value, platform_label: platform?.label ?? '', packages: [] })
  newRatePlatform.value = ''
}

function addRatePackage(group: EditableRateGroup) {
  group.packages.push({ name: '', pricingMode: 'fixed', price: '', min: '', max: '', note: '' })
}

function removeRatePlatform(platform: string) {
  editRateCard.social = editRateCard.social.filter((group) => group.platform !== platform)
}

const hasUnverifiedLegacyRates = computed(() => {
  const rate = creator.value?.rate_card
  return !!rate && !rate.currency_verified && (
    rate.shorts?.min != null || rate.shorts?.max != null || rate.longform?.min != null || rate.longform?.max != null ||
    rate.social?.some((group) => group.packages?.some((item) => item.price != null || item.min != null || item.max != null))
  )
})

const estimatorRateCard = computed(() => ({
  shorts_min: Number(editRateCard.shorts.min === '' ? editRateCard.shorts.max : editRateCard.shorts.min) || 0,
  shorts_max: Number(editRateCard.shorts.max === '' ? editRateCard.shorts.min : editRateCard.shorts.max) || 0,
  longform_min: Number(editRateCard.longform.min === '' ? editRateCard.longform.max : editRateCard.longform.min) || 0,
  longform_max: Number(editRateCard.longform.max === '' ? editRateCard.longform.min : editRateCard.longform.max) || 0,
}))

function toRateEntry(entry: { min: string; max: string; note: string }) {
  if (!entry.min && !entry.max && !entry.note) return {}
  return { min: entry.min || undefined, max: entry.max || undefined, note: entry.note || undefined }
}

function beginRateCardEdit() {
  rateBaseline.value = JSON.stringify(editRateCard)
  editingRateCard.value = true
}

function cancelRateCardEdit() {
  if (rateBaseline.value) Object.assign(editRateCard, JSON.parse(rateBaseline.value))
  editingRateCard.value = false
}

async function saveRateCard() {
  if (!creator.value) return
  const packages = editRateCard.social.flatMap((group) => group.packages)
  const hasAnyPrice = !!(editRateCard.shorts.min || editRateCard.shorts.max || editRateCard.longform.min || editRateCard.longform.max || packages.length)
  if (hasAnyPrice && (!editRateCard.currency || !editRateCard.currencyVerified)) {
    window.alert('Choose a currency and confirm it before saving rate-card prices.')
    return
  }
  for (const group of editRateCard.social) {
    for (const item of group.packages) {
      const invalidPrice = item.pricingMode === 'fixed'
        ? !item.price || Number(item.price) < 0
        : !item.min || !item.max || Number(item.min) < 0 || Number(item.max) < Number(item.min)
      if (!item.name.trim() || invalidPrice) {
        window.alert('Each package needs a name and a valid fixed price or minimum/maximum range.')
        return
      }
    }
  }
  if (currencyHasChanged.value && (!currencyChangeMode.value || (currencyChangeMode.value === 'convert' && !currencyQuote.value))) {
    window.alert('Choose keep or convert. Conversion needs an available quote.')
    return
  }
  savingRateCard.value = true
  try {
    const social = editRateCard.social.map((group) => ({
      platform: group.platform,
      ...(group.platform_label ? { platform_label: group.platform_label } : {}),
      packages: group.packages.map((item) => ({
        name: item.name.trim(),
        ...(item.pricingMode === 'fixed'
          ? { price: item.price }
          : { min: item.min, max: item.max }),
        ...(item.note.trim() ? { note: item.note.trim() } : {}),
      })),
    }))
    creator.value = await updateProfile(creator.value.id, {
      rate_card: {
        currency: editRateCard.currency || undefined,
        currency_verified: editRateCard.currency ? editRateCard.currencyVerified : undefined,
        currency_change_mode: currencyHasChanged.value ? currencyChangeMode.value as 'keep' | 'convert' : undefined,
        shorts: toRateEntry(editRateCard.shorts),
        longform: toRateEntry(editRateCard.longform),
        social,
      },
    })
    await load()
    editingRateCard.value = false
    showSuccessToast('Rate card saved.')
  } catch (error: any) {
    showErrorToast(typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : 'Could not save the rate card.')
  } finally {
    savingRateCard.value = false
  }
}

const perfHint = computed(() =>
  creator.value?.performance_summary
    ? `Based on the most recent ${creator.value.performance_summary.sample_video_count} public uploads.`
    : 'No performance sample yet — refresh to compute.',
)

const SOURCE_LABELS: Record<string, string> = {
  managed_channel: 'Managed channel',
  manual_lookup: 'Discovered',
  import: 'Discovered',
  brand_deal_report: 'Brand Deal Report',
}
function sourceLabels(c: CreatorProfile): string[] {
  const raw = c.sources?.length ? c.sources : [c.source]
  return [...new Set(raw.map((s) => SOURCE_LABELS[s] ?? s))]
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const breadcrumbItems = computed(() => [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Creator Discovery', to: discovery.listingPath },
  { label: creator.value?.title ?? 'Profile' },
])

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'content', label: 'Content' },
  { id: 'rate-card', label: 'Rate Card' },
  { id: 'notes', label: 'Notes' },
]

const editorDirty = computed(() => (editingOverview.value && JSON.stringify({ contact: editContact, social: editSocialLinks }) !== overviewBaseline.value) || (editingRateCard.value && JSON.stringify(editRateCard) !== rateBaseline.value))
const hasUnsavedChanges = computed(() => editorDirty.value || !!newNoteBody.value.trim() || !!(editingNoteId.value && notes.value.find((note) => note.id === editingNoteId.value)?.body !== editingNoteBody.value))
function protectUnload(event: BeforeUnloadEvent) {
  if (hasUnsavedChanges.value) { event.preventDefault(); event.returnValue = '' }
}
onBeforeRouteLeave(() => !hasUnsavedChanges.value || window.confirm('Discard unsaved changes and leave this creator?'))
onMounted(async () => {
  window.addEventListener('beforeunload', protectUnload)
  await load()
  if (activeTab.value === 'notes') void loadNotes()
  if (typeof route.query.campaign === 'string' && canManageCampaigns.value) campaignPickerOpen.value = true
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', protectUnload))
</script>
