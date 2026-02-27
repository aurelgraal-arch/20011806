import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`
        bg-slate-800 border border-slate-700 rounded-lg p-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
