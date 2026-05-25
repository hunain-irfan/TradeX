import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { supabase } from '../../lib/supabase'
import { fetchWallet } from '../../lib/trading'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/PageState'
import { Mail, Calendar, Shield } from 'lucide-react'
import { User, Settings, Wallet, Briefcase, History, Star } from '../../lib/navIcons'

function StatTile({ label, value, sub }) {
  return (
    <div className="dashboard-card">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-gray-600/40 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{children}</span>
    </div>
  )
}

export default function Profile() {
  const { user, isAdmin, isEmailVerified, isBanned, isFrozen } = useAuth()
  const { totalValue, holdings, loading: portLoading } = usePortfolio()
  const [walletBalance, setWalletBalance] = useState(0)
  const [tradeCount, setTradeCount] = useState(0)
  const [watchlistCount, setWatchlistCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  const displayName =
    user?.user_metadata?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Trader'

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const load = async () => {
      setStatsLoading(true)
      const [walletRes, txRes, wlRes] = await Promise.all([
        fetchWallet(user.id),
        supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('watchlist')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ])

      if (cancelled) return
      if (!walletRes.error) setWalletBalance(Number(walletRes.data?.balance ?? 0))
      if (!txRes.error) setTradeCount(txRes.count ?? 0)
      if (!wlRes.error) setWatchlistCount(wlRes.count ?? 0)
      setStatsLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (portLoading || statsLoading) {
    return (
      <div className="container pt-6">
        <PageLoader />
      </div>
    )
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  const accountValue = walletBalance + totalValue
  const avatarLetter = (displayName[0] ?? user?.email?.[0] ?? 'U').toUpperCase()

  const quickLinks = [
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { to: '/history', label: 'History', icon: History },
    { to: '/watchlist', label: 'Watchlist', icon: Star },
  ]

  return (
    <div className="container pt-6 pb-16 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title="Profile" icon={User} className="mb-0" />
        <Link to="/settings" className="secondary-btn gap-2 shrink-0">
          <Settings className="w-4 h-4" strokeWidth={2} aria-hidden />
          Edit settings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="dashboard-card flex flex-col items-center text-center lg:items-stretch lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
            <div className="w-20 h-20 rounded-full bg-primary-500 text-white text-3xl font-bold flex items-center justify-center shrink-0 mx-auto lg:mx-0">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">{displayName}</h2>
              <p className="text-gray-500 text-sm truncate flex items-center justify-center lg:justify-start gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-3">
                {isEmailVerified ? (
                  <Badge variant="approved">Verified</Badge>
                ) : (
                  <Badge variant="pending">Email pending</Badge>
                )}
                {isAdmin && <Badge variant="default">Admin</Badge>}
                {isBanned && <Badge variant="rejected">Banned</Badge>}
                {isFrozen && <Badge variant="pending">Frozen</Badge>}
              </div>
            </div>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-gray-600/50 space-y-2 text-sm">
            <p className="text-gray-500 flex items-center justify-center lg:justify-start gap-2">
              <Calendar className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
              Member since {memberSince}
            </p>
            <p className="text-gray-500 flex items-center justify-center lg:justify-start gap-2">
              <Shield className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
              Account ID · {user?.id?.slice(0, 8)}…
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Account value"
              value={`$${accountValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
            <StatTile
              label="Cash balance"
              value={`$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
            <StatTile
              label="Holdings"
              value={holdings.length}
              sub={`$${totalValue.toFixed(2)} market value`}
            />
            <StatTile label="Trades" value={tradeCount} sub={`${watchlistCount} watchlist`} />
          </div>

          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-white mb-2">Account details</h3>
            <DetailRow label="Display name">{displayName}</DetailRow>
            <DetailRow label="Email">{user?.email}</DetailRow>
            <DetailRow label="Role">{isAdmin ? 'Administrator' : 'Trader'}</DetailRow>
            <DetailRow label="Email status">
              {isEmailVerified ? 'Confirmed' : 'Awaiting confirmation'}
            </DetailRow>
            <DetailRow label="Trading status">
              {isBanned ? 'Banned' : isFrozen ? 'Frozen' : 'Active'}
            </DetailRow>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="dashboard-card flex flex-col items-center gap-2 py-4 hover:border-primary-500/40 hover:bg-gray-700/30 transition-colors"
                >
                  <Icon className="w-5 h-5 text-primary-500" strokeWidth={2} aria-hidden />
                  <span className="text-sm font-medium text-white">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
