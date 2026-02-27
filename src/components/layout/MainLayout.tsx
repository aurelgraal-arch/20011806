import React from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { RightPanel } from './RightPanel'

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      <RightPanel />
      <main className="pt-16 pl-0 md:pl-60 pr-0 lg:pr-60">{children}</main>
    </div>
  )
}
