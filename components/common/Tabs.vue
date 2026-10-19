<template>
  <div>
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-800">
      <nav class="-mb-px flex gap-6 overflow-x-auto custom-scrollbar" aria-label="Tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :id="`${instanceId}-tab-${tab.id}`"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`${instanceId}-panel-${tab.id}`"
          :tabindex="activeTab === tab.id ? 0 : -1"
          @click="updateActiveTab(tab.id)"
          @keydown="onTabKey($event, tab.id)"
          :class="[
            'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div :id="`${instanceId}-panel-${activeTab}`" role="tabpanel" :aria-labelledby="`${instanceId}-tab-${activeTab}`" tabindex="0" class="mt-6 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
      <slot :name="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, useId } from 'vue'

export interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

const props = defineProps<Props>()
const instanceId = `tabs-${useId()}`
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const updateActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

async function onTabKey(event: KeyboardEvent, id: string) {
  const index = props.tabs.findIndex((tab) => tab.id === id)
  let next = index
  if (event.key === 'ArrowRight') next = (index + 1) % props.tabs.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + props.tabs.length) % props.tabs.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = props.tabs.length - 1
  else return
  event.preventDefault()
  updateActiveTab(props.tabs[next].id)
  await nextTick()
  document.getElementById(`${instanceId}-tab-${activeTab.value}`)?.focus()
}
</script>

