<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div v-if="isAgency ? agencyLoading : creatorCampaignLoading" class="col-span-12">
      <div class="rounded-xl border border-border bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">Loading…</div>
    </div>
    <div v-else-if="isAgency ? !agencyCampaign : !mockCampaign" class="col-span-12">
      <EmptyState title="Campaign not found" description="It may not exist, or isn't visible to your role." />
    </div>

    <!-- Agency: workspace — release-plan-20260911-youtube-brand-campaign-r2-campaign-core-v1.md §5.
         Running (R4) ships as the `?tab=running` value below, per
         release-plan-20260912-youtube-brand-campaign-r4-r5-running-monitoring.md §3.4
         (superseding this comment's earlier "not built here" note). Monitoring (R5)
         is not built here yet. -->
    <template v-else-if="isAgency && agencyCampaign">
      <div class="col-span-12 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ agencyCampaign.name }}</h1>
            <StatusBadge :status="agencyCampaign.status" />
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            {{ agencyCampaign.brand_name }} · {{ formatCurrency(agencyCampaign.total_budget, agencyCampaign.currency) }} budget · {{ agencyCampaign.investment_mix }}
            <template v-if="agencyCampaign.start_date && agencyCampaign.end_date"> · {{ agencyCampaign.start_date }} – {{ agencyCampaign.end_date }}</template>
          </p>
          <!-- Phase 1: operational campaign code badge (minted at launch) -->
          <div v-if="agencyCampaign.campaign_code" class="mt-2 flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Campaign code</span>
            <code class="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-semibold tracking-widest text-foreground dark:bg-white/10 dark:text-white">{{ agencyCampaign.campaign_code }}</code>
            <button type="button" class="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5" @click="copyCode(agencyCampaign.campaign_code)">
              {{ codeCopied ? 'Copied ✓' : 'Copy' }}
            </button>
            <button
              v-if="!confirmingRegenerate"
              type="button"
              class="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              @click="confirmingRegenerate = true"
            >
              Regenerate
            </button>
            <span v-else class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              Revoke live codes and mint a new one?
              <button type="button" :disabled="regeneratingCode" class="font-semibold text-error-600 hover:underline" @click="doRegenerateCode">{{ regeneratingCode ? 'Working…' : 'Yes, regenerate' }}</button>
              <button type="button" class="hover:underline" @click="confirmingRegenerate = false">Keep</button>
            </span>
          </div>
          <div v-else-if="['open', 'active', 'paused'].includes(agencyCampaign.status)" class="mt-2">
            <button type="button" :disabled="generatingCode" class="rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5" @click="doEnsureCode">
              {{ generatingCode ? 'Generating…' : '+ Generate campaign code' }}
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <NotificationBell audience="agency" />
          <button
            v-if="agencyCampaign.status === 'draft'"
            type="button"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
            :disabled="savingForecast"
            @click="doSaveForecast"
          >
            {{ savingForecast ? 'Saving…' : 'Save forecast' }}
          </button>
          <button
            v-if="agencyCampaign.status === 'draft'"
            type="button"
            class="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            :disabled="launching"
            @click="doLaunch"
          >
            {{ launching ? 'Launching…' : 'Launch Campaign' }}
          </button>
          <button v-if="agencyCampaign.status === 'active'" type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="doPause">Pause</button>
          <button v-if="agencyCampaign.status === 'paused'" type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="doResume">Resume</button>
          <button v-if="['open', 'active', 'paused'].includes(agencyCampaign.status)" type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="doComplete">Mark Complete</button>
          <button v-if="!['completed', 'cancelled', 'archived'].includes(agencyCampaign.status)" type="button" class="rounded-lg border border-error-200 px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10" @click="doCancel">Cancel</button>
        </div>
      </div>

      <div v-if="actionError" class="col-span-12 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-500">{{ actionError }}</div>

      <div class="col-span-12">
        <Tabs v-model="activeTab" :tabs="visibleTabs">
          <template #overview>
            <div class="flex flex-col gap-4">
              <PlaceholderSection title="Basics">
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricValue label="Budget" :value="formatCurrency(agencyCampaign.total_budget, agencyCampaign.currency)" />
                  <MetricValue
                    label="Duration"
                    :value="agencyCampaign.duration_days ? `${agencyCampaign.duration_days} days` : '—'"
                    :hint="agencyCampaign.start_date && agencyCampaign.end_date ? `${agencyCampaign.start_date} → ${agencyCampaign.end_date}` : undefined"
                  />
                  <MetricValue label="Completeness" :value="`${agencyCampaign.completeness.percentage}%`" :hint="agencyCampaign.completeness.missing.join(', ') || undefined" />
                  <MetricValue label="Creators" :value="agencyCampaign.roster_count" :hint="`${agencyCampaign.product_count} product(s)`" />
                </div>
                <!-- Phase 1: campaign code distribution summary -->
                <div v-if="agencyCampaign.campaign_code" class="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Campaign code</span>
                  <code class="font-mono text-sm font-semibold tracking-widest text-foreground dark:text-white">{{ agencyCampaign.campaign_code }}</code>
                  <button type="button" class="text-xs font-medium text-brand-500 hover:underline" @click="copyCode(agencyCampaign.campaign_code)">{{ codeCopied ? 'Copied ✓' : 'Copy' }}</button>
                  <span class="text-xs text-gray-400">· {{ issuedCount }} issued · {{ consumedCount }} submitted</span>
                  <button type="button" class="text-xs font-medium text-brand-500 hover:underline" @click="goToRoster">Manage →</button>
                </div>
              </PlaceholderSection>

              <PlaceholderSection title="Investment mix" description="How this campaign's budget splits between creator packages (organic) and paid ads.">
                <p v-if="agencyCampaign.status !== 'draft'" class="mb-3 text-xs text-gray-400">Only editable while the campaign is a draft.</p>
                <div class="mb-4 flex gap-2">
                  <button
                    v-for="m in (['hybrid', 'creator', 'ads'] as const)"
                    :key="m"
                    type="button"
                    :disabled="agencyCampaign.status !== 'draft'"
                    :class="[
                      'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      agencyCampaign.investment_mix === m
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
                    ]"
                    @click="setInvestmentMix(m)"
                  >
                    {{ m === 'hybrid' ? 'Hybrid' : m === 'creator' ? 'Creator only' : 'Ads only' }}
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <span class="mb-0.5 flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Creator (organic) spend</span>
                      <InfoTooltip metric-key="creator_payout" />
                    </span>
                    <span class="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {{ formatCurrency(agencyCampaign.creator_budget ?? 0, agencyCampaign.currency) }}
                    </span>
                    <span class="block text-xs text-gray-400">= roster package total</span>
                  </div>
                  <div>
                    <span class="mb-0.5 flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Ads (paid) spend</span>
                      <InfoTooltip metric-key="ad_spend" />
                    </span>
                    <span class="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {{ formatCurrency(agencyCampaign.ads_budget ?? 0, agencyCampaign.currency) }}
                    </span>
                    <span class="block text-xs text-gray-400">= total − creator, in hybrid/ads modes</span>
                  </div>
                  <div>
                    <label class="mb-0.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Target ROI</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      :value="agencyCampaign.target_roi ?? 2"
                      :disabled="agencyCampaign.status !== 'draft'"
                      class="h-9 w-24 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      @change="setTargetRoi(($event.target as HTMLInputElement).valueAsNumber || 0)"
                    />
                  </div>
                </div>

                <!-- Investment vs total budget — the prototype's #fc-budget-meter -->
                <div class="mt-4 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div class="mb-1.5 flex items-center justify-between text-xs">
                    <span class="font-medium text-gray-500 dark:text-gray-400">Investment vs total budget</span>
                    <span :class="agencyCampaign.budget_overrun ? 'font-semibold text-error-600 dark:text-error-500' : 'text-gray-500 dark:text-gray-400'">
                      {{ formatCurrency(plannedSpend, agencyCampaign.currency) }} / {{ formatCurrency(agencyCampaign.total_budget ?? 0, agencyCampaign.currency) }}
                      ({{ budgetUsedPct }}%)
                    </span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                    <div class="flex h-full">
                      <div class="h-full bg-brand-500" :style="{ width: `${organicSharePct}%` }" />
                      <div class="h-full bg-blue-light-500" :style="{ width: `${paidSharePct}%` }" />
                    </div>
                  </div>
                  <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span class="flex items-center gap-1"><i class="h-1.5 w-1.5 rounded-full bg-brand-500" /> Organic</span>
                    <span class="flex items-center gap-1"><i class="h-1.5 w-1.5 rounded-full bg-blue-light-500" /> Paid ads</span>
                    <span>
                      Remaining budget:
                      <span :class="remainingBudget < 0 ? 'font-medium text-error-600 dark:text-error-500' : ''">
                        {{ formatCurrency(remainingBudget, agencyCampaign.currency) }}
                      </span>
                    </span>
                  </div>
                  <p v-if="agencyCampaign.budget_overrun" class="mt-2 rounded-md bg-warning-50 px-2 py-1.5 text-xs text-warning-700 dark:bg-warning-500/10 dark:text-warning-500">
                    Planned spend exceeds the total budget by {{ formatCurrency(agencyCampaign.budget_overrun, agencyCampaign.currency) }}.
                    Launch will ask you to acknowledge this first.
                  </p>
                </div>
              </PlaceholderSection>

              <PlaceholderSection
                title="Forecast outcomes"
                description="Live estimate from roster performance and stated assumptions — not a guarantee. Commerce figures (GMV/ROI/ROAS) show Coming Soon, pending Merchant API access; CCE is not shown at all (undefined metric)."
              >
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <span class="mb-0.5 flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Net GMV</span>
                      <InfoTooltip metric-key="net_gmv" />
                    </span>
                    <span class="text-lg font-semibold text-gray-400">Coming Soon</span>
                  </div>
                  <div>
                    <span class="mb-0.5 flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Est. views</span>
                      <InfoTooltip metric-key="views" />
                    </span>
                    <span class="text-lg font-semibold text-gray-800 dark:text-white/90">{{ formatCompactNumber(liveForecast.views.total) }}</span>
                    <span class="block text-xs text-gray-400">
                      {{ formatCompactNumber(liveForecast.views.organic) }} organic · {{ formatCompactNumber(liveForecast.views.paid) }} paid
                    </span>
                  </div>
                  <div>
                    <span class="mb-0.5 flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Est. engagement rate</span>
                      <InfoTooltip metric-key="engagement_rate" />
                    </span>
                    <span class="text-lg font-semibold text-gray-800 dark:text-white/90">{{ liveForecast.engagement_rate.toFixed(2) }}%</span>
                  </div>
                  <div>
                    <span class="mb-0.5 flex items-center gap-1">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Est. ROI</span>
                      <InfoTooltip metric-key="roi" />
                    </span>
                    <span class="text-lg font-semibold text-gray-400">Coming Soon</span>
                  </div>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricValue label="Organic GMV" value="Coming Soon" />
                  <MetricValue label="Paid GMV" value="Coming Soon" />
                  <MetricValue label="ROAS" value="Coming Soon" />
                  <MetricValue label="Target ROI" :value="`${(agencyCampaign.target_roi ?? 2).toFixed(1)}x`" />
                </div>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <p class="text-xs text-gray-400">
                    Live estimate · {{ formatCurrency(assumptions.assumed_cpm, agencyCampaign.currency) }} CPM,
                    {{ assumptions.committed_videos_per_creator }} committed videos/creator
                    <template v-if="forecast"> · last saved v{{ forecast.version }} ({{ forecast.engine_version }})</template>
                  </p>
                  <span
                    v-if="!forecast"
                    class="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-500"
                  >
                    Save forecast after setting each roster creator's package to enable launch
                  </span>
                  <span
                    v-else-if="agencyCampaign.forecast_stale"
                    class="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-500"
                  >
                    Inputs changed since v{{ forecast.version }} — save forecast again to launch
                  </span>
                  <span v-else class="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-500/10 dark:text-success-500">
                    Saved forecast matches these inputs
                  </span>
                </div>
              </PlaceholderSection>

              <PlaceholderSection title="Products in campaign" description="SKUs tagged to this campaign.">
                <template #default>
                  <div v-if="products.length === 0" class="mb-3 text-sm text-gray-400">No products added yet.</div>
                  <div v-else class="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div v-for="p in products" :key="p.id" class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                      <div class="mb-2 h-16 w-full rounded-md bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-500/20 dark:to-brand-500/5" />
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <p class="truncate text-sm font-medium text-gray-800 dark:text-white/90">{{ p.name }}</p>
                          <p class="text-xs text-gray-400">{{ p.sku }} · {{ formatCurrency(p.price ?? 0, agencyCampaign.currency) }}</p>
                        </div>
                        <button type="button" class="shrink-0 text-xs font-medium text-error-600 hover:underline" @click="doRemoveProduct(p.id)">Remove</button>
                      </div>
                    </div>
                  </div>

                  <form v-if="isAddProductOpen" class="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-4 sm:items-end" @submit.prevent="submitProduct">
                    <div>
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">SKU</label>
                      <input v-model="productForm.sku" type="text" placeholder="YAB-MATCHA" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
                      <input v-model="productForm.name" type="text" required placeholder="YA'Bar Matcha" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Price</label>
                      <input v-model.number="productForm.price" type="number" min="0" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div class="flex gap-2">
                      <button type="submit" class="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add</button>
                      <button type="button" class="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300" @click="isAddProductOpen = false">Cancel</button>
                    </div>
                  </form>
                  <button v-else type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5" @click="isAddProductOpen = true">
                    + Add Product
                  </button>
                </template>
              </PlaceholderSection>
            </div>
          </template>

          <template #roster>
            <PlaceholderSection title="Roster" description="Creator list on this campaign with deliverable package, cost, source, remove action.">
              <template #default>
                <p v-if="agencyCampaign.status === 'draft' && agencyCampaign.investment_mix !== 'ads'" class="mb-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
                  To launch: set a deliverable package for every creator below, then click Save forecast at the top right.
                </p>
                <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Package total
                    <span class="ml-1 font-semibold text-gray-800 dark:text-white/90">{{ formatCurrency(rosterPackageTotal, agencyCampaign.currency) }}</span>
                    <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      = creator (organic) spend
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      v-if="canIssueCodes && unissuedRosterCount > 0"
                      type="button"
                      :disabled="bulkIssuing"
                      class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                      @click="doBulkIssue"
                    >
                      {{ bulkIssuing ? 'Issuing…' : `Issue code to all (${unissuedRosterCount})` }}
                    </button>
                    <button
                      v-if="agencyCampaign.status === 'draft'"
                      type="button"
                      class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                      @click="openAddCreators"
                    >
                      + Add Creators
                    </button>
                  </div>
                </div>
                <div v-if="roster.length === 0" class="text-sm text-gray-400">No creators added yet.</div>
                <div v-else class="flex flex-col gap-3">
                  <div v-for="cc in roster" :key="cc.id" class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-gray-800 dark:text-white/90">{{ creatorName(cc.creator_profile_id) }}</span>
                        <span class="ml-2 text-xs text-gray-400">{{ cc.source === 'discovery' ? 'from Creator Discovery' : 'from application' }}</span>
                        <!-- Phase 1: per-creator code issuance chip -->
                        <span v-if="canIssueCodes" class="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" :class="issuanceChipClass(cc.id)">
                          {{ issuanceChipLabel(cc.id) }}
                        </span>
                        <span class="mt-0.5 block text-xs text-gray-400">
                          {{ formatCompactNumber(creatorViews(cc.creator_profile_id)) }} avg views/video ·
                          {{ creatorEngagement(cc.creator_profile_id).toFixed(2) }}% ER
                        </span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-sm text-gray-500 dark:text-gray-400">{{ cc.pricing_snapshot?.status === 'ready' || (cc.rate_card_snapshot?.currency_verified && cc.rate_card_snapshot?.currency === agencyCampaign.currency) ? formatCurrency(cc.planned_cost, agencyCampaign.currency) : 'Pricing unavailable' }}</span>
                        <StatusBadge :status="cc.status" />
                        <button v-if="canIssueCodes && !issuanceForRoster(cc.id)" type="button" class="text-xs font-medium text-brand-500 hover:underline" @click="openIssueCode(cc)">Issue code</button>
                        <button v-if="canIssueCodes && issuanceForRoster(cc.id)?.usable" type="button" class="text-xs font-medium text-gray-400 hover:underline" @click="doRevokeIssuance(issuanceForRoster(cc.id)!.id)">Revoke</button>
                        <button v-if="canIssueCodes && issuanceForRoster(cc.id)?.usable" type="button" class="text-xs font-medium text-brand-500 hover:underline" @click="openOutreach(cc)">Outreach</button>
                        <button v-if="cc.status === 'selected'" type="button" class="text-xs font-medium text-error-600 hover:underline" @click="doRemoveCreator(cc.id)">Remove</button>
                      </div>
                    </div>
                    <div v-if="cc.status === 'selected'" class="mt-2">
                      <p v-if="cc.pricing_snapshot?.lines?.length" class="mb-2 text-xs text-gray-500">Original: {{ cc.pricing_snapshot.lines.map((line: any) => formatCurrency(line.original_amount, line.original_currency)).join(' + ') }} · FX as of {{ cc.pricing_snapshot.lines[0]?.campaign?.rate_as_of || cc.pricing_snapshot.lines[0]?.usd?.rate_as_of || 'identity' }} · converted {{ cc.pricing_snapshot.lines[0]?.campaign?.converted_at }} · USD equivalent {{ cc.pricing_snapshot.usd_total != null ? formatCurrency(cc.pricing_snapshot.usd_total, 'USD') : 'pending' }}</p>
                      <p v-if="!cc.rate_card_snapshot" class="mb-2 text-xs text-amber-700 dark:text-amber-400">No rate card saved. Package pricing is unavailable until the creator adds a verified rate card.</p>
                      <PackageCostEstimator
                        :rate-card="flatRateCard(cc)"
                        :currency="cc.rate_card_snapshot?.currency || 'IDR'"
                        :show-estimate="!!cc.rate_card_snapshot?.currency_verified"
                        :model-value="{ shorts: cc.package?.shorts ?? 0, longform: cc.package?.longform ?? 0 }"
                        @update:model-value="(v) => doUpdatePackage(cc.id, v)"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </PlaceholderSection>
          </template>

          <template v-if="showRunningTab" #running>
            <PlaceholderSection title="Posted videos" description="Register a video after a creator posts it, then verify it once metadata resolves — verified videos feed Monitoring.">
              <template #default>
                <div v-if="videosLoading" class="text-sm text-gray-400">Loading…</div>
                <div v-else class="flex flex-col gap-3">
                  <div v-if="videos.length === 0" class="text-sm text-gray-400">No videos registered yet.</div>
                  <div v-for="v in videos" :key="v.id" class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="mb-1 flex flex-wrap items-center gap-2">
                          <StatusBadge :status="v.status" />
                          <span v-if="v.status === 'pending_verification'" class="text-xs text-gray-400">
                            metadata: <StatusBadge :status="v.metadata_status" :dot="false" />
                          </span>
                          <span v-if="v.format" class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 dark:bg-white/5 dark:text-gray-300">{{ v.format }}</span>
                          <span v-if="v.has_product_tag" class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">Product tag</span>
                        </div>
                        <p class="truncate text-sm font-medium text-gray-800 dark:text-white/90">{{ v.title || v.video_url || 'Awaiting upload' }}</p>
                        <p class="text-xs text-gray-400">
                          {{ creatorNameForRosterId(v.campaign_creator_id) }}
                          <template v-if="v.published_at"> · {{ new Date(v.published_at).toLocaleDateString() }}</template>
                          <template v-if="v.video_url"> · <a :href="v.video_url" target="_blank" rel="noopener" class="text-brand-500 hover:underline">Open ↗</a></template>
                          <span v-if="v.campaign_code_used" class="ml-1 rounded-full bg-brand-50 px-2 py-0.5 font-mono font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">code {{ v.campaign_code_used }}</span>
                        </p>
                        <p v-if="v.status === 'pending_upload'" class="mt-1 text-xs text-gray-400">Code reserved — waiting for the creator to upload and attach the link.</p>
                        <p v-if="v.metadata_status === 'failed'" class="mt-1 text-xs text-error-600 dark:text-error-500">{{ v.metadata_error }}</p>
                        <div v-if="attachingId === v.id" class="mt-2 flex items-center gap-2">
                          <input v-model="attachForm.url" type="url" required placeholder="https://youtube.com/shorts/... or /watch?v=..." class="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                          <button type="button" :disabled="attachingBusy || !attachForm.url" class="h-8 shrink-0 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" @click="doAttachUpload(v.id)">
                            {{ attachingBusy ? 'Attaching…' : 'Attach' }}
                          </button>
                          <button type="button" class="text-xs text-gray-400 hover:underline" @click="attachingId = null">Cancel</button>
                        </div>
                      </div>
                      <div class="flex shrink-0 items-center gap-2">
                        <button
                          v-if="v.status === 'pending_upload'"
                          type="button"
                          class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                          @click="attachingId = v.id; attachForm.url = ''"
                        >
                          Attach link
                        </button>
                        <button
                          v-if="v.status === 'pending_verification'"
                          type="button"
                          :disabled="v.metadata_status !== 'resolved' || verifyingId === v.id"
                          class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          @click="doVerifyVideo(v.id)"
                        >
                          {{ verifyingId === v.id ? 'Verifying…' : 'Verify & track' }}
                        </button>
                        <button
                          v-if="v.status === 'pending_verification' || v.status === 'pending_upload'"
                          type="button"
                          class="text-xs font-medium text-error-600 hover:underline"
                          @click="doRejectVideo(v.id)"
                        >
                          {{ v.status === 'pending_upload' ? 'Discard' : 'Reject' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <form class="mt-2 grid grid-cols-1 gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-12 sm:items-end" @submit.prevent="submitVideo">
                    <!-- Phase 1: register mode toggle (by code vs by video link) -->
                    <div class="flex gap-2 sm:col-span-12">
                      <button
                        v-for="m in (['by-code', 'by-link'] as const)"
                        :key="m"
                        type="button"
                        :class="[
                          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                          videoForm.mode === m ? 'bg-primary text-primary-foreground' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
                        ]"
                        @click="videoForm.mode = m"
                      >
                        {{ m === 'by-code' ? 'By campaign code' : 'By video link' }}
                      </button>
                    </div>
                    <div v-if="videoForm.mode === 'by-code'" class="sm:col-span-5">
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Campaign code *</label>
                      <input v-model="videoForm.code" type="text" inputmode="numeric" placeholder="e.g. 550067" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 font-mono text-sm tracking-widest dark:border-gray-700 dark:bg-gray-800 dark:text-white" @blur="resolveRegisterCode" />
                      <p v-if="codeResolveMessage" class="mt-1 text-xs" :class="codeResolveOk ? 'text-success-600' : 'text-error-600'">{{ codeResolveMessage }}</p>
                    </div>
                    <div class="sm:col-span-5">
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Video URL *</label>
                      <input v-model="videoForm.url" type="url" required placeholder="https://youtube.com/shorts/... or /watch?v=..." class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div class="sm:col-span-3">
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Creator{{ videoForm.mode === 'by-code' ? ' (optional)' : '' }}</label>
                      <select v-model="videoForm.campaignCreatorId" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option v-if="videoForm.mode === 'by-code'" value="">Auto-match from code</option>
                        <option v-for="cc in roster" :key="cc.id" :value="cc.id">{{ creatorName(cc.creator_profile_id) }}</option>
                      </select>
                    </div>
                    <div class="sm:col-span-2">
                      <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Format</label>
                      <select v-model="videoForm.format" class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="shorts">Shorts</option>
                        <option value="longform">Longform</option>
                      </select>
                    </div>
                    <div class="sm:col-span-2">
                      <button type="submit" :disabled="registeringVideo || (videoForm.mode === 'by-link' && !videoForm.campaignCreatorId)" class="h-9 w-full rounded-lg bg-primary px-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ registeringVideo ? 'Registering…' : '+ Register Video' }}
                      </button>
                    </div>
                    <label class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:col-span-12">
                      <input v-model="videoForm.hasProductTag" type="checkbox" />
                      Product tag attached (Merchant / shopping)
                    </label>
                  </form>
                </div>
              </template>
            </PlaceholderSection>
          </template>

          <template v-if="showMonitoringTab" #monitoring>
            <div class="flex flex-col gap-4">
              <PlaceholderSection title="Monitoring" description="Forecast vs. actual, by funnel — computed from stored data, never a live API call.">
                <template #default>
                  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex gap-2">
                      <button
                        v-for="f in (['combined', 'organic', 'paid'] as const)"
                        :key="f"
                        type="button"
                        :class="[
                          'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                          monitoringFunnel === f ? 'bg-primary text-primary-foreground' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
                        ]"
                        @click="setMonitoringFunnel(f)"
                      >
                        {{ f === 'combined' ? 'Combined' : f === 'organic' ? 'Organic Only' : 'Paid Ads Only' }}
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <span v-if="refreshStatsMessage" class="text-xs text-gray-400">{{ refreshStatsMessage }}</span>
                      <button
                        type="button"
                        :disabled="refreshingStats"
                        class="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
                        @click="doRefreshStats"
                      >
                        {{ refreshingStats ? 'Refreshing…' : '↻ Refresh stats' }}
                      </button>
                    </div>
                  </div>

                  <div v-if="monitoringLoading" class="text-sm text-gray-400">Loading…</div>
                  <template v-else-if="monitoring">
                    <div v-if="monitoring.kpis.unavailable_reason" class="rounded-lg border border-dashed border-border p-4 text-sm text-gray-400 dark:border-gray-700">
                      No paid data source connected.
                    </div>
                    <template v-else>
                      <p v-if="monitoring.kpis.note" class="mb-3 text-xs text-gray-400">{{ monitoring.kpis.note }}</p>
                      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <MetricValue label="Views" :value="formatCompactNumber(monitoring.kpis.views ?? 0)" />
                        <MetricValue label="Engagement rate" :value="`${(monitoring.kpis.engagement_rate ?? 0).toFixed(2)}%`" />
                        <MetricValue label="Net GMV" :value="monitoring.kpis.net_gmv !== null ? formatCurrency(monitoring.kpis.net_gmv, agencyCampaign.currency) : 'Coming Soon'" />
                        <MetricValue label="Live videos" :value="monitoring.campaign.live_video_count" />
                      </div>
                    </template>

                    <div v-if="monitoring.has_baseline_forecast && monitoring.forecast_vs_actual" class="mt-5 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                      <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Forecast vs. actual</p>
                      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <span class="text-xs text-gray-400">Views</span>
                          <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                            {{ formatCompactNumber(monitoring.forecast_vs_actual.views.actual ?? 0) }} /
                            {{ formatCompactNumber(monitoring.forecast_vs_actual.views.forecast ?? 0) }}
                            <span v-if="monitoring.forecast_vs_actual.views.delta_pct !== null" :class="monitoring.forecast_vs_actual.views.delta_pct >= 0 ? 'text-success-600' : 'text-error-600'">
                              ({{ monitoring.forecast_vs_actual.views.delta_pct >= 0 ? '+' : '' }}{{ monitoring.forecast_vs_actual.views.delta_pct }}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <span class="text-xs text-gray-400">Engagement rate</span>
                          <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                            {{ (monitoring.forecast_vs_actual.engagement_rate.actual ?? 0).toFixed(2) }}% /
                            {{ (monitoring.forecast_vs_actual.engagement_rate.forecast ?? 0).toFixed(2) }}%
                          </p>
                        </div>
                        <div>
                          <span class="text-xs text-gray-400">Net GMV</span>
                          <p class="text-sm font-medium text-gray-400">Coming Soon</p>
                        </div>
                        <div>
                          <span class="text-xs text-gray-400">ROI</span>
                          <p class="text-sm font-medium text-gray-400">Coming Soon</p>
                        </div>
                      </div>
                    </div>
                    <div v-else class="mt-5 rounded-lg border border-dashed border-border p-4 text-sm text-gray-400 dark:border-gray-700">
                      No baseline forecast was saved before launch — forecast-vs-actual is unavailable for this campaign.
                    </div>
                  </template>
                </template>
              </PlaceholderSection>

              <PlaceholderSection title="By video" description="Every tracked (verified) video — pending videos never appear here.">
                <template #default>
                  <div v-if="!monitoring || monitoring.by_video.length === 0" class="text-sm text-gray-400">No tracked videos yet.</div>
                  <div v-else class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800">
                          <th class="py-2 pr-3 font-medium">Video</th>
                          <th class="py-2 pr-3 font-medium">Format</th>
                          <th class="py-2 pr-3 font-medium">Views</th>
                          <th class="py-2 pr-3 font-medium">ER</th>
                          <th class="py-2 pr-3 font-medium">GMV</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="v in monitoring.by_video" :key="v.id" class="border-b border-gray-50 dark:border-gray-800/50">
                          <td class="max-w-xs truncate py-2 pr-3 text-gray-800 dark:text-white/90">{{ v.title || v.id }}</td>
                          <td class="py-2 pr-3 capitalize text-gray-500 dark:text-gray-400">{{ v.format }}</td>
                          <td class="py-2 pr-3 text-gray-500 dark:text-gray-400">{{ formatCompactNumber(v.views) }}</td>
                          <td class="py-2 pr-3 text-gray-500 dark:text-gray-400">{{ v.engagement_rate.toFixed(2) }}%</td>
                          <td class="py-2 pr-3 text-gray-500 dark:text-gray-400">{{ v.gmv !== null ? formatCurrency(v.gmv, agencyCampaign.currency) : 'Coming Soon' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
              </PlaceholderSection>

              <PlaceholderSection title="By creator" description="Aggregated per roster creator.">
                <template #default>
                  <div v-if="!monitoring || monitoring.by_creator.length === 0" class="text-sm text-gray-400">No data yet.</div>
                  <div v-else class="flex flex-col gap-2">
                    <div v-for="c in monitoring.by_creator" :key="c.campaign_creator_id" class="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 text-sm dark:border-gray-800">
                      <span class="font-medium text-gray-800 dark:text-white/90">{{ creatorName(c.creator_profile_id) }}</span>
                      <span class="text-gray-500 dark:text-gray-400">{{ c.video_count }} video(s) · {{ formatCompactNumber(c.views) }} views · {{ c.gmv !== null ? formatCurrency(c.gmv, agencyCampaign.currency) : 'GMV: Coming Soon' }}</span>
                    </div>
                  </div>
                </template>
              </PlaceholderSection>

              <PlaceholderSection title="Commerce data" description="Manual Merchant Center import — the same normalized data R6's real sync will later populate.">
                <template #default>
                  <button type="button" class="mb-3 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="openCommerceImport">
                    Import commerce data
                  </button>
                  <div v-if="commerceImports.length" class="flex flex-col gap-2">
                    <div v-for="imp in commerceImports" :key="imp.id" class="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 text-xs dark:border-gray-800">
                      <span class="text-gray-600 dark:text-gray-300">{{ imp.file_name }} · {{ imp.rows_imported }}/{{ imp.rows_total }} rows · <StatusBadge :status="imp.status" :dot="false" /></span>
                      <button v-if="imp.status === 'completed'" type="button" class="text-error-600 hover:underline" @click="doRevertImport(imp.id)">Revert</button>
                    </div>
                  </div>
                </template>
              </PlaceholderSection>

              <PlaceholderSection title="Narrative insight" description="AI-generated summary for the selected funnel.">
                <template #default>
                  <div v-if="monitoringInsight?.status === 'completed'" class="text-sm text-gray-700 dark:text-gray-300">
                    <p>{{ monitoringInsight.insight_text }}</p>
                    <p class="mt-2 text-xs text-gray-400">AI-generated · {{ monitoringInsight.model }}</p>
                  </div>
                  <div v-else-if="monitoringInsight?.status === 'processing'" class="text-sm text-gray-400">Generating…</div>
                  <div v-else-if="monitoringInsight?.status === 'failed'" class="text-sm text-error-600 dark:text-error-500">{{ monitoringInsight.error_message }}</div>
                  <div v-else class="text-sm text-gray-400">No insight generated yet for this funnel.</div>
                  <button type="button" class="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="doGenerateInsight">
                    {{ monitoringInsight?.status === 'processing' ? 'Regenerating…' : 'Generate insight' }}
                  </button>
                </template>
              </PlaceholderSection>
            </div>
          </template>

          <template #activity>
            <PlaceholderSection title="Activity" description="Chronological timeline of status changes and roster edits.">
              <CampaignActivityTimeline ref="timelineRef" :campaign-id="agencyCampaign.id" />
            </PlaceholderSection>
          </template>
        </Tabs>
      </div>

      <!-- Cancel: reason is required (doc 04 §1) -->
      <Modal :is-open="isCancelOpen" title="Cancel campaign" size="md" @close="isCancelOpen = false">
        <p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
          Cancelling withdraws every creator on the roster and cannot be undone. A reason is recorded on the activity timeline.
        </p>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Reason *</label>
        <textarea
          v-model="cancelReason"
          rows="3"
          placeholder="e.g. Brand pulled the budget for this quarter"
          class="w-full resize-none rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <template #footer>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
            @click="isCancelOpen = false"
          >
            Keep campaign
          </button>
          <button
            type="button"
            :disabled="!cancelReason.trim() || cancelling"
            class="rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            @click="confirmCancel"
          >
            {{ cancelling ? 'Cancelling…' : 'Cancel campaign' }}
          </button>
        </template>
      </Modal>

      <!-- Launch: surfaces the gate's missing items, and the overrun acknowledgement -->
      <Modal :is-open="isLaunchOpen" title="Launch campaign" size="md" @close="isLaunchOpen = false">
        <div v-if="agencyCampaign.completeness.missing.length" class="mb-3">
          <p class="mb-1.5 text-sm font-medium text-gray-800 dark:text-white/90">Complete these steps before launch</p>
          <ul class="list-inside list-disc text-sm text-gray-600 dark:text-gray-300">
            <li v-for="item in agencyCampaign.completeness.missing" :key="item">{{ item }}</li>
          </ul>
        </div>
        <p v-else class="mb-3 text-sm text-gray-600 dark:text-gray-300">
          Everything the launch gate requires is in place. Launching freezes the saved forecast as this campaign's baseline
          and confirms every roster creator.
        </p>
        <p class="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
          A unique campaign code is auto-generated at launch — creators will use it
          <template v-if="agencyCampaign.campaign_code">: <code class="font-mono font-semibold">{{ agencyCampaign.campaign_code }}</code></template>
          <template v-else> (revealed here after launch)</template>.
        </p>

        <label class="mb-1.5 mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Launch into</label>
        <select v-model="launchTarget" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <option value="active">Active — tracking starts, no inbound applications</option>
          <option value="open">Open — also accept creator applications</option>
        </select>

        <label v-if="agencyCampaign.budget_overrun" class="mt-3 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="acknowledgeOverrun" type="checkbox" class="mt-0.5" />
          <span>
            I acknowledge that planned spend exceeds the budget by
            {{ formatCurrency(agencyCampaign.budget_overrun, agencyCampaign.currency) }}.
          </span>
        </label>

        <template #footer>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
            @click="isLaunchOpen = false"
          >
            Not yet
          </button>
          <button
            type="button"
            :disabled="launching"
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            @click="confirmLaunch"
          >
            {{ launching ? 'Launching…' : 'Launch' }}
          </button>
        </template>
      </Modal>

      <!-- Add Creators: reuses the Creator Discovery list, filtered to not-yet-added (release-plan-09 §5.3) -->
      <Modal :is-open="isAddCreatorOpen" title="Add Creators" size="lg" @close="isAddCreatorOpen = false">
        <div v-if="addCreatorLoading" class="text-sm text-gray-400">Loading…</div>
        <div v-else-if="availableCreators.length === 0" class="text-sm text-gray-400">Every creator in the bank is already on this roster, or the bank is empty.</div>
        <div v-else class="flex flex-col gap-3">
          <div v-for="c in availableCreators" :key="c.id" class="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-white/90">{{ c.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ c.custom_url }}</p>
            </div>
            <button type="button" class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90" @click="doAddCreator(c.id)">Add</button>
          </div>
        </div>
      </Modal>

      <!-- Phase 1: Issue campaign code to one roster creator (name/channel link is enough — no video URL) -->
      <Modal :is-open="isIssueOpen" title="Issue campaign code" size="md" @close="isIssueOpen = false">
        <p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
          Code <code class="font-mono font-semibold">{{ agencyCampaign.campaign_code }}</code> will be recorded for this creator.
        </p>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Creator name *</label>
        <input v-model="issueForm.creatorName" type="text" required placeholder="e.g. Salsa Food Diary" class="mb-3 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Channel URL or handle</label>
        <input v-model="issueForm.channelUrl" type="text" placeholder="https://youtube.com/@channel or @channel" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        <p class="mt-1 text-xs text-gray-400">Resolved against YouTube when provided; the issuance is still recorded when it can't be resolved.</p>
        <p v-if="issueError" class="mt-2 text-sm text-error-600 dark:text-error-500">{{ issueError }}</p>
        <template #footer>
          <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="isIssueOpen = false">
            Cancel
          </button>
          <button type="button" :disabled="!issueForm.creatorName.trim() || issuingCode" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" @click="confirmIssueCode">
            {{ issuingCode ? 'Issuing…' : 'Issue code' }}
          </button>
        </template>
      </Modal>

      <!-- Phase 1: outreach message (copy-paste to WhatsApp/email) -->
      <Modal :is-open="isOutreachOpen" title="Outreach message" size="md" @close="isOutreachOpen = false">
        <pre class="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200">{{ outreachText }}</pre>
        <template #footer>
          <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="isOutreachOpen = false">
            Close
          </button>
          <button type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" @click="copyOutreach">
            {{ outreachCopied ? 'Copied ✓' : 'Copy message' }}
          </button>
        </template>
      </Modal>
    </template>

    <!-- Creator: full brief, single page (release-plan-09 §7.2) — real API (R3) -->
    <template v-else>
      <div class="col-span-12 lg:col-span-8 lg:col-start-3">
        <div class="rounded-xl border border-border bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ mockCampaign!.brand_name }}</h1>
            <StatusBadge :status="mockCampaign!.status" />
          </div>
          <p class="text-gray-600 dark:text-gray-400">{{ mockCampaign!.name }}</p>

          <!-- Phase 1: Your upload code (C2) — prominent, above the brief -->
          <div class="mt-6 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-4 dark:border-brand-500/40 dark:bg-brand-500/5">
            <div v-if="myCodeLoading" class="text-sm text-gray-400">Loading your upload code…</div>
            <template v-else-if="myCode">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Your upload code</p>
              <div class="mt-1 flex flex-wrap items-center gap-3">
                <code class="font-mono text-3xl font-bold tracking-[0.2em] text-foreground dark:text-white">{{ myCode.campaign_code }}</code>
                <button type="button" class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90" @click="copyCode(myCode.campaign_code ?? '')">
                  {{ codeCopied ? 'Copied ✓' : 'Copy code' }}
                </button>
              </div>
              <ol class="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li v-for="(step, i) in myCode.instructions_id" :key="i">{{ step }}</li>
              </ol>
              <p v-if="myCode.external_campaign_code" class="mt-2 text-xs text-gray-400">
                Brand's YouTube code: <code class="font-mono font-semibold">{{ myCode.external_campaign_code }}</code> — select this campaign in YouTube Studio.
              </p>
            </template>
            <template v-else>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">No upload code yet</p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ myCodeMessage || 'The brand has not issued your code. Check back soon — you will be notified.' }}</p>
              <button type="button" class="mt-2 text-sm font-medium text-brand-500 hover:underline" @click="loadMyCode">Check again</button>
            </template>
          </div>

          <!-- Phase 1: Submit video with code (C3) -->
          <div v-if="myCode" class="mt-4 rounded-xl border border-border p-4 dark:border-gray-800">
            <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Submit video</p>
            <form class="flex flex-col gap-2" @submit.prevent="submitMyVideo">
              <input v-model="myVideoForm.url" type="url" :required="!myVideoForm.reserve" placeholder="https://youtube.com/shorts/... or /watch?v=..." class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input v-model="myVideoForm.reserve" type="checkbox" />
                Belum upload — reserve code dulu
              </label>
              <p v-if="myVideoError" class="text-sm text-error-600 dark:text-error-500">{{ myVideoError }}</p>
              <button type="submit" :disabled="submittingMyVideo" class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900">
                {{ submittingMyVideo ? 'Submitting…' : (myVideoForm.reserve ? 'Reserve my code' : 'Submit video') }}
              </button>
            </form>
          </div>

          <!-- Phase 1: My submissions (C4) -->
          <div v-if="myVideos.length > 0" class="mt-4 rounded-xl border border-border p-4 dark:border-gray-800">
            <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">My submissions</p>
            <div class="flex flex-col gap-2">
              <div v-for="v in myVideos" :key="v.id" class="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5">
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-800 dark:text-white/90">{{ v.title || v.video_url || 'Awaiting upload' }}</p>
                  <p class="text-xs text-gray-400"><StatusBadge :status="v.status" /> · code {{ v.campaign_code_used }}</p>
                  <div v-if="attachingMyId === v.id" class="mt-2 flex items-center gap-2">
                    <input v-model="myVideoForm.url" type="url" required placeholder="Paste video URL…" class="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    <button type="button" :disabled="submittingMyVideo || !myVideoForm.url" class="h-8 shrink-0 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50" @click="attachMyUpload(v.id)">
                      Attach
                    </button>
                  </div>
                </div>
                <button v-if="v.status === 'pending_upload' && attachingMyId !== v.id" type="button" class="shrink-0 text-xs font-medium text-brand-500 hover:underline" @click="attachingMyId = v.id; myVideoForm.url = ''">
                  Attach link
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetricValue label="Investment mix" :value="mockCampaign!.investment_mix" />
            <MetricValue label="Target ROI" :value="mockCampaign!.target_roi ? `${mockCampaign!.target_roi}x` : '—'" />
            <MetricValue label="Closes" :value="mockCampaign!.end_date ?? '—'" />
          </div>

          <div v-if="mockCampaign!.brief?.summary" class="mt-6">
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ mockCampaign!.brief.summary }}</p>
          </div>

          <div v-if="mockCampaign!.brief?.highlights?.length" class="mt-6">
            <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Highlights</p>
            <ul class="list-inside list-disc text-sm text-gray-600 dark:text-gray-300">
              <li v-for="h in mockCampaign!.brief.highlights" :key="h">{{ h }}</li>
            </ul>
          </div>

          <div v-if="creatorProducts.length" class="mt-6">
            <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Products</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="p in creatorProducts" :key="p.id" class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">{{ p.name }}</span>
            </div>
          </div>

          <div v-if="mockCampaign!.brief?.requirements?.length" class="mt-6">
            <p class="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Requirements</p>
            <ul class="list-inside list-disc text-sm text-gray-600 dark:text-gray-300">
              <li v-for="r in mockCampaign!.brief.requirements" :key="r">{{ r }}</li>
            </ul>
          </div>

          <div v-if="mockCampaign!.brief?.payout_model" class="mt-6">
            <p class="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">Payout model</p>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ mockCampaign!.brief.payout_model }}</p>
          </div>

          <button
            type="button"
            :disabled="isPreviewing"
            class="mt-6 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900"
            @click="isApplyOpen = true"
          >
            Request to Join
          </button>
        </div>
      </div>
    </template>

    <!-- Apply flow: modal, not a route (release-plan-09 §7.3; field set per doc10 §8) -->
    <Modal :is-open="isApplyOpen" title="Request to Join" size="lg" @close="isApplyOpen = false">
      <form v-if="!applySubmitted" id="creator-apply-form" class="space-y-4" @submit.prevent="submitApplication">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Your name / talent name *</label>
          <input v-model="applyForm.name" type="text" required placeholder="e.g. Salsa Food Diary" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube channel URL *</label>
          <input v-model="applyForm.channelUrl" type="url" required placeholder="https://youtube.com/@yourchannel" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          <p class="mt-1 text-xs text-gray-400">System will analyse this channel after the brand approves.</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Handle</label>
            <input v-model="applyForm.handle" type="text" placeholder="@yourchannel" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
            <input v-model="applyForm.whatsapp" type="text" placeholder="+62 …" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input v-model="applyForm.email" type="email" placeholder="collab@email.com" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        </div>

        <fieldset>
          <legend class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Compensation preference</legend>
          <div class="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
            <label class="flex items-center gap-2">
              <input v-model="applyForm.compensation" type="radio" value="rate_card" />
              <span><strong class="text-gray-800 dark:text-white/90">Rate card</strong> — set Shorts &amp; longform rates</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="applyForm.compensation" type="radio" value="sample_only" />
              <span><strong class="text-gray-800 dark:text-white/90">Free / sample only</strong> — product sample, no paid rate yet</span>
            </label>
          </div>
        </fieldset>

        <div v-if="applyForm.compensation === 'rate_card'" class="mb-3">
          <label for="offer-currency" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Offer currency</label>
          <select id="offer-currency" v-model="applyForm.rateCurrency" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <option value="USD">USD</option><option value="IDR">IDR</option>
          </select>
        </div>
        <div v-if="applyForm.compensation === 'rate_card'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Shorts rate</label>
            <input v-model.number="applyForm.rateShorts" type="number" min="0" placeholder="e.g. 3000000" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Longform rate</label>
            <input v-model.number="applyForm.rateLongform" type="number" min="0" placeholder="e.g. 10000000" class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Message to brand (optional)</label>
          <textarea v-model="applyForm.message" rows="3" placeholder="Short pitch, content format, etc." class="w-full resize-none rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        </div>

        <p class="text-xs text-gray-400">
          After submit: status <strong>Pending brand approval</strong>. Once approved, you'll be notified and can run eligibility analysis.
        </p>
        <p v-if="applyError" class="text-sm text-error-600 dark:text-error-500">{{ applyError }}</p>
      </form>
      <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
        <p class="text-sm font-medium text-gray-800 dark:text-white/90">Application submitted</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Status: Pending brand approval. Track it from "My Applications".</p>
      </div>
      <template #footer>
        <template v-if="!applySubmitted">
          <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200" @click="isApplyOpen = false">
            Cancel
          </button>
          <button type="submit" form="creator-apply-form" :disabled="applySubmitting" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
            {{ applySubmitting ? 'Submitting…' : 'Submit application' }}
          </button>
        </template>
        <button v-else type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" @click="isApplyOpen = false">
          Close
        </button>
      </template>
    </Modal>

    <input ref="commerceFileInput" type="file" accept=".csv" class="hidden" @change="onCommerceFileSelected" />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import StatusBadge from '~/components/common/StatusBadge.vue'
