import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  className = '',
}) => {
  const percentage = (value / max) * 100

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>}
      <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {value} / {max}
      </p>
    </div>
  )
}
