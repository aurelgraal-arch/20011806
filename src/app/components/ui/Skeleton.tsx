/**
 * Loading Skeleton Component
 * Shows placeholder while content loads
 */

import React from 'react'

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'input'
  count?: number
  width?: string | number
  height?: string | number
  className?: string
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  count = 1,
  width = '100%',
  height = 'auto',
  className = '',
}) => {
  const widthStyle = typeof width === 'number' ? `${width}px` : width
  const heightStyle = typeof height === 'number' ? `${height}px` : height

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'rounded-lg h-40 mb-4'
      case 'avatar':
        return 'rounded-full h-10 w-10'
      case 'input':
        return 'rounded-lg h-10 mb-3'
      case 'text':
      default:
        return 'rounded h-4 mb-2'
    }
  }

  const baseClasses = `${getVariantClasses()} bg-slate-700 animate-shimmer ${className}`

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={baseClasses}
          style={{
            width: widthStyle,
            height: variant === 'text' ? heightStyle : undefined,
          }}
        />
      ))}
    </>
  )
}

export default Skeleton