import MetricValue from '~/components/common/MetricValue.vue'
import Tabs from '~/components/common/Tabs.vue'
import Modal from '~/components/ui/Modal.vue'
import PlaceholderSection from '~/components/youtubeBrandCampaign/PlaceholderSection.vue'
import PackageCostEstimator from '~/components/youtubeBrandCampaign/PackageCostEstimator.vue'
import InfoTooltip from '~/components/youtubeBrandCampaign/InfoTooltip.vue'
import NotificationBell from '~/components/youtubeBrandCampaign/NotificationBell.vue'
import CampaignActivityTimeline from '~/components/campaigns/CampaignActivityTimeline.vue'
import { useEffectiveRole } from '~/composables/youtubeBrandCampaign/useEffectiveRole'
import {
  useCampaignsApi, type CampaignRecord, type CampaignProductRecord, type RosterRecord, type ForecastRecord, type VideoRecord,
  type MonitoringSummary, type MonitoringInsightRecord, type CommerceImportRecord, type CreatorCampaignRecord,
  type CodeIssuanceRecord, type MyCodeRecord,
} from '~/composables/youtubeBrandCampaign/useCampaignsApi'
import { useCreatorDiscovery, type CreatorProfile } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'
import { useApplications } from '~/composables/youtubeBrandCampaign/useApplications'
import { formatCurrency, formatCompactNumber } from '~/utils/youtubeBrandCampaignFormat'
import { computeForecast, DEFAULT_ASSUMPTIONS, type InvestmentMix } from '~/utils/youtubeBrandCampaignForecast'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { isAgency, isPreviewing } = useEffectiveRole()

