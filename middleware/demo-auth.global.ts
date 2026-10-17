import { useSessionStore } from '~/stores/session'
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/app')) return
  const session = useSessionStore()
  session.hydrate()
  if (!session.isAuthenticated) return navigateTo('/login')
})
