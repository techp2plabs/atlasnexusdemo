export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return navigateTo('/login')
  const result = await authStore.fetchMe()
  if (!result.success && result.authFailure) return navigateTo('/login')
  // A network failure leaves the cached identity intact; the destination API remains authoritative.
  if (authStore.user?.status !== 'active') return navigateTo('/auth/pending-approval')
})