// ── Agency-role branch: real API — release-plan-20260911-...-r2-campaign-core-v1.md §5/§6 ──
const campaignsApi = useCampaignsApi()
const creatorDiscovery = useCreatorDiscovery()

// ── Creator-role branch: real API, creator-role response variant of the same
// endpoint (R3) — see `CreatorCampaignRecord` in useCampaignsApi.ts. ────────
const mockCampaign = ref<CreatorCampaignRecord | null>(null)
const creatorProducts = ref<CampaignProductRecord[]>([])
const creatorCampaignLoading = ref(false)

async function loadCreatorCampaign() {
  creatorCampaignLoading.value = true
  try {
    const id = route.params.id as string
    const [campaignRes, productsRes] = await Promise.all([
      campaignsApi.getForCreator(id),
      campaignsApi.listProducts(id),
    ])
    mockCampaign.value = campaignRes
    creatorProducts.value = productsRes
    await Promise.all([loadMyCode(), loadMyVideos()])
  } catch {
    mockCampaign.value = null
  } finally {
    creatorCampaignLoading.value = false
  }
}

// ── Creator upload-code flow, Phase 1 (§4.3.3 C2–C4) ─────────────────────────
const myCode = ref<MyCodeRecord | null>(null)
const myCodeLoading = ref(false)
const myCodeMessage = ref<string | null>(null)
const myVideos = ref<VideoRecord[]>([])
const myVideoForm = ref({ url: '', reserve: false })
const myVideoError = ref<string | null>(null)
const submittingMyVideo = ref(false)
const attachingMyId = ref<string | null>(null)

