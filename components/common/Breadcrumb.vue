<template>
  <nav class="mb-6">
    <ol class="flex items-center gap-1.5">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center gap-1.5"
      >
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {{ item.label }}
          <svg
            class="stroke-current"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </NuxtLink>
        <span
          v-else
          :class="[
            'text-sm',
            index === items.length - 1
              ? 'text-gray-800 dark:text-white/90 font-medium'
              : 'text-gray-500 dark:text-gray-400',
          ]"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

