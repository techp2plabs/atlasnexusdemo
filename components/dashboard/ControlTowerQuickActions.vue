<template>
  <section class="nx-panel nx-fill">
    <div class="nx-panel-heading"><div><h2>Quick actions</h2><p>Manage access and grow your network</p></div></div>
    <div class="nx-action-list nx-quick-grid">
      <button type="button" class="nx-action-row" @click="emit('inviteOrganization')"><MailPlus :size="18" aria-hidden="true" /><span>Invite organization owner</span><Plus :size="14" aria-hidden="true" /></button>
      <button type="button" class="nx-action-row" @click="emit('createUser')"><UserPlus :size="18" aria-hidden="true" /><span>Create user</span><Plus :size="14" aria-hidden="true" /></button>
      <NuxtLink :to="pendingUsersLink" class="nx-action-row"><Users :size="18" aria-hidden="true" /><span>Review pending users</span><span v-if="pendingCount > 0" class="nx-badge nx-badge-warning">{{ pendingCount }}</span><ChevronRight v-else :size="14" aria-hidden="true" /></NuxtLink>
      <NuxtLink to="/app/mcns" class="nx-action-row"><Network :size="18" aria-hidden="true" /><span>Manage partner networks</span><ChevronRight :size="14" aria-hidden="true" /></NuxtLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import { Building2, ChevronRight, MailPlus, Network, Plus, UserPlus, Users } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ pendingCount?: number }>(), { pendingCount: 0 })
const emit = defineEmits<{ inviteOrganization: []; createUser: [] }>()
const pendingUsersLink = computed(() => props.pendingCount > 0 ? '/app/users?status=pending_verification' : '/app/users')
</script>
