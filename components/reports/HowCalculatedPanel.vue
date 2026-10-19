<template>
  <div
    class="rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-semibold text-foreground dark:text-white">
          How this is calculated
        </h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          For the selected month, <b>Gross</b> = <b>Ads + Subscriptions + Shorts</b>.
          Taxes are shown separately and not included in the split by default.
        </p>
      </div>
    </div>

    <div class="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">Channel</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">→</span>
        <span class="rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">MCN</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">→</span>
        <span class="rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">Organization</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">→</span>
        <span class="rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">Platform</span>
      </div>
      <p class="mt-2 text-xs text-gray-600 dark:text-gray-400">
        Each contract defines the % the receiving party keeps; the remainder cascades upward.
        Historical months come from stored snapshots, so later contract edits won’t change past reports.
      </p>
    </div>
  </div>
</template>

