<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch, computed } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
const isInitialized = ref(false)

const isDarkMode = computed(() => theme.value === 'dark')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

if (process.client) {
  onMounted(() => {
    // Always use light mode as default
    theme.value = 'light'
    isInitialized.value = true
    document.documentElement.classList.remove('dark')
  })
}

provide('theme', {
  isDarkMode,
  toggleTheme,
  theme: computed(() => theme.value)
})
</script>

<script lang="ts">
import { inject } from 'vue'

export function useTheme() {
  const theme = inject('theme')
  if (!theme) {
    throw new Error('useTheme must be used within a component that has ThemeProvider as an ancestor')
  }
  return theme
}
</script>

