import type { InvitationDetails } from '~/types/invitationOnboarding'

export function useInvitationOnboarding() {
  const { get } = useApi()
  const invite = ref<InvitationDetails | null>(null)
  const loading = ref(false)
  const error = ref('')
  const load = async (token: string) => {
    loading.value = true
    error.value = ''
    try {
      const response = await get(`/api/v1/invites/${encodeURIComponent(token)}`)
      invite.value = response.data
    } catch (cause: any) {
      error.value = 'This invitation is unavailable or has expired. Ask the inviter to send a new link.'
    } finally { loading.value = false }
  }
  return { invite, loading, error, load }
}
