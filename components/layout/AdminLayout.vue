<template>
  <div class="nexus-ui min-h-screen xl:flex">
    <AppSidebar />
    <Backdrop />
    <div
      :inert="isMobileOpen"
      class="min-w-0 flex-1 transition-[margin] duration-200 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:ml-[256px]' : 'lg:ml-[72px]']"
    >
      <AppHeader />
      <main class="nx-workspace w-full p-4 md:px-5 md:py-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import Backdrop from './Backdrop.vue'

const { isExpanded, isHovered, isMobileOpen } = useSidebar()
</script>

