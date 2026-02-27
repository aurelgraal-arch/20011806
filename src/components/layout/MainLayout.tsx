import React from 'react'
import { Topbar } from './Topbar'

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="pt-[var(--navbar-height)]">{children}</main>
    </div>
  )
}
