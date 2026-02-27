import React from 'react'

interface BadgeProps {
  label: string
  variant?: 'info' | 'success' | 'warning' | 'danger'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-blue-900 text-blue-200',
    success: 'bg-green-900 text-green-200',
    warning: 'bg-yellow-900 text-yellow-200',
    danger: 'bg-red-900 text-red-200',
  }

  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full text-sm font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </span>
  )
}
