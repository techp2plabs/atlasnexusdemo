<template>
  <div class="rounded-lg border border-border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="border-b border-border px-4 py-3 dark:border-gray-800">
      <div class="text-sm font-semibold text-foreground dark:text-white">Revenue splits</div>
      <div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
        Expand a row to see split cascade, contract references, and snapshot freshness lineage.
      </div>
      <div class="mt-1 text-xs text-gray-400 dark:text-gray-600">
        Gross reflects YouTube-reported earnings. Channel/MCN/Org/Platform splits are calculated
        by Atlas from your organization's contract configuration, not provided by YouTube.
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <tr>
            <th class="px-4 py-3 text-left">Channel</th>
            <th class="px-4 py-3 text-right">Gross</th>
            <th class="px-4 py-3 text-right">Channel</th>
            <th class="px-4 py-3 text-right">MCN</th>
            <th class="px-4 py-3 text-right">Org</th>
            <th class="px-4 py-3 text-right">Platform</th>
            <th class="px-4 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in rows" :key="row.youtube_channel_id">
            <tr class="border-t border-border dark:border-gray-800">
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/app/reports/channel/${row.youtube_channel_id}${month ? `?month=${month}` : ''}`"
                  class="font-medium text-accent-foreground hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {{ row.channel_title }}
                </NuxtLink>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ row.channel_youtube_id }}
                </div>
                <div v-if="row.freshness?.snapshot_calculated_at" class="text-[11px] text-indigo-600 dark:text-indigo-300">
                  snapshot freshness: {{ row.freshness.snapshot_calculated_at.slice(0, 19).replace('T', ' ') }}
                </div>
              </td>
              <td class="px-4 py-3 text-right">{{ formatUsd(row.split.gross_amount_usd) }}</td>
              <td class="px-4 py-3 text-right">
                {{ formatUsd(row.split.channel_amount_usd) }}
                <div class="text-[11px] text-gray-500 dark:text-gray-400">
                  {{ Number(row.split.channel_share_pct).toFixed(2) }}%
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                {{ formatUsd(row.split.mcn_amount_usd) }}
                <div class="text-[11px] text-gray-500 dark:text-gray-400">
                  {{ Number(row.split.mcn_share_pct).toFixed(2) }}%
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                {{ formatUsd(row.split.organization_amount_usd) }}
                <div class="text-[11px] text-gray-500 dark:text-gray-400">
                  {{ Number(row.split.organization_share_pct).toFixed(2) }}%
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                {{ formatUsd(row.split.platform_amount_usd) }}
                <div class="text-[11px] text-gray-500 dark:text-gray-400">
                  {{ Number(row.split.platform_share_pct).toFixed(2) }}%
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  @click="toggle(row.youtube_channel_id)"
                >
                  {{ expanded[row.youtube_channel_id] ? 'Hide' : 'Details' }}
                </button>
              </td>
            </tr>

            <tr v-if="expanded[row.youtube_channel_id]" class="border-t border-border dark:border-gray-800">
              <td colspan="7" class="px-4 py-4">
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div class="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <div class="font-semibold">Inputs (monthly totals)</div>
                    <div class="mt-2 grid grid-cols-2 gap-2">
                      <div>Ads</div><div class="text-right">{{ formatUsd(row.ads_usd) }}</div>
                      <div>Subscriptions</div><div class="text-right">{{ formatUsd(row.subscriptions_usd) }}</div>
                      <div>Shorts</div><div class="text-right">{{ formatUsd(row.shorts_usd) }}</div>
                      <div>Taxes (info)</div><div class="text-right">{{ formatUsd(row.taxes_withheld_usd) }}</div>
                    </div>
                    <div v-if="row.by_subtype && Object.keys(row.by_subtype).length" class="mt-3 border-t border-border pt-2 dark:border-gray-700">
                      <div class="font-semibold">By subtype</div>
                      <div
                        v-for="(amt, key) in row.by_subtype"
                        :key="key"
                        class="mt-1 grid grid-cols-2 gap-2"
                      >
                        <div class="font-mono text-[11px]">{{ key }}</div>
                        <div class="text-right">{{ formatUsd(Number(amt)) }}</div>
                      </div>
                    </div>
                    <div class="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                      Gross = Ads + Subscriptions + Shorts. Taxes are shown separately.
                    </div>
                  </div>

                  <div class="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <div class="font-semibold">Contracts used</div>
                    <div class="mt-2 space-y-1">
                      <div>
                        <span class="text-gray-500 dark:text-gray-400">MCN→Channel:</span>
                        <span class="ml-1">{{ row.split.channel_contract_number || row.split.channel_contract_id || '-' }}</span>
                        <span v-if="row.split.channel_contract_share_pct != null" class="ml-2 text-[11px] text-gray-500 dark:text-gray-400">
                          ({{ Number(row.split.channel_contract_share_pct).toFixed(2) }}%)
                        </span>
                      </div>
                      <div>
                        <span class="text-gray-500 dark:text-gray-400">Org→MCN:</span>
                        <span class="ml-1">{{ row.split.mcn_contract_number || row.split.mcn_contract_id || '-' }}</span>
                        <span v-if="row.split.mcn_contract_share_pct != null" class="ml-2 text-[11px] text-gray-500 dark:text-gray-400">
                          ({{ Number(row.split.mcn_contract_share_pct).toFixed(2) }}%)
                        </span>
                      </div>
                      <div>
                        <span class="text-gray-500 dark:text-gray-400">Platform→Org:</span>
                        <span class="ml-1">{{ row.split.organization_contract_number || row.split.organization_contract_id || '-' }}</span>
                        <span v-if="row.split.organization_contract_share_pct != null" class="ml-2 text-[11px] text-gray-500 dark:text-gray-400">
                          ({{ Number(row.split.organization_contract_share_pct).toFixed(2) }}%)
                        </span>
                      </div>
                    </div>
                    <div class="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                      Amounts are stored as monthly snapshots for auditability.
                    </div>
                    <div v-if="row.freshness?.last_fetch_request_id" class="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                      Last raw fetch request: {{ row.freshness.last_fetch_request_id }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!rows.length">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
              No revenue data for this month and filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { RevenueRow } from '~/composables/useReportsRevenue'

defineProps<{
  rows: RevenueRow[]
  month?: number | null
}>()

const expanded = reactive<Record<string, boolean>>({})

const toggle = (id: string) => {
  expanded[id] = !expanded[id]
}

const formatUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number.isFinite(n) ? n : 0,
  )
</script>