async function loadMyCode() {
  const id = route.params.id as string
  myCodeLoading.value = true
  myCodeMessage.value = null
  try {
    myCode.value = await campaignsApi.myCode(id)
  } catch (e: any) {
    myCode.value = null
    myCodeMessage.value = e?.response?.data?.detail || null
  } finally {
    myCodeLoading.value = false
  }
}
async function loadMyVideos() {
  const id = route.params.id as string
  try {
    myVideos.value = await campaignsApi.listMyVideos(id)
  } catch {
    myVideos.value = []
  }
}
async function submitMyVideo() {
  if (isPreviewing.value) return
  const id = route.params.id as string
  submittingMyVideo.value = true
  myVideoError.value = null
  try {
    const created = myVideoForm.value.reserve
      ? await campaignsApi.createMyIntent(id)
      : await campaignsApi.submitMyVideo(id, { video_url: myVideoForm.value.url })
    myVideos.value.unshift(created)
    myVideoForm.value = { url: '', reserve: false }
  } catch (e: any) {
    myVideoError.value = e?.response?.data?.detail || 'Failed to submit video'
  } finally {
    submittingMyVideo.value = false
  }
}
async function attachMyUpload(videoId: string) {
  if (isPreviewing.value) return
  const id = route.params.id as string
  if (!myVideoForm.value.url) return
  submittingMyVideo.value = true
  myVideoError.value = null
  try {
    const updated = await campaignsApi.attachMyUpload(id, videoId, myVideoForm.value.url)
    const idx = myVideos.value.findIndex((v) => v.id === videoId)
    if (idx >= 0) myVideos.value[idx] = updated
    attachingMyId.value = null
    myVideoForm.value.url = ''
  } catch (e: any) {
    myVideoError.value = e?.response?.data?.detail || 'Failed to attach video URL'
  } finally {
    submittingMyVideo.value = false
  }
}

