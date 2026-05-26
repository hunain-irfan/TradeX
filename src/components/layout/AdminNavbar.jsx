import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Logo from './Logo'
import { Shield, Menu, X, LogOut } from '../../lib/navIcons'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/wallet', label: 'Fund Requests' },
  { to: '/admin/logs', label: 'Logs' },
]

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function navLinkClass({ isActive }) {
  return isActive
    ? 'text-white font-semibold text-sm'
    : 'text-[#666666] hover:text-[#999999] transition-colors font-medium text-sm'
}

export default function AdminNavbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useClickOutside(menuRef, () => setMenuOpen(false))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const avatarLetter = (user?.email?.[0] ?? 'A').toUpperCase()

  return (
    <header className="bg-[#0D0D0D] border-b border-[#1A1A1A] sticky top-0 z-40">
      <div className="container flex items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-3 shrink-0">
          <Logo to="/admin" className="h-7 w-auto max-w-[120px]" />
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-500/15 text-primary-400 text-[10px] font-semibold uppercase tracking-wider">
            <Shield className="w-3 h-3" strokeWidth={2} aria-hidden />
            Admin
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {ADMIN_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-primary-500 text-white font-semibold pt-[2px] text-sm flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Admin menu"
            >
              {avatarLetter}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-gray-500" strokeWidth={2} aria-hidden />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="hidden max-lg:inline-flex w-9 h-9 shrink-0 rounded-full items-center justify-center bg-gray-700/60 text-gray-300 hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-150"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-gray-600 bg-gray-800 px-4 py-3 flex flex-col gap-1">
          {ADMIN_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg ${
                  isActive
                    ? 'text-white bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
