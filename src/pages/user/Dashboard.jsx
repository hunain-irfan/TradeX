import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useFinnhub } from '../../hooks/useFinnhub'
import { useTransactions } from '../../hooks/useTransactions'
import { fetchWallet } from '../../lib/trading'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'
import MarketOverview from '../../components/tradingview/MarketOverview'
import FinancialNews from '../../components/tradingview/FinancialNews'
import StockMarketWatchlist from '../../components/tradingview/StockMarketWatchlist'
import RecentTransactions from '../../components/tradingview/RecentTransactions'
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

      {/* Stats Grid: 4 Premium Bloomberg Cards (Full Width Header) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Wallet Balance
          </span>
          <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">
            ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Portfolio Value
          </span>
          <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">
            ${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Today P&L
          </span>
          <span className={`text-[24px] font-bold block mt-1 font-mono tracking-tight ${todayPnl >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
            {todayPnl >= 0 ? '▲ ' : '▼ '}
            ${Math.abs(todayPnl).toFixed(2)}
          </span>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
          <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">
            Total Return
          </span>
          <span className={`text-[24px] font-bold block mt-1 font-mono tracking-tight ${totalReturnPct >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
            {totalReturnPct >= 0 ? '▲ ' : '▼ '}
            {Math.abs(totalReturnPct).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Main Professional Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Row 1, Col 1 & 2 */}
        <div className="lg:col-span-2 w-full bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden h-[550px]">
          <MarketOverview />
        </div>

        {/* Row 1, Col 3 */}
        <div className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden h-[550px]">
          <StockMarketWatchlist />
        </div>

        {/* Row 2, Col 1 (Position 4) */}
        <div className="w-full bg-[#111111]  rounded-lg overflow-hidden h-[500px]">
          <FinancialNews />
        </div>

        {/* Row 2, Col 2 (Position 5) */}
        <div className="w-full">
          <RecentTransactions transactions={transactions} />
        </div>

        {/* Row 2, Col 3 (Position 6) */}
        <div className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden flex flex-col relative h-[500px]">
          {/* <div className="absolute top-[20px] left-[20px] z-10">
            <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider font-mono">Portfolio Allocation</span>
          </div> */}
          <PortfolioPie holdings={holdings} />
        </div>

      </div>
    </div>
  )
}
