import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sortByField } from '../../lib/dsa'
import { useFinnhub } from '../../hooks/useFinnhub'
import LeaderboardBar from '../../components/charts/LeaderboardBar'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

const STARTING = 10000

function computeUserValue(row, prices) {
  const holdings = Array.isArray(row.holdings) ? row.holdings : []
  const holdingsValue = holdings.reduce((sum, h) => {
    const quote = prices[h.symbol]
    const price = Number(quote?.c ?? h.buy_price ?? 0)
    return sum + Number(h.quantity) * price
  }, 0)
  return Number(row.wallet_balance) + holdingsValue
}

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_leaderboard')

      if (err) {
        setError(
          err.message.includes('function')
            ? 'Run supabase/phase10-leaderboard.sql in SQL Editor first'
            : err.message,
        )
        setLoading(false)
        return
      }

      setRows(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const allSymbols = useMemo(() => {
    const set = new Set()
    rows.forEach((r) => {
      const holdings = r.holdings ?? []
      holdings.forEach((h) => set.add(h.symbol))
    })
    return [...set].slice(0, 50)
  }, [rows])

  const { prices, loading: priceLoading } = useFinnhub(allSymbols, 60000)

  const ranked = useMemo(() => {
    const list = rows.map((r) => {
      const portfolioValue = computeUserValue(r, prices)
      const totalReturnPct = ((portfolioValue - STARTING) / STARTING) * 100
      const name = r.user_email?.split('@')[0] ?? 'Trader'
      return {
        userId: r.user_id,
        name,
        email: r.user_email,
        portfolioValue,
        totalReturnPct,
        tradesCount: Number(r.trades_count ?? 0),
      }
    })
    return sortByField(list, 'portfolioValue', 'desc').map((u, i) => ({
      ...u,
      rank: i + 1,
    }))
  }, [rows, prices])

  const top3 = ranked.slice(0, 3)
  const medalClass = ['text-orange-500', 'text-gray-400', 'text-orange-500']

  if (loading || priceLoading) return <div className="container pt-6"><PageLoader /></div>
  if (error) return <div className="container pt-6"><PageError message={error} /></div>

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Leaderboard</h1>

      {ranked.length === 0 ? (
        <EmptyState title="No traders yet" message="Run leaderboard SQL and add users." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((u, i) => (
              <div
                key={u.userId}
                className={`dashboard-card text-center ${i === 0 ? 'border-orange-500' : i === 1 ? 'border-gray-500' : 'border-orange-500/50'}`}
              >
                <p className={`text-2xl font-bold ${medalClass[i]}`}>#{u.rank}</p>
                <p className="text-white font-semibold text-lg mt-2">{u.name}</p>
                <p className="text-primary-400 text-xl font-bold mt-1">
                  ${u.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className={u.totalReturnPct >= 0 ? 'profit-text text-sm mt-1' : 'loss-text text-sm mt-1'}>
                  {u.totalReturnPct >= 0 ? '+' : ''}
                  {u.totalReturnPct.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>

          <LeaderboardBar
            data={ranked.map((u) => ({
              name: u.name,
              portfolioValue: u.portfolioValue,
            }))}
          />

          <div className="watchlist-table overflow-x-auto">
            <div className="table-header-row grid grid-cols-6 gap-2 px-4 py-3 text-sm font-medium">
              <span>Rank</span>
              <span>Avatar</span>
              <span>Name</span>
              <span>Portfolio Value</span>
              <span>Total Return%</span>
              <span>Trades</span>
            </div>
            {ranked.map((u) => (
              <div key={u.userId} className="data-row grid grid-cols-6 gap-2 px-4 py-3 text-sm items-center">
                <span className="font-bold">#{u.rank}</span>
                <span className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                  {u.name[0]?.toUpperCase()}
                </span>
                <span>{u.name}</span>
                <span>${u.portfolioValue.toFixed(2)}</span>
                <span className={u.totalReturnPct >= 0 ? 'profit-text' : 'loss-text'}>
                  {u.totalReturnPct.toFixed(2)}%
                </span>
                <span>{u.tradesCount}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
