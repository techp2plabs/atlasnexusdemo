<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700"
      :class="props.compact ? 'p-0' : ''"
      @click.prevent="toggleDropdown"
      :aria-label="props.compact ? 'Open user menu' : undefined"
    >
      <span
        class="flex items-center justify-center overflow-hidden rounded-full bg-brand-500 text-white font-semibold text-sm"
        :class="props.compact ? 'h-9 w-9' : 'mr-3 h-11 w-11'"
      >
        {{ userInitials }}
      </span>

      <template v-if="!props.compact">
        <span class="mr-1 flex flex-col items-start text-left">
          <span class="font-semibold text-theme-sm text-gray-900">{{ user?.name || 'User' }}</span>
          <span class="text-theme-xs text-gray-500">{{ userRoleLabel }}</span>
        </span>
        <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
      </template>
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-lg shadow-gray-900/5"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm">
          {{ user?.name || 'User' }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500">
          {{ user?.email || '' }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-2 border-b border-gray-100">
        <li>
          <NuxtLink
            to="/app/account"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <SettingsIcon
              class="text-gray-500 group-hover:text-gray-700"
            />
            Account Setting
          </NuxtLink>
        </li>
      </ul>
      <div class="py-2 border-b border-gray-100">
        <span class="block px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Switch Prototype Role</span>
        <div class="flex flex-col gap-0.5 px-1">
          <button
            v-for="r in ['atlas_superadmin', 'org_owner', 'mcn_operator', 'creator']"
            :key="r"
            type="button"
            :class="['text-left px-2.5 py-1.5 text-xs rounded-md transition-colors', user?.role === r ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100']"
            @click="switchRole(r)"
          >
            {{ ROLE_LABELS[r] || r }}
          </button>
        </div>
      </div>
      <button
        @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-50 hover:text-gray-900 transition-colors w-full text-left"
      >
        <LogoutIcon
          class="text-gray-500 group-hover:text-gray-700"
        />
        Sign Out
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, LogoutIcon, SettingsIcon } from '~/components/icons'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

interface Props {
  compact?: boolean
}
const props = withDefaults(defineProps<Props>(), { compact: false })

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const ROLE_LABELS: Record<string, string> = {
  atlas_superadmin: 'Super Administrator',
  atlas_admin: 'Administrator',
  org_owner: 'Organization Owner',
  org_admin: 'Organization Admin',
  mcn_operator: 'MCN Operator',
  creator: 'Creator',
}

const userRoleLabel = computed(() => {
  const role = user.value?.role
  if (!role) return ''
  return ROLE_LABELS[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  
  const nameParts = user.value.name.trim().split(/\s+/)
  if (nameParts.length >= 2) {
    // First letter of first name + first letter of last name
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
  } else if (nameParts[0].length >= 2) {
    // First two letters if single word
    return nameParts[0].substring(0, 2).toUpperCase()
  } else {
    // Single letter
    return nameParts[0][0].toUpperCase()
  }
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const switchRole = (role: string) => {
  authStore.setRole(role)
  closeDropdown()
}

const signOut = () => {
  authStore.logout()
  router.push('/login')
  closeDropdown()
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