const agencyCampaign = ref<CampaignRecord | null>(null)
const agencyLoading = ref(true)
const products = ref<CampaignProductRecord[]>([])
const roster = ref<RosterRecord[]>([])
const forecast = ref<ForecastRecord | null>(null)
const creatorProfilesMap = ref<Record<string, CreatorProfile>>({})
const actionError = ref<string | null>(null)

function creatorName(profileId: string): string {
  return roster.value.find((r) => r.creator_profile_id === profileId)?.creator_name
    || creatorProfilesMap.value[profileId]?.title
    || creatorProfilesMap.value[profileId]?.channel_id
    || 'Creator'
}

function creatorViews(profileId: string): number {
  return creatorProfilesMap.value[profileId]?.performance_summary?.avg_views_per_video ?? 0
}

function creatorEngagement(profileId: string): number {
  return creatorProfilesMap.value[profileId]?.performance_summary?.engagement_rate ?? 0
}

// ── Live forecast (mirrors the server engine; the server stays authoritative on save) ──
const assumptions = DEFAULT_ASSUMPTIONS

const rosterPackageTotal = computed(() => roster.value.reduce((sum, r) => sum + (r.planned_cost || 0), 0))

const plannedSpend = computed(() => (agencyCampaign.value?.creator_budget ?? 0) + (agencyCampaign.value?.ads_budget ?? 0))

