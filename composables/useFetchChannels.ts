import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { ChannelFetchListResponse, ChannelFetchResponse, ChannelSyncResponse } from '~/types/channel'

export function useFetchChannels() {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    const fetching = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)
    /** Secondary guidance from API (e.g. YouTube Content Owner user setup). */
    const errorHint = ref<string | null>(null)
    const fetchResult = ref<ChannelFetchListResponse | null>(null)

    const parseFetchDetail = (err: any): { message: string; hint: string | null } => {
        const raw = err?.data?.detail
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            const message =
                typeof raw.message === 'string'
                    ? raw.message
                    : 'Failed to fetch channels from YouTube'
            const hint = typeof raw.hint === 'string' ? raw.hint : null
            return { message, hint }
        }
        if (typeof raw === 'string') {
            return { message: raw, hint: null }
        }
        return { message: 'Failed to fetch channels from YouTube', hint: null }
    }

    const fetchChannelsFromYouTube = async (organizationId: string, contentOwnerId: string) => {
        fetching.value = true
        error.value = null
        errorHint.value = null
        fetchResult.value = null

        try {
            const response = await $fetch<ChannelFetchListResponse>(`${config.public.apiBaseUrl}/api/v1/organizations/${organizationId}/fetch-channels`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
                body: {
                    content_owner_id: contentOwnerId,
                },
            })

            fetchResult.value = response
            return response
        } catch (err: any) {
            console.error('Failed to fetch channels from YouTube:', err)
            const { message, hint } = parseFetchDetail(err)
            error.value = message
            errorHint.value = hint
            throw err
        } finally {
            fetching.value = false
        }
    }

    const saveFetchedChannels = async (mcnId: string, channels: ChannelFetchResponse[], contentOwnerId: string) => {
        saving.value = true
        error.value = null

        try {
            const response = await $fetch<ChannelSyncResponse>(`${config.public.apiBaseUrl}/api/v1/mcns/${mcnId}/sync-channels`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
                body: {
                    channels,
                    content_owner_id: contentOwnerId,
                },
            })

            return response
        } catch (err: any) {
            console.error('Failed to save fetched channels:', err)
            const message = err.data?.detail?.message || err.data?.detail || 'Failed to save channels'
            error.value = message
            throw err
        } finally {
            saving.value = false
        }
    }

    const resetState = () => {
        fetching.value = false
        saving.value = false
        error.value = null
        errorHint.value = null
        fetchResult.value = null
    }

    return {
        fetching,
        saving,
        error,
        errorHint,
        fetchResult,
        fetchChannelsFromYouTube,
        saveFetchedChannels,
        resetState,
    }
}
