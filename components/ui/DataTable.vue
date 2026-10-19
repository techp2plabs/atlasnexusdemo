<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <!-- Loading State -->
    <div v-if="loading" class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full text-[13px]">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-3 sm:px-6"
              :class="column.align === 'right' ? 'text-right' : 'text-left'"
            >
              <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </th>
            <th v-if="$slots.actions" class="px-5 py-3 text-left sm:px-6">
              <div class="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="i in 5"
            :key="i"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 sm:px-6"
              :class="column.align === 'right' ? 'text-right' : 'text-left'"
            >
              <div class="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </td>
            <td v-if="$slots.actions" class="px-5 py-4 sm:px-6">
              <div class="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!data || data.length === 0"
      class="flex flex-col items-center justify-center p-12"
    >
      <slot name="emptyState">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ emptyMessage || 'No data available' }}
        </p>
      </slot>
    </div>

    <!-- Table -->
    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full text-[13px]">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-3 sm:px-6"
              :class="column.align === 'right' ? 'text-right' : 'text-left'"
            >
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                {{ column.label }}
              </p>
            </th>
            <th v-if="$slots.actions" class="px-5 py-3 text-left sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Actions
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(row, rowIndex) in data"
            :key="rowKeyValue(row, rowIndex)"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 sm:px-6"
              :class="column.align === 'right' ? 'text-right' : 'text-left'"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :column="column"
              >
                <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                  {{ row[column.key] }}
                </p>
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-5 py-4 sm:px-6">
              <slot name="actions" :row="row" :index="rowIndex" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from './Skeleton.vue'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
}

interface Props {
  columns: TableColumn[]
  data: Record<string, any>[]
  loading?: boolean
  emptyMessage?: string
  rowKey?: string | ((row: Record<string, any>) => string | number)
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No data available',
  rowKey: 'id',
})
const rowKeyValue = (row: Record<string, any>, index: number) => typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey] ?? index
</script>

