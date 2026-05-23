import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useFinnhub } from '../../hooks/useFinnhub'
import { sortByField } from '../../lib/dsa'
import BuySellModal from '../../components/trading/BuySellModal'
import PnLArea from '../../components/charts/PnLArea'
import { useTransactions } from '../../hooks/useTransactions'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function Portfolio() {
  const { user, isFrozen } = useAuth()
  const { holdings, loading, refresh, updateLivePrices } = usePortfolio()
  const { transactions, refresh: refreshTx } = useTransactions()
  const [sort, setSort] = useState('value')
  const [modal, setModal] = useState(null)

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings])
  const { prices, loading: priceLoading, error } = useFinnhub(symbols, 30000)

  useEffect(() => {
    if (Object.keys(prices).length > 0) updateLivePrices(prices)
  }, [prices, updateLivePrices])

  const enriched = useMemo(() => {
    return holdings.map((h) => {
      const current = Number(h.currentPrice ?? h.buy_price)
      const invested = Number(h.quantity) * Number(h.buy_price)
      const market = Number(h.quantity) * current
      const pnl = market - invested
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
      return { ...h, current, invested, market, pnl, pnlPct }
    })
  }, [holdings])

  const sorted = useMemo(() => {
    if (sort === 'name') return sortByField(enriched, 'symbol', 'asc')
    if (sort === 'profit') return sortByField(enriched, 'pnl', 'desc')
    if (sort === 'loss') return sortByField(enriched, 'pnl', 'asc')
    return sortByField(enriched, 'market', 'desc')
  }, [enriched, sort])

  const totalValue = enriched.reduce((s, h) => s + h.market, 0)
  const totalInvested = enriched.reduce((s, h) => s + h.invested, 0)
  const unrealizedPnl = totalValue - totalInvested

  const txWithPnl = transactions.map((tx) => ({ ...tx, realizedPnl: null }))

  const handleSuccess = () => {
    refresh()
    refreshTx()
    setModal(null)
  }

  if (loading || priceLoading) return <div className="container pt-12"><PageLoader /></div>
  if (error) return <div className="container pt-12"><PageError message={error} onRetry={refresh} /></div>

  return (
    <div className="container pt-6 pb-16 space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white tracking-tight uppercase font-sans">
          Portfolio Holdings
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">Track your open positions and performance history.</p>
      </div>

      {/* 3 Premium Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Total Value
          </span>
          <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">
            ${totalValue.toFixed(2)}
          </span>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Total Invested
          </span>
          <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">
            ${totalInvested.toFixed(2)}
          </span>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Unrealized P&L
          </span>
          <span className={`text-[24px] font-bold block mt-1 font-mono tracking-tight ${unrealizedPnl >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
            {unrealizedPnl >= 0 ? '▲ ' : '▼ '}
            ${Math.abs(unrealizedPnl).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Sort buttons: premium pill style */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[#555555] text-xs font-semibold uppercase font-mono mr-2">Sort by:</span>
        {['name', 'profit', 'loss', 'value'].map((s) => {
          const isActive = sort === s
          return (
            <button
              key={s}
              type="button"
              className={`h-8 px-4 text-xs font-semibold rounded-full tracking-wider uppercase transition-all duration-150 ${
                isActive
                  ? 'bg-white text-[#222222]'
                  : 'bg-transparent text-gray-400 hover:text-white border border-[#1E1E1E] hover:bg-[#161616]'
              }`}
              onClick={() => setSort(s)}
            >
              {s === 'name' ? 'Name' : s === 'profit' ? 'Profit' : s === 'loss' ? 'Loss' : 'Value'}
            </button>
          )
        })}
      </div>

      {/* Holdings Bloomberg style table */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-left">Symbol</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-left">Name</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-right">Qty</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-right">Avg Buy</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-right">Current</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-right">P&L</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-right">P&L%</th>
                <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 border-none">
                    <EmptyState title="No holdings" message="Search stocks and buy shares to build your portfolio." />
                  </td>
                </tr>
              ) : (
                sorted.map((h) => (
                  <tr key={h.symbol} className="border-b border-[#111111]/30 hover:bg-[#161616] h-[52px]">
                    <td className="py-3 px-4">
                      <Link to={`/stock/${h.symbol}`} className="text-[#2962FF] font-semibold hover:underline font-mono text-sm">
                        {h.symbol}
                      </Link>
                    </td>
                    <td className="py-3 px-4 truncate max-w-[160px] text-gray-300 font-medium">
                      {h.stock_name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-white">
                      {h.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-gray-300">
                      ${Number(h.buy_price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-white">
                      ${h.current.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono text-sm font-semibold ${h.pnl >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
                      {h.pnl >= 0 ? '▲ ' : '▼ '}${Math.abs(h.pnl).toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono text-sm font-semibold ${h.pnlPct >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
                      {h.pnlPct >= 0 ? '▲ ' : '▼ '}{Math.abs(h.pnlPct).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          className="h-[28px] px-3 bg-transparent text-[#2962FF] hover:bg-[#2962FF]/10 text-xs font-semibold rounded-sm border border-transparent transition-all duration-150"
                          onClick={() =>
                            setModal({ mode: 'buy', symbol: h.symbol, name: h.stock_name })
                          }
                        >
                          Buy More
                        </button>
                        <button
                          type="button"
                          className="h-[28px] px-3 bg-transparent text-[#FF3B30] hover:bg-[#FF3B30]/10 text-xs font-semibold rounded-sm border border-[#FF3B30]/30 hover:border-[#FF3B30] transition-all duration-150"
                          onClick={() =>
                            setModal({
                              mode: 'sell',
                              symbol: h.symbol,
                              name: h.stock_name,
                              maxQty: h.quantity,
                            })
                          }
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PnLArea transactions={txWithPnl} />

      <BuySellModal
        open={!!modal}
        onClose={() => setModal(null)}
        mode={modal?.mode}
        symbol={modal?.symbol}
        stockName={modal?.name}
        userId={user?.id}
        maxQuantity={modal?.maxQty}
        onSuccess={handleSuccess}
        isFrozen={isFrozen}
      />
    </div>
  )
}
