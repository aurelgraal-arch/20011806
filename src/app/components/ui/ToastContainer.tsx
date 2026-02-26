/**
 * Toast Container Component
 * Displays toast notifications
 */

import React from 'react'
import type { Toast } from '../../hooks/useToast'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const getToastStyles = (type: Toast['type']) => {
  const baseStyles = 'px-4 py-3 rounded-lg text-white shadow-lg flex items-center justify-between'
  
  switch (type) {
    case 'success':
      return `${baseStyles} bg-green-600`
    case 'error':
      return `${baseStyles} bg-red-600`
    case 'warning':
      return `${baseStyles} bg-yellow-600`
    case 'info':
    default:
      return `${baseStyles} bg-blue-600`
  }
}

const getToastIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
    default:
      return 'ⓘ'
  }
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} animate-slide-in`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{getToastIcon(toast.type)}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-4 text-white hover:opacity-75 transition-opacity"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
