import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const AGENCY_ROLES = ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin']

/**
 * Resolves which branch of a role-scoped YouTube Brand Campaign page to
 * render from the real authenticated role.
 */
export function useEffectiveRole() {
  const authStore = useAuthStore()

  const realRole = computed(() => authStore.user?.role ?? null)
  const isAgency = computed(() => (realRole.value ? AGENCY_ROLES.includes(realRole.value) : false))

  // Existing page action guards remain inert after removing POV preview.
  const isPreviewing = computed(() => false)

  return { realRole, isAgency, isPreviewing }
}
