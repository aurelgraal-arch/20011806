import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-lg ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

Card.displayName = 'Card'

export default Card
