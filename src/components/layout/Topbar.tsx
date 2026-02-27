
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const ITEMS = [
  { label: 'TOTALITÀ', to: '/totalita' },
  { label: 'PROFILO', to: '/profile' },
  { label: 'FORUM', to: '/forum' },
  { label: 'VIAGGIO', to: '/viaggio' },
  { label: 'WALLET', to: '/wallet' },
  { label: 'UTENTI', to: '/users' },
  { label: 'RICERCA', to: '/search' },
  { label: 'SALDO', to: '/balance' },
  { label: 'BADGE', to: '/premi' },
]

export const Topbar: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-accent2/30">
      <div className="h-[var(--navbar-height)] flex items-center px-[var(--spacing-lg)] max-w-[1400px] mx-auto w-full justify-between">
        {/* LEFT: Logo */}
        <div className="text-xl font-black text-accent2 tracking-wider min-w-fit">
          AUR
        </div>

        {/* CENTER: Navigation */}
        <nav className="flex space-x-8 flex-1 justify-center">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-accent2 border-b-2 border-accent2 pb-1'
                    : 'text-accent2/70 hover:text-accent hover:glow-emerald'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: User Info & Logout */}
        <div className="flex items-center gap-6 min-w-fit">
          {user && (
            <div className="text-right">
              <p className="text-xs text-accent2/60">Lv. {user.public_name || 'User'}</p>
            </div>
          )}
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="text-xs font-semibold text-accent2 hover:text-accent transition-colors duration-200"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  )
}
