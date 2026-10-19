<template>
  <section class="nx-network-welcome">
    <div class="nx-welcome-copy">
      <span class="nx-welcome-kicker"><Network :size="16" aria-hidden="true" /> Grow your creator network</span>
      <h2>Manage, Analyze, and<br class="hidden sm:block" /> Scale Your YouTube Ecosystem</h2>
      <p>Manage your creator networks, channels, and partnerships in one place.</p>
      <Button type="button" variant="default" @click="emit('inviteOrganization')">Invite organization <ArrowRight :size="16" aria-hidden="true" /></Button>
    </div>
    <div class="nx-welcome-art" aria-hidden="true">
      <div class="nx-orbit nx-orbit-one" /><div class="nx-orbit nx-orbit-two" />
      <div class="nx-art-window"><Video :size="32" /><span /><span /><span /></div>
      <div class="nx-art-network"><Network :size="28" /><i /><i /><i /></div>
      <div class="nx-art-channel"><Users :size="24" /><div class="nx-art-avatars"><i /><i /><i /></div></div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ArrowRight, Network, Users, Video } from 'lucide-vue-next'
import { Button } from '~/components/shadcn/button'
const emit = defineEmits<{ inviteOrganization: [] }>()
</script>
