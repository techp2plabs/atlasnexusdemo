import { useApi } from '~/composables/useApi'

export interface ContentOwnerIDValidationResult {
  isValid: boolean
  error?: string
  message?: string
  displayName?: string
}

export function useContentOwnerID() {
  const isValidating = ref(false)
  const { post } = useApi()

  /**
   * Validates Content Owner ID format
   * Basic format validation before API call
   */
  const validateContentOwnerIDFormat = (contentOwnerId: string): ContentOwnerIDValidationResult => {
    if (!contentOwnerId || !contentOwnerId.trim()) {
      return {
        isValid: false,
        error: 'Content Owner ID is required',
      }
    }

    const trimmed = contentOwnerId.trim()

    // Basic format checks
    // Content Owner IDs typically start with "contentOwner" and contain alphanumeric characters
    if (trimmed.length < 5) {
      return {
        isValid: false,
        error: 'Content Owner ID is too short',
      }
    }

    if (trimmed.length > 255) {
      return {
        isValid: false,
        error: 'Content Owner ID is too long',
      }
    }

    // Basic validation: should contain alphanumeric characters, hyphens, underscores
    const validPattern = /^[a-zA-Z0-9_-]+$/
    if (!validPattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Content Owner ID contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed.',
      }
    }

    return {
      isValid: true,
      message: 'Content Owner ID format is valid',
    }
  }

  /**
   * Test Content Owner ID connection by validating it against YouTube API
   * This makes an actual API call to YouTube to verify the Content Owner ID exists and is accessible
   */
  const testContentOwnerIDConnection = async (contentOwnerId: string): Promise<ContentOwnerIDValidationResult> => {
    isValidating.value = true

    try {
      // First, do basic format validation
      const formatValidation = validateContentOwnerIDFormat(contentOwnerId)
      if (!formatValidation.isValid) {
        return formatValidation
      }

      // Call backend API to test connection with YouTube
      const response = await post<{
        is_valid: boolean
        message: string
        content_owner_id: string
        display_name?: string
        error?: string
      }>('/api/v1/mcns/test-content-owner-id', {
        content_owner_id: contentOwnerId.trim()
      })

      const result = response.data

      if (result.is_valid) {
        let successMessage = result.message || 'Content Owner ID is valid and accessible'
        if (result.display_name) {
          successMessage = `✓ Valid connection to "${result.display_name}"`
        }
        
        return {
          isValid: true,
          message: successMessage,
          displayName: result.display_name
        }
      } else {
        return {
          isValid: false,
          error: result.error || result.message || 'Content Owner ID validation failed',
        }
      }
    } catch (error: any) {
      // Handle API errors
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Failed to validate Content Owner ID. Please try again.'
      
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
    validateContentOwnerIDFormat,
    testContentOwnerIDConnection,
  }
}

