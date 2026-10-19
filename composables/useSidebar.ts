import { ref, computed, onMounted, onUnmounted, provide, inject } from 'vue'
import type { Ref } from 'vue'

interface SidebarContextType {
  isExpanded: Ref<boolean>
  isMobileOpen: Ref<boolean>
  isHovered: Ref<boolean>
  activeItem: Ref<string | null>
  openSubmenu: Ref<string | null>
  collapsedGroups: Ref<Record<string, boolean>>
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  setIsHovered: (isHovered: boolean) => void
  setActiveItem: (item: string | null) => void
  toggleSubmenu: (item: string) => void
  toggleGroup: (group: string) => void
  isGroupCollapsed: (group: string) => boolean
  expandGroup: (group: string) => void
}

const SidebarSymbol = Symbol()

export function useSidebarProvider() {
  const isExpanded = ref(true)
  const isMobileOpen = ref(false)
  const isMobile = ref(false)
  const isHovered = ref(false)
  const activeItem = ref<string | null>(null)
  const openSubmenu = ref<string | null>(null)
  const collapsedGroups = ref<Record<string, boolean>>({ 'ybc-submenu': true, 'ybc-prod-submenu': true })

  const handleResize = () => {
    if (process.client) {
      const mobile = window.innerWidth < 1024
      isMobile.value = mobile
      if (!mobile) {
        isMobileOpen.value = false
      }
    }
  }

  onMounted(() => {
    if (process.client) {
      handleResize()
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', handleResize)
    }
  })

  const toggleSidebar = () => {
    if (isMobile.value) {
      isMobileOpen.value = !isMobileOpen.value
    } else {
      isExpanded.value = !isExpanded.value
    }
  }

  const toggleMobileSidebar = () => {
    isMobileOpen.value = !isMobileOpen.value
  }

  const setIsHovered = (value: boolean) => {
    isHovered.value = value
  }

  const setActiveItem = (item: string | null) => {
    activeItem.value = item
  }

  const toggleSubmenu = (item: string) => {
    openSubmenu.value = openSubmenu.value === item ? null : item
  }

  const isGroupCollapsed = (group: string) => collapsedGroups.value[group] === true

  const toggleGroup = (group: string) => {
    collapsedGroups.value = {
      ...collapsedGroups.value,
      [group]: !isGroupCollapsed(group),
    }
  }

  const expandGroup = (group: string) => {
    if (collapsedGroups.value[group]) {
      collapsedGroups.value = { ...collapsedGroups.value, [group]: false }
    }
  }

  const context: SidebarContextType = {
    isExpanded: computed(() => (isMobile.value ? false : isExpanded.value)),
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    collapsedGroups,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
    toggleGroup,
    isGroupCollapsed,
    expandGroup,
  }

  provide(SidebarSymbol, context)

  return context
}

export function useSidebar(): SidebarContextType {
  const context = inject<SidebarContextType>(SidebarSymbol)
  if (!context) {
    throw new Error(
      'useSidebar must be used within a component that has SidebarProvider as an ancestor',
    )
  }
  return context
}
