import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Global state for toasts (singleton pattern)
const toasts = ref<Toast[]>([])

const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 5000
) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const toast: Toast = {
    id,
    type,
    message,
    duration
  }

  toasts.value.push(toast)

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

export const useToast = () => {
  const success = (message: string, duration?: number) => {
    return showToast(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return showToast(message, 'error', duration || 7000)
  }

  const info = (message: string, duration?: number) => {
    return showToast(message, 'info', duration)
  }

  const warning = (message: string, duration?: number) => {
    return showToast(message, 'warning', duration)
  }

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}

