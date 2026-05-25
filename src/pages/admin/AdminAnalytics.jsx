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
import { adminAnalyticsData } from '../../lib/admin'
import StatCard from '../../components/ui/StatCard'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data: res, error: err } = await adminAnalyticsData()
    if (err) {
      setError(
        err.message?.includes('function')
          ? 'Run supabase/phase11-admin-rpc.sql in SQL Editor first'
          : err.message,
      )
    } else {
      setData(res)
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

  const signups = data?.daily_signups ?? []
  const mostTraded = data?.most_traded ?? []
  const topTraders = data?.top_traders ?? []
  const platformPnl = Number(data?.platform_pnl ?? 0)

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>

      <StatCard
        label="Platform-wide P&L (net flow)"
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
              <span>Net Flow</span>
            </div>
            {topTraders.map((t) => (
              <div
                key={t.user_id}
                className="data-row grid grid-cols-4 gap-2 px-4 py-3 text-sm"
              >
                <span className="truncate">{t.email}</span>
                <span>${Number(t.balance ?? 0).toFixed(2)}</span>
                <span>{t.trades_count}</span>
                <span className={Number(t.net_flow) >= 0 ? 'profit-text' : 'loss-text'}>
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
