import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminDashboardStats } from '../../lib/admin'
import StatCard from '../../components/ui/StatCard'
import { PageLoader, PageError } from '../../components/ui/PageState'

const LINKS = [
  { to: '/admin/users', label: 'Manage Users', desc: 'Ban, freeze, roles, wallets' },
  { to: '/admin/wallet', label: 'Fund Requests', desc: 'Approve or reject deposits' },
  { to: '/admin/analytics', label: 'Analytics', desc: 'Platform charts & top traders' },
  { to: '/admin/logs', label: 'Admin Logs', desc: 'Audit trail of actions' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data, error: err } = await adminDashboardStats()
    if (err) {
      setError(
        err.message?.includes('function')
          ? 'Run supabase/phase11-admin-rpc.sql in SQL Editor first'
          : err.message,
      )
    } else {
      setStats(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="container pt-6">
        <PageLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container pt-6">
        <PageError message={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.total_users ?? 0} />
        <StatCard label="Active Trades Today" value={stats?.active_trades_today ?? 0} />
        <StatCard
          label="Total Platform Volume"
          value={`$${Number(stats?.total_volume ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatCard label="Pending Fund Requests" value={stats?.pending_fund_requests ?? 0} />
      </div>

      <h2 className="text-lg font-semibold text-white">Quick Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="dashboard-card hover:border-primary-500 transition-colors block"
          >
            <p className="text-primary-400 font-semibold text-lg">{link.label}</p>
            <p className="text-gray-500 text-sm mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
