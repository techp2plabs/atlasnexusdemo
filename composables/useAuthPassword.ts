import { useApi } from '~/composables/useApi'
import type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  PasswordMessageResponse,
} from '~/types/password'

export function useAuthPassword() {
  const { post } = useApi()

  const forgotPassword = async (payload: ForgotPasswordRequest) => {
    return await post<PasswordMessageResponse>('/api/v1/auth/forgot-password', payload)
  }

  const resetPassword = async (payload: ResetPasswordRequest) => {
    return await post<PasswordMessageResponse>('/api/v1/auth/reset-password', payload)
  }

  const updatePassword = async (payload: UpdatePasswordRequest) => {
    return await post<PasswordMessageResponse>('/api/v1/auth/update-password', payload)
  }

  const adminResetPassword = async (userId: string) => {
    return await post<PasswordMessageResponse>(`/api/v1/users/${userId}/reset-password`)
  }

  return {
    forgotPassword,
    resetPassword,
    updatePassword,
    adminResetPassword,
  }
}
