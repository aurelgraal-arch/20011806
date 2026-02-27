import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export const Sidebar: React.FC = () => {
  const logout = useAuthStore((s) => s.logout)
  return (
    <aside className="w-60 bg-black fixed top-0 bottom-0 flex flex-col border-r border-accent2">
      <div className="p-4 text-accent2 font-bold text-xl">AUR EdenTech</div>
      <nav className="flex-1 flex flex-col gap-3 px-4">
        {/* order fixed as per spec */}
        {[
          {label:'TOTALITÀ',to:'/totalita'},
          {label:'PROFILO',to:'/profile'},
          {label:'PM FORUM',to:'/forum'},
          {label:'VIAGGIO',to:'/viaggio'},
          {label:'WALLET',to:'/wallet'},
          {label:'UTENTI ATTIVI',to:'/users'},
          {label:'RICERCA',to:'/search'},
          {label:'SALDO CANCELLIERI',to:'/balance'},
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'text-accent' : 'text-accent2 hover:text-accent transition'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="m-4 py-2 bg-accent text-black rounded hover:bg-accent/90 transition"
      >
        Logout
      </button>
    </aside>
  )
}
