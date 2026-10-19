export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  // Invitation acceptance carries authority-bearing context and must remain reachable.
  if (to.path === '/auth/signup' && typeof to.query.token === 'string' && to.query.token) return
  if (authStore.isAuthenticated && authStore.user) {
    return navigateTo(resolveAuthDestination(authStore.user, to.query.returnTo as string | undefined))
  }
})
