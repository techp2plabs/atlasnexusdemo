import { inject } from 'vue'

export function useTheme() {
  const theme = inject('theme')
  if (!theme) {
    throw new Error('useTheme must be used within a component that has ThemeProvider as an ancestor')
  }
  return theme
}

