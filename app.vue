<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'

const demo = useDemoStore()
const session = useSessionStore()
onMounted(() => { demo.hydrate(); session.hydrate() })
</script>
