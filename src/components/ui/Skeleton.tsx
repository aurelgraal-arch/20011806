import React from 'react'

interface SkeletonProps {
  variant?: 'card' | 'text' | 'circle'
  count?: number
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const variantStyles = {
    card: 'h-24 bg-slate-700 rounded-lg',
    text: 'h-4 bg-slate-700 rounded w-full mb-2',
    circle: 'h-12 w-12 bg-slate-700 rounded-full',
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse ${variantStyles[variant]} ${
            variant === 'text' && i === count - 1 ? 'mb-0' : ''
          }`}
        />
      ))}
    </div>
  )
}
