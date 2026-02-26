import React from 'react'

interface ProgressBarProps {
  progress: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'purple' | 'orange'
  showPercentage?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  size = 'md',
  color = 'blue',
  showPercentage = true,
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-2">
          {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-slate-400">{clampedProgress}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar
