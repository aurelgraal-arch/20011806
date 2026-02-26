import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down'
  trendValue?: string
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && trendValue && (
            <p
              className={`text-xs mt-2 ${
                trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {icon && <div className="text-2xl text-blue-400">{icon}</div>}
      </div>
    </div>
  )
}

StatCard.displayName = 'StatCard'

export default StatCard
