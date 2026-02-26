import React from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  side?: 'left' | 'right'
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'left',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`
          relative bg-slate-900 w-80 shadow-lg
          transition-transform duration-300 flex flex-col
          ${side === 'left' ? 'translate-x-0' : 'translate-x-0'}
        `}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

Drawer.displayName = 'Drawer'

export default Drawer
