import { useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

const toasts: Toast[] = []
const listeners: Set<(toasts: Toast[]) => void> = new Set()

export const useToast = () => {
  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString()
    const toast: Toast = { id, message, type, duration }
    
    toasts.push(toast)
    listeners.forEach(listener => listener([...toasts]))

    if (duration > 0) {
      setTimeout(() => {
        const index = toasts.findIndex(t => t.id === id)
        if (index > -1) {
          toasts.splice(index, 1)
          listeners.forEach(listener => listener([...toasts]))
        }
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      listeners.forEach(listener => listener([...toasts]))
    }
  }, [])

  return { addToast, removeToast }
}
