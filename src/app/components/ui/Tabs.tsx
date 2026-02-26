import React, { useState } from 'react'

interface TabsProps {
  tabs: Array<{
    label: string
    id: string
    content: React.ReactNode
  }>
  defaultTab?: string
  variant?: 'underline' | 'card'
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  variant = 'underline',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  const tabClasses = {
    underline: {
      button:
        'pb-2 px-4 font-medium text-slate-300 border-b-2 border-transparent hover:text-white transition-colors',
      activeButton:
        'text-blue-400 border-b-blue-400',
      container: 'flex gap-1 border-b border-slate-800',
    },
    card: {
      button:
        'px-4 py-2 font-medium text-slate-300 rounded-lg hover:bg-slate-800 transition-colors',
      activeButton:
        'bg-blue-600 text-white',
      container: 'flex gap-2',
    },
  }

  const styles = tabClasses[variant]

  return (
    <div>
      <div className={styles.container}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.button} ${
              activeTab === tab.id ? styles.activeButton : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

Tabs.displayName = 'Tabs'

export default Tabs
