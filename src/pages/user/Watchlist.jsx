import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useFinnhubSocket } from '../../hooks/useFinnhubSocket'
import { STOCK_LIST } from '../../data/stocks'
import AdvancedChart from '../../components/tradingview/AdvancedChart'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function Watchlist() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addSymbol, setAddSymbol] = useState('')
  const [chartSymbol, setChartSymbol] = useState(null)

  const symbols = items.map((i) => i.stock_symbol)
  const { prices, connected } = useFinnhubSocket(symbols)

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    if (err) setError(err.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    const sym = addSymbol.trim().toUpperCase()
    const stock = STOCK_LIST.find((s) => s.symbol === sym)
    if (!stock || !user) return

    const { error: err } = await supabase.from('watchlist').insert({
      user_id: user.id,
      stock_symbol: sym,
      stock_name: stock.name,
    })
    if (!err) {
      setAddSymbol('')
      load()
    } else setError(err.message)
  }

  const handleRemove = async (id) => {
    await supabase.from('watchlist').delete().eq('id', id)
    load()
  }

  if (loading) return <div className="container pt-6"><PageLoader /></div>
  if (error) return <div className="container pt-6"><PageError message={error} onRetry={load} /></div>

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Watchlist</h1>
        <span className="text-gray-500 text-sm">
          {connected ? 'Live' : 'Connecting...'}
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          className="search-input flex-1"
          placeholder="Symbol (e.g. AAPL)"
          value={addSymbol}
          onChange={(e) => setAddSymbol(e.target.value)}
        />
        <button type="submit" className="primary-btn">
          Add
        </button>
      </form>

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row grid grid-cols-6 gap-2 px-4 py-3 text-sm font-medium">
          <span>Symbol</span>
          <span>Name</span>
          <span>Price</span>
          <span>Change</span>
          <span>Change%</span>
          <span>Action</span>
        </div>
        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Watchlist empty" message="Add stocks from Search or above." />
          </div>
        ) : (
          items.map((item) => {
            const q = prices[item.stock_symbol]
            const price = q?.c ?? q?.p ?? 0
            const change = q?.d ?? 0
            const changePct = q?.dp ?? 0
            const up = Number(change) >= 0

            return (
              <div
                key={item.id}
                className="table-row grid grid-cols-6 gap-2 px-4 py-3 text-sm items-center cursor-pointer"
                onClick={() => setChartSymbol(item.stock_symbol)}
              >
                <Link
                  to={`/stock/${item.stock_symbol}`}
                  className="text-primary-400 font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.stock_symbol}
                </Link>
                <span className="truncate">{item.stock_name}</span>
                <span>${Number(price).toFixed(2)}</span>
                <span className={up ? 'profit-text' : 'loss-text'}>
                  {up ? '+' : ''}
                  {Number(change).toFixed(2)}
                </span>
                <span className={up ? 'profit-text' : 'loss-text'}>
                  {Number(changePct).toFixed(2)}%
                </span>
                <button
                  type="button"
                  className="text-red-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(item.id)
                  }}
                >
                  Remove
                </button>
              </div>
            )
          })
        )}
      </div>

      {chartSymbol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 px-4">
          <div className="dashboard-card w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{chartSymbol} Chart</h2>
              <button type="button" className="secondary-btn h-10 px-4" onClick={() => setChartSymbol(null)}>
                Close
              </button>
            </div>
            <AdvancedChart symbol={chartSymbol} height={450} />
          </div>
        </div>
      )}
    </div>
  )
}
