import { useMemo, useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { Undo2, Download } from '../../lib/navIcons'
import StockSymbolCell from '../../components/ui/StockSymbolCell'
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
          className="primary-btn gap-2"
          disabled={!canUndo || undoing}
          onClick={handleUndo}
        >
          <Undo2 className="w-4 h-4" strokeWidth={2} aria-hidden />
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
          className="secondary-btn gap-2"
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
          <Download className="w-4 h-4" strokeWidth={2} aria-hidden />
          Export CSV
        </button>
      </div>

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row app-grid-row history-grid text-sm font-medium">
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555] !justify-self-start !text-left">Date</span>
          <span className="cell-stock font-mono text-[11px] uppercase text-[#555555]">Symbol</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Action</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Qty</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Price</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Total</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">Balance</span>
          <span className="cell-num font-mono text-[11px] uppercase text-[#555555]">P&L</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No transactions" message="Adjust filters or start trading." />
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="data-row app-grid-row history-grid text-sm">
              <span className="cell-num !justify-self-start !text-left text-xs text-gray-400">
                {new Date(tx.created_at).toLocaleString()}
              </span>
              <div className="cell-stock min-w-0">
                <StockSymbolCell
                  symbol={tx.stock_symbol}
                  name={tx.stock_name}
                  showName={false}
                />
              </div>
              <span className={`cell-num ${tx.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.action}
              </span>
              <span className="cell-num">{tx.quantity}</span>
              <span className="cell-num">${Number(tx.price).toFixed(2)}</span>
              <span className="cell-num">${Number(tx.total_value).toFixed(2)}</span>
              <span className="cell-num">${Number(tx.balance_after).toFixed(2)}</span>
              <span className={`cell-num ${Number(tx.realizedPnl) >= 0 ? 'profit-text' : 'loss-text'}`}>
                {tx.realizedPnl !== '' ? `$${tx.realizedPnl}` : '—'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
