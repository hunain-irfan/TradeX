import { useEffect, useMemo, useState } from 'react'
import { preloadStockLogos } from '../../lib/stockLogo'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { DEFAULT_TOP_SYMBOLS, STOCK_LIST } from '../../data/stocks'
import { binarySearch } from '../../lib/dsa'
import StockCard from '../../components/ui/StockCard'
import { EmptyState } from '../../components/ui/PageState'
import { useToast } from '../../components/ui/Toast'

export default function Search() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [watchlistSet, setWatchlistSet] = useState(() => new Set())
  const [watchlistBusy, setWatchlistBusy] = useState(null)
  const { showToast } = useToast()

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) {
      return STOCK_LIST.filter((s) => DEFAULT_TOP_SYMBOLS.includes(s.symbol)).sort(
        (a, b) => DEFAULT_TOP_SYMBOLS.indexOf(a.symbol) - DEFAULT_TOP_SYMBOLS.indexOf(b.symbol),
      )
    }
    const idx = binarySearch(STOCK_LIST, q, 'symbol')
    if (idx >= 0) {
      const start = Math.max(0, idx - 5)
      return STOCK_LIST.slice(start, start + 10)
    }

    return STOCK_LIST.filter(
      (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q),
    ).slice(0, 10)
  }, [query])

  useEffect(() => {
    preloadStockLogos(DEFAULT_TOP_SYMBOLS)
  }, [])

  useEffect(() => {
    if (!user) {
      setWatchlistSet(new Set())
      return
    }
    supabase
      .from('watchlist')
      .select('stock_symbol')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setWatchlistSet(new Set((data ?? []).map((r) => r.stock_symbol)))
      })
  }, [user])

  const toggleWatchlist = async (symbol, name) => {
    if (!user) return
    setWatchlistBusy(symbol)

    if (watchlistSet.has(symbol)) {
      const { error: err } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('stock_symbol', symbol)
      if (!err) {
        setWatchlistSet((prev) => {
          const next = new Set(prev)
          next.delete(symbol)
          return next
        })
        showToast(`${symbol} removed from watchlist`)
      } else {
        showToast(err.message, 'error')
      }
    } else {
      const { error: err } = await supabase.from('watchlist').insert({
        user_id: user.id,
        stock_symbol: symbol,
        stock_name: name,
      })
      if (!err) {
        setWatchlistSet((prev) => new Set(prev).add(symbol))
        showToast(`${symbol} added to watchlist`)
      } else {
        showToast(
          err.message.includes('duplicate') ? 'Already in watchlist' : err.message,
          'error',
        )
      }
    }

    setWatchlistBusy(null)
  }

  return (
    <div className="container pt-6 pb-10">
      <h1 className="text-2xl font-bold text-white mb-4">Stocks</h1>

      <input
        type="text"
        className="search-input w-full mb-6"
        placeholder="Search by symbol or name (e.g. AAPL)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No stocks found" message="Try a different symbol or company name." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              inWatchlist={watchlistSet.has(stock.symbol)}
              onToggleWatchlist={() => toggleWatchlist(stock.symbol, stock.name)}
              watchlistLoading={watchlistBusy === stock.symbol}
            />
          ))}
        </div>
      )}
    </div>
  )
}
