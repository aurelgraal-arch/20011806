import React from 'react'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  removable?: boolean
  onRemove?: () => void
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
}) => {
  const variants = {
    default: 'bg-slate-700 text-slate-100',
    success: 'bg-green-900 text-green-200',
    warning: 'bg-yellow-900 text-yellow-200',
    danger: 'bg-red-900 text-red-200',
    info: 'bg-blue-900 text-blue-200',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variants[variant]} ${sizes[size]}
      `}
    >
      {label}
      {removable && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
          aria-label="Remove badge"
        >
          ×
        </button>
      )}
    </span>
  )
}

Badge.displayName = 'Badge'

export default Badge
