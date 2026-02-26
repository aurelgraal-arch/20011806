import React from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  initials,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  }

  // Priority: src > initials > name initials > 'U'
  const displayInitials = 
    initials || 
    (name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')

  return (
    <div
      className={`
        flex items-center justify-center rounded-full bg-gradient-to-br
        from-blue-600 to-purple-600 flex-shrink-0 font-semibold text-white
        ${sizeClasses[size]} ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        displayInitials
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'
export default Avatar