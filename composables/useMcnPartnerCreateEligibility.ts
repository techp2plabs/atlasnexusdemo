import { computed, type ComputedRef } from 'vue'

/**
 * Same roles as "Add MCN Partner" on the MCN list page.
 * Use for org→MCN contract CTAs so RBAC stays aligned with MCN creation.
 */
export function useCanCreateMcnPartner(): ComputedRef<boolean> {
  const authStore = useAuthStore()
  return computed(() => {
    const role = authStore.user?.role
    return (
      role === 'atlas_superadmin' ||
      role === 'atlas_admin' ||
      role === 'org_owner' ||
      role === 'org_admin'
    )
  })
}
