import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { STOCK_LIST } from '../../data/stocks'
import { binarySearch } from '../../lib/dsa'
import { useFinnhub } from '../../hooks/useFinnhub'
import StockCard from '../../components/ui/StockCard'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function Search() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(null)
  const [msg, setMsg] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return STOCK_LIST.slice(0, 20)

    const idx = binarySearch(STOCK_LIST, q, 'symbol')
    if (idx >= 0) {
      const start = Math.max(0, idx - 5)
      return STOCK_LIST.slice(start, start + 10)
    }

    return STOCK_LIST.filter(
      (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q),
    ).slice(0, 10)
  }, [query])

  const symbols = filtered.map((s) => s.symbol)
  const { prices, loading, error } = useFinnhub(symbols, 30000)

  const handleAddWatchlist = async (symbol, name) => {
    if (!user) return
    setAdding(symbol)
    setMsg(null)
    const { error: err } = await supabase.from('watchlist').insert({
      user_id: user.id,
      stock_symbol: symbol,
      stock_name: name,
    })
    setAdding(null)
    if (err) setMsg(err.message.includes('duplicate') ? 'Already in watchlist' : err.message)
    else setMsg(`${symbol} added to watchlist`)
  }

  return (
    <div className="container pt-6 pb-10">
      <h1 className="text-2xl font-bold text-white mb-4">Search Stocks</h1>

      <input
        type="text"
        className="search-input w-full mb-6"
        placeholder="Search by symbol or name (e.g. AAPL)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {msg && <p className="text-primary-400 text-sm mb-4">{msg}</p>}

      {loading && <PageLoader />}
      {error && <PageError message={error} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No stocks found" message="Try a different symbol or company name." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              quote={prices[stock.symbol]}
              onAddWatchlist={handleAddWatchlist}
              adding={adding === stock.symbol}
            />
          ))}
        </div>
      )}
    </div>
  )
}
