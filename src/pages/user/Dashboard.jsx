import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useFinnhub } from '../../hooks/useFinnhub'
import { useTransactions } from '../../hooks/useTransactions'
import { fetchWallet } from '../../lib/trading'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'
import MarketOverview from '../../components/tradingview/MarketOverview'
import Heatmap from '../../components/tradingview/Heatmap'
import PortfolioPie from '../../components/charts/PortfolioPie'

export default function Dashboard() {
  const { user } = useAuth()
  const { holdings, loading: portLoading, updateLivePrices, refresh } = usePortfolio()
  const { transactions, loading: txLoading, refresh: refreshTx } = useTransactions()
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletError, setWalletError] = useState(null)
  const [walletLoading, setWalletLoading] = useState(true)

  const symbols = useMemo(() => holdings.map((h) => h.symbol).slice(0, 10), [holdings])
  const { prices, loading: priceLoading, error: priceError } = useFinnhub(symbols, 30000)

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      updateLivePrices(prices)
    }
  }, [prices, updateLivePrices])

  useEffect(() => {
    if (!user) return
    setWalletLoading(true)
    fetchWallet(user.id)
      .then(({ data, error }) => {
        if (error) setWalletError(error.message)
        else setWalletBalance(Number(data?.balance ?? 0))
      })
      .finally(() => setWalletLoading(false))
  }, [user])

  const loading = portLoading || txLoading || walletLoading || priceLoading
  const error = walletError || priceError

  const totalInvested = holdings.reduce(
    (s, h) => s + Number(h.quantity) * Number(h.buy_price),
    0,
  )
  const marketValue = holdings.reduce(
    (s, h) => s + Number(h.quantity) * Number(h.currentPrice ?? h.buy_price),
    0,
  )
  const startingBalance = 10000
  const accountValue = walletBalance + marketValue
  const totalReturnPct = ((accountValue - startingBalance) / startingBalance) * 100

  const today = new Date().toDateString()
  const todayPnl = transactions
    .filter((t) => new Date(t.created_at).toDateString() === today && t.action === 'SELL')
    .reduce((s, t) => s + (Number(t.price) - Number(t.buy_price ?? t.price)) * Number(t.quantity), 0)

  const recentTx = transactions.slice(0, 5)

  if (loading) return <div className="container pt-12"><PageLoader /></div>
  if (error) {
    return (
      <div className="container pt-12">
        <PageError message={error} onRetry={() => { refresh(); refreshTx() }} />
      </div>
    )
  }

  return (
    <div className="container pt-6 pb-16 space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white tracking-tight uppercase font-sans">
          Trading Terminal
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">Welcome back. Real-time market metrics.</p>
      </div>

      {/* Main 2-Column Professional Layout Grid (65% / 35%) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Column (65% width) */}
        <div className="w-full lg:w-[65%] shrink-0 flex flex-col gap-6">
          
          {/* Stats Grid: 4 Premium Bloomberg Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
                Wallet Balance
              </span>
              <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">
                ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
                Portfolio Value
              </span>
              <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">
                ${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
                Today P&L
              </span>
              <span className={`text-[24px] font-bold block mt-1 font-mono tracking-tight ${todayPnl >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
                {todayPnl >= 0 ? '▲ ' : '▼ '}
                ${Math.abs(todayPnl).toFixed(2)}
              </span>
            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">
              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
                Total Return
              </span>
              <span className={`text-[24px] font-bold block mt-1 font-mono tracking-tight ${totalReturnPct >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
                {totalReturnPct >= 0 ? '▲ ' : '▼ '}
                {Math.abs(totalReturnPct).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* TradingView Market Overview */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden p-1">
            <MarketOverview />
          </div>

          {/* TradingView Stock Heatmap */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden p-1">
            <Heatmap />
          </div>
        </div>

        {/* Right Column (35% width) */}
        <div className="w-full lg:w-[35%] shrink-0 flex flex-col gap-6">
          
          {/* Portfolio Allocation Pie Chart */}
          <div className="flex-1">
            <PortfolioPie holdings={holdings} />
          </div>

          {/* Recent Transactions Bloomberg Terminal Table */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
            <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-4">
              Recent Transactions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#222222]">
                    <th className="font-mono text-[10px] text-[#555555] uppercase py-2 px-1 text-left">Date</th>
                    <th className="font-mono text-[10px] text-[#555555] uppercase py-2 px-1 text-left">Ticker</th>
                    <th className="font-mono text-[10px] text-[#555555] uppercase py-2 px-1 text-left">Side</th>
                    <th className="font-mono text-[10px] text-[#555555] uppercase py-2 px-1 text-right">Qty</th>
                    <th className="font-mono text-[10px] text-[#555555] uppercase py-2 px-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500 font-mono text-xs py-8 border-none">
                        NO TRANSACTION HISTORY
                      </td>
                    </tr>
                  ) : (
                    recentTx.map((tx) => (
                      <tr key={tx.id} className="border-b border-[#111111]/30 hover:bg-[#161616]">
                        <td className="font-mono text-xs py-3 px-1 text-[#888888]">
                          {new Date(tx.created_at).toLocaleDateString(undefined, {
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-1">
                          <Link to={`/stock/${tx.stock_symbol}`} className="text-[#2962FF] font-semibold hover:underline font-mono text-xs">
                            {tx.stock_symbol}
                          </Link>
                        </td>
                        <td className="py-3 px-1">
                          {tx.action === 'BUY' ? (
                            <span className="bg-[#0D2818] text-[#00C853] font-semibold text-[10px] px-1.5 py-0.5 rounded-sm">
                              BUY
                            </span>
                          ) : (
                            <span className="bg-[#2D0D0D] text-[#FF3B30] font-semibold text-[10px] px-1.5 py-0.5 rounded-sm">
                              SELL
                            </span>
                          )}
                        </td>
                        <td className="font-mono text-xs text-right py-3 px-1 text-white">
                          {tx.quantity}
                        </td>
                        <td className="font-mono text-xs text-right py-3 px-1 text-white">
                          ${Number(tx.price).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