const remainingBudget = computed(() => (agencyCampaign.value?.total_budget ?? 0) - plannedSpend.value)

const budgetUsedPct = computed(() => {
  const total = agencyCampaign.value?.total_budget ?? 0
  if (!total) return 0
  return Math.round((plannedSpend.value / total) * 100)
})

const organicSharePct = computed(() => {
  const total = agencyCampaign.value?.total_budget ?? 0
  if (!total) return 0
  return Math.min(100, Math.round(((agencyCampaign.value?.creator_budget ?? 0) / total) * 100))
})

const paidSharePct = computed(() => {
  const total = agencyCampaign.value?.total_budget ?? 0
  if (!total) return 0
  return Math.min(100 - organicSharePct.value, Math.round(((agencyCampaign.value?.ads_budget ?? 0) / total) * 100))
})

const liveForecast = computed(() =>
  computeForecast({
    investmentMix: (agencyCampaign.value?.investment_mix ?? 'creator') as InvestmentMix,
    adsSpend: agencyCampaign.value?.ads_budget ?? 0,
    roster: roster.value.map((r) => ({
      creator_profile_id: r.creator_profile_id,
      avg_views_per_video: creatorViews(r.creator_profile_id),
      engagement_rate: creatorEngagement(r.creator_profile_id),
    })),
  }),
)

function flatRateCard(cc: RosterRecord) {
  const rc = cc.rate_card_snapshot
  return {
    shorts_min: rc?.shorts?.min ?? 0,
    shorts_max: rc?.shorts?.max ?? rc?.shorts?.min ?? 0,
    longform_min: rc?.longform?.min ?? 0,
    longform_max: rc?.longform?.max ?? rc?.longform?.min ?? 0,
  }
}

async function loadAgencyWorkspace() {
  agencyLoading.value = true
  actionError.value = null
  try {
    const id = route.params.id as string
    const [campaignRes, productsRes, rosterRes, forecastRes] = await Promise.all([
      campaignsApi.get(id),
      campaignsApi.listProducts(id),
      campaignsApi.listRoster(id),
      campaignsApi.getForecast(id).catch(() => null),
    ])
    agencyCampaign.value = campaignRes
    products.value = productsRes
    roster.value = rosterRes
    forecast.value = forecastRes

    const uniqueIds = [...new Set(rosterRes.map((r) => r.creator_profile_id))]
    const profiles = await Promise.all(uniqueIds.map((pid) => creatorDiscovery.get(pid).catch(() => null)))
    const map: Record<string, CreatorProfile> = {}
    profiles.forEach((p, i) => { if (p) map[uniqueIds[i]] = p })
    creatorProfilesMap.value = map
    await refreshIssuances()
  } catch (e: any) {
    agencyCampaign.value = null
  } finally {
    agencyLoading.value = false
  }
}

onMounted(() => { if (isAgency.value) loadAgencyWorkspace(); else loadCreatorCampaign() })

const breadcrumbItems = computed(() => [
  { label: 'YouTube Brand Campaign', to: '/app/youtube-brand-campaign/campaigns' },
  { label: 'Campaigns', to: '/app/youtube-brand-campaign/campaigns' },
  { label: (isAgency.value ? agencyCampaign.value?.name : mockCampaign.value?.name) ?? 'Campaign' },
])

// Tabs are query-param routed (?tab=) so each is deep-linkable — release-plan-09 §5.3.
const activeTab = ref((route.query.tab as string) || 'overview')
watch(activeTab, (tab) => {
  if (route.query.tab === tab) return
  router.replace({ query: { ...route.query, tab } })
})
watch(
  () => route.query.tab,
  (tab) => {
    const next = (tab as string) || 'overview'
    if (activeTab.value !== next) activeTab.value = next
  },
)

// Running (R4) appears once the campaign is open/active, per
// release-plan-20260912-...-r4-r5-running-monitoring.md §3.4 and
// release-plan-09 §5.3's "hidden pre-launch rather than shown-empty" rule.
// Monitoring (R5) is not built here yet.
const showRunningTab = computed(() => !!agencyCampaign.value && ['open', 'active', 'paused', 'completed'].includes(agencyCampaign.value.status))

// Monitoring (R5) appears once open/active/paused/completed AND at least one
// tracked video exists — same "hidden pre-launch rather than shown-empty" rule.
const showMonitoringTab = computed(() =>
  !!agencyCampaign.value
  && ['open', 'active', 'paused', 'completed'].includes(agencyCampaign.value.status)
  && agencyCampaign.value.tracked_video_count > 0,
)

const visibleTabs = computed(() => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'roster', label: 'Roster' },
  ]
  if (showRunningTab.value) tabs.push({ id: 'running', label: 'Running' })
  if (showMonitoringTab.value) tabs.push({ id: 'monitoring', label: 'Monitoring' })
  tabs.push({ id: 'activity', label: 'Activity' })
  return tabs
})

const timelineRef = ref<InstanceType<typeof CampaignActivityTimeline> | null>(null)
function reloadActivity() {
  timelineRef.value?.reload()
}

// ── Investment mix / target ROI ─────────────────────────────────────────────
async function setInvestmentMix(mix: 'hybrid' | 'creator' | 'ads') {
  if (isPreviewing.value) return
  if (!agencyCampaign.value || agencyCampaign.value.status !== 'draft') return
  actionError.value = null
  try {
    agencyCampaign.value = await campaignsApi.update(agencyCampaign.value.id, { investment_mix: mix })
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to update investment mix'
  }
}

async function setTargetRoi(value: number) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  actionError.value = null
  try {
    agencyCampaign.value = await campaignsApi.update(agencyCampaign.value.id, { target_roi: value })
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to update target ROI'
  }
}

// ── Products ─────────────────────────────────────────────────────────────────
const isAddProductOpen = ref(false)
const productForm = ref({ sku: '', name: '', price: 0 })
async function submitProduct() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    const p = await campaignsApi.addProduct(agencyCampaign.value.id, {
      name: productForm.value.name,
      sku: productForm.value.sku || undefined,
      price: productForm.value.price || undefined,
    })
    products.value.push(p)
    productForm.value = { sku: '', name: '', price: 0 }
    isAddProductOpen.value = false
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to add product'
  }
}
async function doRemoveProduct(productId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    await campaignsApi.removeProduct(agencyCampaign.value.id, productId)
    products.value = products.value.filter((p) => p.id !== productId)
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to remove product'
  }
}

