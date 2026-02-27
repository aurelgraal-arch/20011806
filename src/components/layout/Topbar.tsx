
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
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  return (
    <header className="h-16 bg-black border-b border-accent2 flex items-center px-6 fixed top-0 left-0 right-0 z-50">
      <nav className="flex space-x-6">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'text-accent underline'
                : 'text-accent2 hover:text-accent transition'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto">
        <button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="text-accent2 hover:text-accent transition"
        >
          LOGOUT
        </button>
      </div>
    </header>
  )
}
