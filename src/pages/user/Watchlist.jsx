import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useFinnhubSocket } from '../../hooks/useFinnhubSocket'
import { STOCK_LIST } from '../../data/stocks'
import { preloadStockLogos } from '../../lib/stockLogo'
import AdvancedChart from '../../components/tradingview/AdvancedChart'
import { Plus, Trash2 } from '../../lib/navIcons'
import StockSymbolCell from '../../components/ui/StockSymbolCell'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'
import { useToast } from '../../components/ui/Toast'
import { pnlToneClass } from '../../lib/portfolioMetrics'

export default function Watchlist() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [addSymbol, setAddSymbol] = useState('')
  const [addError, setAddError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [chartSymbol, setChartSymbol] = useState(null)

  const symbols = items.map((i) => i.stock_symbol)
  const { prices } = useFinnhubSocket(symbols)

  useEffect(() => {
    if (symbols.length > 0) preloadStockLogos(symbols)
  }, [symbols.join(',')])

  const load = async () => {
    if (!user) return
    setLoading(true)
    setLoadError(null)
    const { data, error: err } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    if (err) setLoadError(err.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddError(null)

    const sym = addSymbol.trim().toUpperCase()
    if (!sym) {
      setAddError('Enter a stock symbol (e.g. AAPL).')
      return
    }
    if (!user) return

    const stock = STOCK_LIST.find((s) => s.symbol === sym)
    if (!stock) {
      setAddError(`"${sym}" is not in our stock list. Open Stocks to browse supported symbols.`)
      return
    }

    if (items.some((i) => i.stock_symbol === sym)) {
      setAddError(`${sym} is already on your watchlist.`)
      return
    }

    setAdding(true)
    const { error: err } = await supabase.from('watchlist').insert({
      user_id: user.id,
      stock_symbol: sym,
      stock_name: stock.name,
    })
    setAdding(false)

    if (err) {
      setAddError(err.message)
      return
    }

    setAddSymbol('')
    showToast(`${sym} added to watchlist`)
    load()
  }

  const handleRemove = async (id) => {
    await supabase.from('watchlist').delete().eq('id', id)
    load()
  }

  if (loading) return <div className="container pt-6"><PageLoader /></div>
  if (loadError) return <div className="container pt-6"><PageError message={loadError} onRetry={load} /></div>

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Watchlist</h1>

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-3">
          <input
            className="search-input flex-1"
            placeholder="Symbol (e.g. AAPL)"
            value={addSymbol}
            onChange={(e) => {
              setAddSymbol(e.target.value)
              if (addError) setAddError(null)
            }}
            aria-invalid={addError ? true : undefined}
            aria-describedby={addError ? 'watchlist-add-error' : undefined}
          />
          <button type="submit" className="primary-btn gap-2" disabled={adding}>
            <Plus className="w-4 h-4" strokeWidth={2} aria-hidden />
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        {addError && (
          <p id="watchlist-add-error" className="text-red-500 text-sm">
            {addError}
          </p>
        )}
        <p className="text-gray-500 text-xs">
          Supported symbols only (100 US stocks). Browse the Stocks page to pick one.
        </p>
      </form>

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row app-grid-row watchlist-grid text-sm font-medium">
          <span className="cell-stock font-mono text-[11px] uppercase text-[#555555]">Stock</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Price</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Change</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Change%</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Action</span>
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
            const changeTone = pnlToneClass(change, { zeroClass: 'text-gray-400' })

            return (
              <div
                key={item.id}
                className="data-row app-grid-row watchlist-grid text-sm cursor-pointer"
                onClick={() => setChartSymbol(item.stock_symbol)}
              >
                <div className="cell-stock min-w-0">
                  <StockSymbolCell
                    symbol={item.stock_symbol}
                    name={item.stock_name}
                  />
                </div>
                <span className="cell-num">${Number(price).toFixed(2)}</span>
                <span className={`cell-num ${changeTone}`}>
                  {Number(change) > 0 ? '+' : ''}
                  {Number(change).toFixed(2)}
                </span>
                <span className={`cell-num ${changeTone}`}>
                  {Number(changePct) > 0 ? '+' : ''}
                  {Number(changePct).toFixed(2)}%
                </span>
                <button
                  type="button"
                  className="cell-num inline-flex items-center justify-end gap-1.5 text-red-500 hover:text-red-400 text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(item.id)
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
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