// ── Roster: "+ Add Creators" reuses the Creator Discovery list, filtered to not-yet-added (§5.3) ──
const isAddCreatorOpen = ref(false)
const addCreatorLoading = ref(false)
const availableCreators = ref<CreatorProfile[]>([])
async function openAddCreators() {
  isAddCreatorOpen.value = true
  addCreatorLoading.value = true
  try {
    const res = await creatorDiscovery.list({ page: 1 })
    const onRoster = new Set(roster.value.map((r) => r.creator_profile_id))
    availableCreators.value = res.items.filter((c) => !onRoster.has(c.id))
  } finally {
    addCreatorLoading.value = false
  }
}
async function doAddCreator(profileId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  actionError.value = null
  try {
    const added = await campaignsApi.addCreators(agencyCampaign.value.id, [profileId])
    roster.value.push(...added)
    availableCreators.value = availableCreators.value.filter((c) => c.id !== profileId)
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
    isAddCreatorOpen.value = false
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to add creator'
  }
}
async function doRemoveCreator(rosterId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  actionError.value = null
  try {
    await campaignsApi.removeCreator(agencyCampaign.value.id, rosterId)
    roster.value = roster.value.filter((r) => r.id !== rosterId)
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to remove creator'
  }
}
async function doUpdatePackage(rosterId: string, pkg: { shorts: number; longform: number }) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    const updated = await campaignsApi.updateRosterPackage(agencyCampaign.value.id, rosterId, pkg)
    const idx = roster.value.findIndex((r) => r.id === rosterId)
    if (idx >= 0) roster.value[idx] = updated
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to update package'
  }
}

// ── Running Campaign: posted videos (R4) ────────────────────────────────────
const videos = ref<VideoRecord[]>([])
const videosLoading = ref(false)
const registeringVideo = ref(false)
const verifyingId = ref<string | null>(null)
const videoForm = ref<{ mode: 'by-code' | 'by-link'; code: string; url: string; campaignCreatorId: string; format: 'shorts' | 'longform'; hasProductTag: boolean }>({
  mode: 'by-code', code: '', url: '', campaignCreatorId: '', format: 'shorts', hasProductTag: true,
})
const codeResolveMessage = ref<string | null>(null)
const codeResolveOk = ref(false)
const attachingId = ref<string | null>(null)
const attachingBusy = ref(false)
const attachForm = ref({ url: '' })

function creatorNameForRosterId(rosterId: string): string {
  const cc = roster.value.find((r) => r.id === rosterId)
  return cc ? creatorName(cc.creator_profile_id) : 'Creator'
}

async function loadVideos() {
  if (!agencyCampaign.value) return
  videosLoading.value = true
  try {
    videos.value = await campaignsApi.listVideos(agencyCampaign.value.id)
  } finally {
    videosLoading.value = false
  }
}

watch(showRunningTab, (visible) => {
  if (visible && videos.value.length === 0) loadVideos()
})

async function resolveRegisterCode() {
  codeResolveMessage.value = null
  codeResolveOk.value = false
  if (!agencyCampaign.value || !videoForm.value.code.trim()) return
  try {
    const res = await campaignsApi.resolveCode(agencyCampaign.value.id, videoForm.value.code.trim())
    codeResolveOk.value = true
    codeResolveMessage.value = `Code for “${res.campaign_name}” · ${res.live_issuances} creator(s) with live codes`
  } catch (e: any) {
    codeResolveMessage.value = e?.response?.data?.detail || 'Unknown campaign code for this campaign'
  }
}

async function submitVideo() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  if (videoForm.value.mode === 'by-link' && !videoForm.value.campaignCreatorId) return
  registeringVideo.value = true
  actionError.value = null
  try {
    const created = videoForm.value.mode === 'by-code'
      ? await campaignsApi.registerVideoByCode({
        campaign_code: videoForm.value.code.trim(),
        video_url: videoForm.value.url,
        campaign_creator_id: videoForm.value.campaignCreatorId || undefined,
        format: videoForm.value.format,
        has_product_tag: videoForm.value.hasProductTag,
      })
      : await campaignsApi.registerVideo(agencyCampaign.value.id, {
        video_url: videoForm.value.url,
        campaign_creator_id: videoForm.value.campaignCreatorId,
        format: videoForm.value.format,
        has_product_tag: videoForm.value.hasProductTag,
      })
    videos.value.unshift(created)
    videoForm.value.url = ''
    videoForm.value.code = ''
    codeResolveMessage.value = null
    await refreshIssuances()
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to register video'
  } finally {
    registeringVideo.value = false
  }
}

async function doAttachUpload(videoId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value || !attachForm.value.url) return
  attachingBusy.value = true
  actionError.value = null
  try {
    const updated = await campaignsApi.attachUpload(agencyCampaign.value.id, videoId, attachForm.value.url)
    const idx = videos.value.findIndex((v) => v.id === videoId)
    if (idx >= 0) videos.value[idx] = updated
    attachingId.value = null
    attachForm.value.url = ''
    await refreshIssuances()
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to attach video URL'
  } finally {
    attachingBusy.value = false
  }
}

async function doVerifyVideo(videoId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  verifyingId.value = videoId
  actionError.value = null
  try {
    const updated = await campaignsApi.verifyVideo(agencyCampaign.value.id, videoId)
    const idx = videos.value.findIndex((v) => v.id === videoId)
    if (idx >= 0) videos.value[idx] = updated
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to verify video'
  } finally {
    verifyingId.value = null
  }
}

async function doRejectVideo(videoId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  actionError.value = null
  try {
    const updated = await campaignsApi.rejectVideo(agencyCampaign.value.id, videoId)
    const idx = videos.value.findIndex((v) => v.id === videoId)
    if (idx >= 0) videos.value[idx] = updated
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to reject video'
  }
}

// ── Campaign codes, Phase 1 (§4.3.2) ─────────────────────────────────────────
const issuances = ref<CodeIssuanceRecord[]>([])
const codeCopied = ref(false)
const generatingCode = ref(false)
const regeneratingCode = ref(false)
const confirmingRegenerate = ref(false)

const canIssueCodes = computed(() => !!agencyCampaign.value?.campaign_code && ['open', 'active'].includes(agencyCampaign.value.status))
const issuanceForRoster = (rosterId: string): CodeIssuanceRecord | undefined =>
  issuances.value.find((i) => i.campaign_creator_id === rosterId && (i.status === 'issued' || i.status === 'consumed'))
const issuedCount = computed(() => issuances.value.filter((i) => ['issued', 'consumed'].includes(i.status)).length)
const consumedCount = computed(() => issuances.value.filter((i) => i.status === 'consumed').length)
const unissuedRosterCount = computed(() => roster.value.filter((r) => !issuanceForRoster(r.id)).length)

function issuanceChipLabel(rosterId: string): string {
  const i = issuanceForRoster(rosterId)
  if (!i) return 'No code'
  if (i.status === 'consumed') return 'Submitted'
  if (i.status === 'issued') return 'Issued'
  return 'Revoked'
}
function issuanceChipClass(rosterId: string): string {
  const i = issuanceForRoster(rosterId)
  if (!i || i.status === 'revoked') return 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
  if (i.status === 'consumed') return 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
  return 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  } catch {
    actionError.value = 'Copy failed — select the code manually'
  }
}

async function refreshIssuances() {
  if (!agencyCampaign.value || !agencyCampaign.value.campaign_code) { issuances.value = []; return }
  try {
    issuances.value = await campaignsApi.listIssuances(agencyCampaign.value.id)
  } catch {
    issuances.value = []
  }
}

function goToRoster() {
  activeTab.value = 'roster'
}

async function doEnsureCode() {
  if (isPreviewing.value || !agencyCampaign.value) return
  generatingCode.value = true
  actionError.value = null
  try {
    await campaignsApi.ensureCode(agencyCampaign.value.id)
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
    await refreshIssuances()
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to generate campaign code'
  } finally {
    generatingCode.value = false
  }
}

async function doRegenerateCode() {
  if (isPreviewing.value || !agencyCampaign.value) return
  regeneratingCode.value = true
  actionError.value = null
  try {
    await campaignsApi.regenerateCode(agencyCampaign.value.id)
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
    confirmingRegenerate.value = false
    await refreshIssuances()
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to regenerate campaign code'
  } finally {
    regeneratingCode.value = false
  }
}

// ── Issue code modal ──
const isIssueOpen = ref(false)
const issuingCode = ref(false)
const issueError = ref<string | null>(null)
const issueTarget = ref<RosterRecord | null>(null)
const issueForm = ref({ creatorName: '', channelUrl: '' })

function channelUrlForProfile(profileId: string): string {
  const p = creatorProfilesMap.value[profileId]
  return p?.custom_url || ''
}
function openIssueCode(cc: RosterRecord) {
  issueTarget.value = cc
  issueForm.value = { creatorName: creatorName(cc.creator_profile_id), channelUrl: channelUrlForProfile(cc.creator_profile_id) }
  issueError.value = null
  isIssueOpen.value = true
}
async function confirmIssueCode() {
  if (isPreviewing.value || !agencyCampaign.value || !issueTarget.value) return
  issuingCode.value = true
  issueError.value = null
  try {
    const created = await campaignsApi.issueCode(agencyCampaign.value.id, {
      creator_name: issueForm.value.creatorName.trim(),
      channel_url: issueForm.value.channelUrl.trim() || undefined,
    })
    const idx = issuances.value.findIndex((i) => i.id === created.id)
    if (idx >= 0) issuances.value[idx] = created
    else issuances.value.unshift(created)
    isIssueOpen.value = false
    reloadActivity()
  } catch (e: any) {
    issueError.value = e?.response?.data?.detail || 'Failed to issue code'
  } finally {
    issuingCode.value = false
  }
}
async function doRevokeIssuance(issuanceId: string) {
  if (isPreviewing.value || !agencyCampaign.value) return
  actionError.value = null
  try {
    const updated = await campaignsApi.revokeIssuance(agencyCampaign.value.id, issuanceId)
    const idx = issuances.value.findIndex((i) => i.id === issuanceId)
    if (idx >= 0) issuances.value[idx] = updated
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to revoke code'
  }
}
const bulkIssuing = ref(false)
async function doBulkIssue() {
  if (isPreviewing.value || !agencyCampaign.value) return
  bulkIssuing.value = true
  actionError.value = null
  let failed = 0
  try {
    for (const cc of roster.value) {
      if (issuanceForRoster(cc.id)) continue
      try {
        const created = await campaignsApi.issueCode(agencyCampaign.value.id, {
          creator_name: creatorName(cc.creator_profile_id),
          channel_url: channelUrlForProfile(cc.creator_profile_id) || undefined,
        })
        issuances.value.unshift(created)
      } catch { failed += 1 }
    }
    if (failed > 0) actionError.value = `${failed} creator(s) could not be issued a code — issue them individually`
    reloadActivity()
  } finally {
    bulkIssuing.value = false
  }
}

