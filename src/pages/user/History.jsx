import { useMemo, useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

function exportCsv(rows) {
  const headers = [
    'Date',
    'Symbol',
    'Action',
    'Qty',
    'Price',
    'Total',
    'Balance After',
    'Realized P&L',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.date,
        r.symbol,
        r.action,
        r.qty,
        r.price,
        r.total,
        r.balanceAfter,
        r.realizedPnl,
      ].join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tradex-history-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function History() {
  const { transactions, loading, error, undoLast, refresh } = useTransactions()
  const [actionFilter, setActionFilter] = useState('ALL')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [undoing, setUndoing] = useState(false)
  const [undoError, setUndoError] = useState(null)

  const buyPrices = useMemo(() => {
    const map = {}
    transactions
      .slice()
      .reverse()
      .forEach((tx) => {
        if (tx.action === 'BUY') {
          map[tx.stock_symbol] = Number(tx.price)
        }
      })
    return map
  }, [transactions])

  const enriched = useMemo(() => {
    return transactions.map((tx) => {
      let realizedPnl = ''
      if (tx.action === 'SELL') {
        const avgBuy = buyPrices[tx.stock_symbol] ?? Number(tx.price)
        realizedPnl = ((Number(tx.price) - avgBuy) * Number(tx.quantity)).toFixed(2)
      }
      return { ...tx, realizedPnl }
    })
  }, [transactions, buyPrices])

  const filtered = useMemo(() => {
    return enriched.filter((tx) => {
      if (actionFilter !== 'ALL' && tx.action !== actionFilter) return false
      if (symbolFilter && !tx.stock_symbol.includes(symbolFilter.toUpperCase())) return false
      const d = new Date(tx.created_at)
      if (dateFrom && d < new Date(dateFrom)) return false
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [enriched, actionFilter, symbolFilter, dateFrom, dateTo])

  const lastTx = transactions[0]
  const canUndo =
    lastTx &&
    Date.now() - new Date(lastTx.created_at).getTime() < 5 * 60 * 1000

  const handleUndo = async () => {
    setUndoing(true)
    setUndoError(null)
    const { error: err } = await undoLast()
    if (err) setUndoError(err.message)
    setUndoing(false)
  }

  if (loading) return <div className="container pt-6"><PageLoader /></div>
  if (error) return <div className="container pt-6"><PageError message={error} onRetry={refresh} /></div>

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <button
          type="button"
          className="primary-btn"
          disabled={!canUndo || undoing}
          onClick={handleUndo}
        >
          {undoing ? 'Undoing...' : 'Undo Last Trade'}
        </button>
      </div>
      {!canUndo && lastTx && (
        <p className="text-gray-500 text-sm">Undo disabled (last trade older than 5 minutes or empty).</p>
      )}
      {undoError && <p className="text-red-500 text-sm">{undoError}</p>}

      <div className="dashboard-card grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <input
          className="form-input"
          placeholder="Symbol filter"
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
        />
        <select
          className="form-input"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="secondary-btn"
          disabled={filtered.length === 0}
          onClick={() =>
            exportCsv(
              filtered.map((tx) => ({
                date: new Date(tx.created_at).toISOString(),
                symbol: tx.stock_symbol,
                action: tx.action,
                qty: tx.quantity,
                price: tx.price,
                total: tx.total_value,
                balanceAfter: tx.balance_after,
                realizedPnl: tx.realizedPnl,
              })),
            )
          }
        >
          Export CSV
        </button>
      </div>

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row grid grid-cols-8 gap-2 px-4 py-3 text-sm font-medium">
          <span>Date</span>
          <span>Symbol</span>
          <span>Action</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
          <span>Balance After</span>
          <span>Realized P&L</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No transactions" message="Adjust filters or start trading." />
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="data-row grid grid-cols-8 gap-2 px-4 py-3 text-sm">
              <span>{new Date(tx.created_at).toLocaleString()}</span>
              <span className="font-semibold">{tx.stock_symbol}</span>
              <span className={tx.action === 'BUY' ? 'text-green-500' : 'text-red-500'}>{tx.action}</span>
              <span>{tx.quantity}</span>
              <span>${Number(tx.price).toFixed(2)}</span>
              <span>${Number(tx.total_value).toFixed(2)}</span>
              <span>${Number(tx.balance_after).toFixed(2)}</span>
              <span className={Number(tx.realizedPnl) >= 0 ? 'profit-text' : 'loss-text'}>
                {tx.realizedPnl !== '' ? `$${tx.realizedPnl}` : '—'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
