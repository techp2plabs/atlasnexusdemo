export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.includes(authStore.user?.role || '')) {
    return navigateTo('/app/access-denied')
  }

  const requiresScope = to.meta.requiresScope as
    | 'organization'
    | 'mcn'
    | 'channel'
    | undefined
  if (requiresScope) {
    const { load, hasAnyScopeFor } = useEffectiveScope()
    await load()
    if (!hasAnyScopeFor(requiresScope)) {
      return navigateTo('/app/access-denied')
    }
  }
})

