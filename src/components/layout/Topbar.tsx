
import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import { useThemeStore } from '../../store/themeStore'

export const Topbar: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const { xp, level, walletBalance } = useUserStore()
  const xpNeeded = level * 100
  const progress = Math.min(100, (xp / xpNeeded) * 100)

  return (
    <header className="h-16 bg-black border-b border-accent2 flex items-center justify-between px-6 fixed left-60 right-0">
      <div className="text-accent2">{user?.public_name}</div>
      <div className="flex items-center gap-4">
        <div className="text-accent2">Lv.{level}</div>
        <div className="w-40 h-2 bg-[#111] rounded overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-accent2">💰 {walletBalance}</div>
        <ThemeToggle />
      </div>
    </header>
  )
}

const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggleTheme)
  return (
    <button
      onClick={toggle}
      className="px-3 py-1 bg-accent2 text-black rounded text-sm hover:opacity-90 transition"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
