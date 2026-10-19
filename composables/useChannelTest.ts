import { useApi } from '~/composables/useApi'

export interface ChannelTestResult {
  isValid: boolean
  error?: string
  message?: string
  channelId?: string
  title?: string
  subscriberCount?: number
  videoCount?: number
  viewCount?: number
  thumbnailUrl?: string
  customUrl?: string
  description?: string
  publishedAt?: string
}

export function useChannelTest() {
  const isValidating = ref(false)
  const { post } = useApi()

  /**
   * Extracts channel ID from YouTube URL or returns the ID if already extracted
   * Also handles username/handle format (@username)
   */
  const extractChannelId = (input: string): string | null => {
    if (!input || !input.trim()) {
      return null
    }

    const trimmed = input.trim()

    // If it's already a channel ID format (starts with UC, HC, etc.), return as is
    if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
      return trimmed
    }

    // Extract username/handle from @username format or youtube.com/@username URL
    const usernamePattern = /(?:^@|youtube\.com\/@|youtu\.be\/@)([a-zA-Z0-9_-]+)/
    const usernameMatch = trimmed.match(usernamePattern)
    if (usernameMatch && usernameMatch[1]) {
      // Return as-is with @ prefix, backend will resolve username to channel ID
      return `@${usernameMatch[1]}`
    }

    // Try to extract channel ID from various YouTube URL formats
    const urlPatterns = [
      /(?:youtube\.com\/channel\/|youtu\.be\/channel\/|studio\.youtube\.com\/channel\/)([a-zA-Z0-9_-]{22,})/,
      /(?:youtube\.com\/c\/|youtube\.com\/user\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/watch\?v=[\w-]+(?:&.*)?&channel=([a-zA-Z0-9_-]+))/,
    ]

    for (const pattern of urlPatterns) {
      const match = trimmed.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    // If no URL pattern matches, assume it's a channel ID or username
    return trimmed.length >= 2 && trimmed.length <= 255 ? trimmed : null
  }

  /**
   * Validates YouTube Channel ID format
   * Basic format validation before API call
   */
  const validateChannelIDFormat = (channelId: string): { isValid: boolean; error?: string; extractedId?: string } => {
    if (!channelId || !channelId.trim()) {
      return {
        isValid: false,
        error: 'YouTube Channel ID is required',
      }
    }

    // Extract channel ID from URL if needed
    const extracted = extractChannelId(channelId)
    if (!extracted) {
      return {
        isValid: false,
        error: 'Invalid YouTube Channel ID or URL format',
      }
    }

    // Basic format checks
    if (extracted.length < 2) {
      return {
        isValid: false,
        error: 'Channel ID is too short',
      }
    }

    if (extracted.length > 255) {
      return {
        isValid: false,
        error: 'Channel ID is too long',
      }
    }

    return {
      isValid: true,
      extractedId: extracted,
    }
  }

  /**
   * Test YouTube channel connection by validating channel ID and fetching data from YouTube API
   * This makes an actual API call to YouTube to verify the channel exists and key metrics can be fetched
   */
  const testChannelConnection = async (
    channelId: string,
    mcnId?: string | null
  ): Promise<ChannelTestResult> => {
    isValidating.value = true

    try {
      // First, do basic format validation and extract channel ID
      const formatValidation = validateChannelIDFormat(channelId)
      if (!formatValidation.isValid) {
        return {
          isValid: false,
          error: formatValidation.error,
        }
      }

      // Use extracted ID if available, otherwise use trimmed original
      const extractedChannelId = formatValidation.extractedId || channelId.trim()

      // Call backend API to test connection with YouTube
      const response = await post<{
        is_valid: boolean
        message: string
        channel_id: string
        title?: string
        subscriber_count?: number
        video_count?: number
        view_count?: number
        thumbnail_url?: string
        custom_url?: string
        description?: string
        published_at?: string
        error?: string
      }>('/api/v1/channels/test-channel', {
        channel_id: extractedChannelId,
        mcn_id: mcnId || null,
      })

      const result = response.data

      if (result.is_valid) {
        return {
          isValid: true,
          message: result.message || 'Channel is valid and accessible',
          channelId: result.channel_id, // Use the resolved channel ID from backend
          title: result.title,
          subscriberCount: result.subscriber_count,
          videoCount: result.video_count,
          viewCount: result.view_count,
          thumbnailUrl: result.thumbnail_url,
          customUrl: result.custom_url,
          description: result.description,
          publishedAt: result.published_at,
        }
      } else {
        return {
          isValid: false,
          error: result.error || result.message || 'Channel validation failed',
        }
      }
    } catch (error: any) {
      // Handle API errors
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        'Failed to validate channel. Please try again.'

      return {
        isValid: false,
        error: errorMessage,
      }
    } finally {
      isValidating.value = false
    }
  }

  return {
    isValidating,
    extractChannelId,
    validateChannelIDFormat,
    testChannelConnection,
  }
}

