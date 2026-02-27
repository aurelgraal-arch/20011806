import React from 'react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  trend?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, className = '' }) => {
  return (
    <Card className={`p-4 ${className}`}>
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      {trend && <p className="text-sm text-green-400">{trend}</p>}
    </Card>
  )
}
