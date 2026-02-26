import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-900',
      secondary:
        'bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-800',
      outline:
        'border border-blue-500 text-blue-400 hover:bg-blue-500/10 disabled:border-slate-600',
      ghost:
        'text-slate-300 hover:text-white hover:bg-slate-800 disabled:text-slate-600',
      danger:
        'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-900',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          font-medium rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
