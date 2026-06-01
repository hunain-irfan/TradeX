import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { adminDashboardStats, adminAnalyticsData } from '../../lib/admin'
import StatCard from '../../components/ui/StatCard'
import { pnlToneClass } from '../../lib/portfolioMetrics'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    const [statsRes, analyticsRes] = await Promise.all([
      adminDashboardStats(),
      adminAnalyticsData(),
    ])

    if (statsRes.error) {
      setError(
        statsRes.error.message?.includes('function')
          ? 'Run supabase/phase11-admin-rpc.sql in SQL Editor first'
          : statsRes.error.message,
      )
    } else {
      setStats(statsRes.data)
    }

    if (!statsRes.error && analyticsRes.error) {
      setError(
        analyticsRes.error.message?.includes('function')
          ? 'Run supabase/phase11-admin-rpc.sql in SQL Editor first'
          : analyticsRes.error.message,
      )
    } else if (!statsRes.error) {
      setAnalytics(analyticsRes.data)
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

  const signups = analytics?.daily_signups ?? []
  const mostTraded = analytics?.most_traded ?? []
  const topTraders = analytics?.top_traders ?? []
  const platformPnl = Number(analytics?.platform_pnl ?? 0)

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

      <StatCard
        label="Platform Realized P&L"
        value={`${platformPnl >= 0 ? '+' : ''}$${platformPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        trend={platformPnl >= 0 ? 'up' : 'down'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h2 className="text-white font-semibold mb-4">Daily Signups (30 days)</h2>
          {signups.length === 0 ? (
            <EmptyState title="No signup data" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={signups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
                <XAxis dataKey="date" stroke="#9095A1" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9095A1" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1A1D23', border: '1px solid #2A2F3A' }} />
                <Line type="monotone" dataKey="count" stroke="#5865F2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dashboard-card">
          <h2 className="text-white font-semibold mb-4">Most Traded Stocks</h2>
          {mostTraded.length === 0 ? (
            <EmptyState title="No trade data" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mostTraded}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
                <XAxis dataKey="symbol" stroke="#9095A1" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9095A1" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1A1D23', border: '1px solid #2A2F3A' }} />
                <Bar dataKey="trades" fill="#7C89FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="text-white font-semibold mb-4">Top 5 Traders</h2>
        {topTraders.length === 0 ? (
          <EmptyState title="No traders yet" />
        ) : (
          <div className="watchlist-table">
            <div className="table-header-row grid grid-cols-4 gap-2 px-4 py-3 text-sm font-medium">
              <span>Email</span>
              <span>Balance</span>
              <span>Trades</span>
              <span>Realized P&L</span>
            </div>
            {topTraders.map((t) => (
              <div
                key={t.user_id}
                className="data-row grid grid-cols-4 gap-2 px-4 py-3 text-sm"
              >
                <span className="truncate">{t.email}</span>
                <span>${Number(t.balance ?? 0).toFixed(2)}</span>
                <span>{t.trades_count}</span>
                <span className={pnlToneClass(t.net_flow, { zeroClass: 'text-gray-400' })}>
                  ${Number(t.net_flow).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
