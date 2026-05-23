import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAlerts } from '../../hooks/useAlerts'
import { supabase } from '../../lib/supabase'

const MAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Search' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/alerts', label: 'Alerts' },
]

const MORE_LINKS = [
  { to: '/history', label: 'History' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/leaderboard', label: 'Leaderboard' },
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

function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full mt-2 min-w-[180px] bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function DropdownLink({ to, onClick, children }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left px-4 py-2.5 text-gray-200 hover:bg-gray-700 transition-colors"
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      to={to}
      className="block px-4 py-2.5 text-gray-200 hover:bg-gray-700 transition-colors"
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const { unreadCount } = useAlerts()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const avatarLetter = (user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <header className="h-[52px] bg-[#0D0D0D] border-b border-[#1A1A1A] sticky top-0 z-40">
      <div className="container h-full flex items-center justify-between gap-4">
        {/* Left — Logo */}
        <Link to="/dashboard" className="text-lg font-bold text-white shrink-0">
          TradeX
        </Link>

        {/* Center — Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {MAIN_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {label}
            </NavLink>
          ))}

          <Dropdown
            trigger={
              <button
                type="button"
                className="text-[#666666] hover:text-[#999999] transition-colors flex items-center gap-1 font-medium text-sm"
              >
                More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            }
          >
            {MORE_LINKS.map(({ to, label }) => (
              <DropdownLink key={to} to={to}>
                {label}
              </DropdownLink>
            ))}
          </Dropdown>
        </nav>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/alerts" className="icon-btn relative" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Dropdown
            trigger={
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-primary-500 text-white font-semibold text-sm flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="User menu"
              >
                {avatarLetter}
              </button>
            }
          >
            <DropdownLink to="/dashboard">Profile</DropdownLink>
            <DropdownLink to="/dashboard">Settings</DropdownLink>
            {isAdmin && (
              <DropdownLink to="/admin">Admin Panel</DropdownLink>
            )}
            <DropdownLink onClick={handleLogout}>Logout</DropdownLink>
          </Dropdown>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden icon-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-gray-600 bg-gray-800 px-4 py-3 flex flex-col gap-1">
          {[...MAIN_LINKS, ...MORE_LINKS].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg ${isActive ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className="px-3 py-2.5 rounded-lg text-primary-400 hover:bg-gray-700/50"
              onClick={() => setMobileOpen(false)}
            >
              Admin Panel
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