// ── Outreach message (ID default, per plan §4.3.2 B4) ──
const isOutreachOpen = ref(false)
const outreachText = ref('')
const outreachCopied = ref(false)
function openOutreach(cc: RosterRecord) {
  const c = agencyCampaign.value
  if (!c?.campaign_code) return
  outreachText.value =
    `Halo ${creatorName(cc.creator_profile_id)}! Kamu terpilih di campaign "${c.name}" (${c.brand_name}). ` +
    `Kode upload kamu: ${c.campaign_code} — Saat upload di YouTube Studio: 1) Paid promotion → Yes, ` +
    `2) Brand partnerships → Find your brand partner → pilih campaign / masukkan kode ${c.campaign_code}, ` +
    `3) tekan Share access. Lalu submit link videonya di Atlas Nexus → My Campaigns → ${c.name} → Submit video. Terima kasih!`
  outreachCopied.value = false
  isOutreachOpen.value = true
}
async function copyOutreach() {
  try {
    await navigator.clipboard.writeText(outreachText.value)
    outreachCopied.value = true
  } catch {
    actionError.value = 'Copy failed — select the message manually'
  }
}

// ── Monitoring & Reporting (R5) ──────────────────────────────────────────────
const monitoring = ref<MonitoringSummary | null>(null)
const monitoringLoading = ref(false)
const monitoringFunnel = ref<'combined' | 'organic' | 'paid'>('combined')
const monitoringInsight = ref<MonitoringInsightRecord | null>(null)
const commerceImports = ref<CommerceImportRecord[]>([])
const commerceFileInput = ref<HTMLInputElement | null>(null)

async function loadMonitoring() {
  if (!agencyCampaign.value) return
  monitoringLoading.value = true
  try {
    const [summaryRes, insightRes, importsRes] = await Promise.all([
      campaignsApi.getMonitoring(agencyCampaign.value.id, monitoringFunnel.value),
      campaignsApi.getMonitoringInsight(agencyCampaign.value.id, monitoringFunnel.value),
      campaignsApi.listCommerceImports(agencyCampaign.value.id),
    ])
    monitoring.value = summaryRes
    monitoringInsight.value = insightRes
    commerceImports.value = importsRes
  } finally {
    monitoringLoading.value = false
  }
}

watch(showMonitoringTab, (visible) => {
  if (visible && !monitoring.value) loadMonitoring()
})

async function setMonitoringFunnel(funnel: 'combined' | 'organic' | 'paid') {
  monitoringFunnel.value = funnel
  if (!agencyCampaign.value) return
  monitoringLoading.value = true
  try {
    monitoring.value = await campaignsApi.getMonitoring(agencyCampaign.value.id, funnel)
    monitoringInsight.value = await campaignsApi.getMonitoringInsight(agencyCampaign.value.id, funnel)
  } finally {
    monitoringLoading.value = false
  }
}

function openCommerceImport() {
  commerceFileInput.value?.click()
}

async function onCommerceFileSelected(event: Event) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  actionError.value = null
  try {
    const imported = await campaignsApi.uploadCommerceImport(agencyCampaign.value.id, file)
    commerceImports.value.unshift(imported)
    monitoring.value = await campaignsApi.getMonitoring(agencyCampaign.value.id, monitoringFunnel.value)
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to import commerce data'
  } finally {
    if (commerceFileInput.value) commerceFileInput.value.value = ''
  }
}

async function doRevertImport(importId: string) {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    const reverted = await campaignsApi.revertCommerceImport(agencyCampaign.value.id, importId)
    const idx = commerceImports.value.findIndex((i) => i.id === importId)
    if (idx >= 0) commerceImports.value[idx] = reverted
    monitoring.value = await campaignsApi.getMonitoring(agencyCampaign.value.id, monitoringFunnel.value)
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to revert import'
  }
}

async function doGenerateInsight() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    monitoringInsight.value = await campaignsApi.generateMonitoringInsight(agencyCampaign.value.id, monitoringFunnel.value)
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to generate insight'
  }
}

const refreshingStats = ref(false)
const refreshStatsMessage = ref<string | null>(null)

async function doRefreshStats() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  refreshingStats.value = true
  refreshStatsMessage.value = null
  actionError.value = null
  try {
    const run = await campaignsApi.refreshMonitoringStats(agencyCampaign.value.id)
    refreshStatsMessage.value = run.videos_total === 0
      ? 'No tracked videos to sync yet.'
      : `Synced ${run.videos_ok}/${run.videos_total} video(s).`
    monitoring.value = await campaignsApi.getMonitoring(agencyCampaign.value.id, monitoringFunnel.value)
  } catch (e: any) {
    if (e?.response?.status === 429) {
      refreshStatsMessage.value = e.response.data?.detail || 'Please wait before refreshing again.'
    } else {
      actionError.value = e?.response?.data?.detail || 'Failed to refresh stats'
    }
  } finally {
    refreshingStats.value = false
  }
}

// ── Forecast ─────────────────────────────────────────────────────────────────
const savingForecast = ref(false)
async function doSaveForecast() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  savingForecast.value = true
  actionError.value = null
  try {
    forecast.value = await campaignsApi.saveForecast(agencyCampaign.value.id)
    agencyCampaign.value = await campaignsApi.get(agencyCampaign.value.id)
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to save forecast'
  } finally {
    savingForecast.value = false
  }
}

// ── Lifecycle actions (doc 04 §1) ────────────────────────────────────────────
const launching = ref(false)
const isLaunchOpen = ref(false)
const launchTarget = ref<'active' | 'open'>('active')
const acknowledgeOverrun = ref(false)

function doLaunch() {
  acknowledgeOverrun.value = false
  launchTarget.value = 'active'
  actionError.value = null
  isLaunchOpen.value = true
}

async function confirmLaunch() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  launching.value = true
  actionError.value = null
  try {
    agencyCampaign.value = await campaignsApi.launch(agencyCampaign.value.id, launchTarget.value, acknowledgeOverrun.value)
    isLaunchOpen.value = false
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Launch failed'
  } finally {
    launching.value = false
  }
}
async function doPause() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    agencyCampaign.value = await campaignsApi.pause(agencyCampaign.value.id)
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to pause'
  }
}
async function doResume() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    agencyCampaign.value = await campaignsApi.resume(agencyCampaign.value.id)
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to resume'
  }
}
async function doComplete() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value) return
  try {
    agencyCampaign.value = await campaignsApi.complete(agencyCampaign.value.id)
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to mark complete'
  }
}
const isCancelOpen = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)

function doCancel() {
  cancelReason.value = ''
  actionError.value = null
  isCancelOpen.value = true
}

async function confirmCancel() {
  if (isPreviewing.value) return
  if (!agencyCampaign.value || !cancelReason.value.trim()) return
  cancelling.value = true
  try {
    agencyCampaign.value = await campaignsApi.cancel(agencyCampaign.value.id, cancelReason.value.trim())
    isCancelOpen.value = false
    reloadActivity()
  } catch (e: any) {
    actionError.value = e?.response?.data?.detail || 'Failed to cancel'
  } finally {
    cancelling.value = false
  }
}

// ── Creator-role apply flow (release-plan-09 §7.3; field set per doc10 §8) — real API (R3) ──
const { submit: submitApplicationToStore } = useApplications()
const isApplyOpen = ref(false)
const applySubmitted = ref(false)
const applySubmitting = ref(false)
const applyError = ref<string | null>(null)
const applyForm = ref({
  name: '',
  channelUrl: '',
  handle: '',
  whatsapp: '',
  email: '',
  compensation: 'rate_card' as 'rate_card' | 'sample_only',
  rateShorts: null as number | null,
  rateLongform: null as number | null,
  rateCurrency: 'USD',
  message: '',
})

watch(isApplyOpen, (open) => {
  if (open && mockCampaign.value?.currency) applyForm.value.rateCurrency = mockCampaign.value.currency
  if (!open) {
    applySubmitted.value = false
    applyForm.value = {
      name: '',
      channelUrl: '',
      handle: '',
      whatsapp: '',
      email: '',
      compensation: 'rate_card',
      rateShorts: null,
      rateLongform: null,
      rateCurrency: 'USD',
      message: '',
    }
  }
})

async function submitApplication() {
  if (!mockCampaign.value || isPreviewing.value) return
  applySubmitting.value = true
  applyError.value = null
  try {
    await submitApplicationToStore({
      campaign_id: mockCampaign.value.id,
      campaign_name: mockCampaign.value.name,
      creator_name: applyForm.value.name,
      creator_handle: applyForm.value.handle || applyForm.value.name,
      channel_url: applyForm.value.channelUrl,
      whatsapp: applyForm.value.whatsapp || null,
      email: applyForm.value.email || null,
      compensation_type: applyForm.value.compensation,
      rate_shorts: applyForm.value.compensation === 'rate_card' ? applyForm.value.rateShorts : null,
      rate_longform: applyForm.value.compensation === 'rate_card' ? applyForm.value.rateLongform : null,
      rate_currency: applyForm.value.compensation === 'rate_card' ? applyForm.value.rateCurrency : null,
      message: applyForm.value.message || null,
    })
    applySubmitted.value = true
  } catch (e: any) {
    applyError.value = e?.response?.data?.detail || 'Failed to submit application'
  } finally {
    applySubmitting.value = false
  }
}
</script>
