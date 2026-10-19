import { onMounted, onUnmounted, ref } from 'vue'

/** Resolve the shared CSS contract for chart libraries that need concrete colors. */
export function useChartTokens() {
  const tokens = ref({ accent: '#7250ce', border: '#e5e2ed', text: '#6c687c', font: 'Outfit, sans-serif', dark: false })
  let observer: MutationObserver | undefined
  onMounted(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement)
      tokens.value = {
        accent: style.getPropertyValue('--nx-action').trim() || '#7250ce',
        border: style.getPropertyValue('--border').trim() || '#e5e2ed',
        text: style.getPropertyValue('--nx-muted').trim() || '#6c687c',
        font: style.getPropertyValue('--atlas-font-ui').trim() || 'Outfit, sans-serif',
        dark: document.documentElement.classList.contains('dark'),
      }
    }
    update()
    observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
  })
  onUnmounted(() => observer?.disconnect())
  return tokens
}
