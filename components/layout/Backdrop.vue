<template>
  <div
    v-if="isMobileOpen"
    class="fixed inset-0 bg-gray-900/50 z-[35] lg:hidden"
    @click="toggleMobileSidebar"
  ></div>
</template>

<script setup lang="ts">
const { toggleMobileSidebar, isMobileOpen } = useSidebar()
</script>

