<template>
  <ThemeProvider>
    <SidebarProvider>
      <AdminLayout>
        <slot />
      </AdminLayout>
      <ToastContainer />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from '~/components/layout/ThemeProvider.vue'
import SidebarProvider from '~/components/layout/SidebarProvider.vue'
import AdminLayout from '~/components/layout/AdminLayout.vue'
import ToastContainer from '~/components/ui/ToastContainer.vue'
</script>
