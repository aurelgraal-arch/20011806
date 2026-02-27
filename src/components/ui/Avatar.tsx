import React from 'react'

interface AvatarProps {
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'User', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`
        flex items-center justify-center rounded-full
        bg-gradient-to-br from-blue-500 to-purple-600
        text-white font-bold
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {initials}
    </div>
  )
}
