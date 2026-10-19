import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export interface OAuthStatus {
  connected: boolean
  scopes: string[] | null
  connected_at: string | null
  status: string | null
}

export function useChannelOAuth() {
  const { get, delete: del } = useApi()

  const loading = ref(false)
  const disconnecting = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch the Google OAuth consent URL and redirect the browser there.
   * Uses a full page redirect (not a popup) to avoid popup blockers.
   */
  const initiateConnect = async (channelId: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<{ auth_url: string }>(`/api/v1/channels/${channelId}/oauth/authorize`)
      window.location.href = res.data.auth_url
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to start YouTube account connection'
    } finally {
      loading.value = false
    }
  }

  const disconnect = async (channelId: string): Promise<boolean> => {
    disconnecting.value = true
    error.value = null
    try {
      await del(`/api/v1/channels/${channelId}/oauth/disconnect`)
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to disconnect YouTube account'
      return false
    } finally {
      disconnecting.value = false
    }
  }

  const fetchOAuthStatus = async (channelId: string): Promise<OAuthStatus | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await get<OAuthStatus>(`/api/v1/channels/${channelId}/oauth/status`)
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || 'Failed to load YouTube connection status'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    disconnecting,
    error,
    initiateConnect,
    disconnect,
    fetchOAuthStatus,
  }
}
