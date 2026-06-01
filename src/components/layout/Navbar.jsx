import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useWalletBalance } from '../../hooks/useWalletBalance'
import { supabase } from '../../lib/supabase'
import { getTraderDisplayName } from '../../lib/userDisplay'
import Logo from './Logo'
import {
  ROUTE_ICONS,
  ChevronDown,
  Menu,
  X,
  User,
  Settings,
  LogOut,
} from '../../lib/navIcons'

const MAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Stocks' },
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

function NavItem({ to, label, onClick, mobile = false, showIcon = false }) {
  const Icon = showIcon ? ROUTE_ICONS[to] : null
  const className = ({ isActive }) =>
    mobile
      ? `flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${
          isActive
            ? 'text-white bg-gray-700'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`
      : `flex items-center gap-1.5 ${navLinkClass({ isActive })}`

  return (
    <NavLink to={to} className={className} onClick={onClick}>
      {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />}
      {label}
    </NavLink>
  )
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
          className={`absolute top-full mt-2 min-w-[200px] bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function DropdownLink({ to, onClick, children, icon: Icon }) {
  const inner = (
    <span className="flex items-center gap-2.5">
      {Icon && <Icon className="w-4 h-4 shrink-0 text-gray-500" strokeWidth={2} aria-hidden />}
      {children}
    </span>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left px-4 py-2.5 text-gray-200 hover:bg-gray-700 transition-colors"
      >
        {inner}
      </button>
    )
  }

  return (
    <Link to={to} className="block px-4 py-2.5 text-gray-200 hover:bg-gray-700 transition-colors">
      {inner}
    </Link>
  )
}

export default function Navbar() {
  const { user } = useAuth()
  const { balance, loading: walletLoading } = useWalletBalance()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const avatarLetter = (
    getTraderDisplayName({
      display_name: user?.user_metadata?.display_name,
      email: user?.email,
    })[0] ?? 'U'
  ).toUpperCase()

  return (
    <header className="bg-[#0D0D0D] border-b border-[#1A1A1A] sticky top-0 z-40">
      <div className="container flex items-center justify-between gap-4 py-5">
        <Logo to="/dashboard" className="h-7 w-auto max-w-[120px]" />

        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {MAIN_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {label}
            </NavLink>
          ))}

          <Dropdown
            trigger={
              <button
                type="button"
                className="text-[#666666] hover:text-[#999999] transition-colors flex items-center gap-1 font-medium text-sm px-2 py-1"
              >
                More
                <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden />
              </button>
            }
          >
            {MORE_LINKS.map(({ to, label }) => {
              const Icon = ROUTE_ICONS[to]
              return (
                <DropdownLink key={to} to={to} icon={Icon}>
                  {label}
                </DropdownLink>
              )
            })}
          </Dropdown>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/wallet"
            className="flex flex-col items-end leading-tight hover:opacity-90 transition-opacity shrink-0"
            title="Wallet balance"
          >
            <span className="hidden sm:block text-[10px] uppercase tracking-wider text-[#666666] font-mono">
              Balance
            </span>
            <span className="text-xs sm:text-sm font-semibold font-mono text-white">
              {walletLoading ? '…' : `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </Link>
          <Dropdown
            trigger={
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-primary-500 text-white font-semibold text-sm flex items-center justify-center hover:opacity-90 transition-opacity pt-[2px]"
                aria-label="User menu"
              >
                {avatarLetter}
              </button>
            }
          >
            <DropdownLink to="/profile" icon={User}>
              Profile
            </DropdownLink>
            <DropdownLink to="/settings" icon={Settings}>
              Settings
            </DropdownLink>
            <DropdownLink onClick={handleLogout} icon={LogOut}>
              Logout
            </DropdownLink>
          </Dropdown>

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
          {MAIN_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
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
          <div className="border-t border-gray-600/80 my-2 pt-2 flex flex-col gap-1">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              More
            </span>
            {MORE_LINKS.map(({ to, label }) => (
              <NavItem
                key={to}
                to={to}
                label={label}
                mobile
                showIcon
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
          <div className="border-t border-gray-600/80 my-2 pt-2 flex flex-col gap-1">
            <NavItem
              to="/profile"
              label="Profile"
              mobile
              showIcon
              onClick={() => setMobileOpen(false)}
            />
            <NavItem
              to="/settings"
              label="Settings"
              mobile
              showIcon
              onClick={() => setMobileOpen(false)}
            />
          </div>
        </nav>
      )}
    </header>
  )
}
