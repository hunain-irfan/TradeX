import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useFinnhub } from '../../hooks/useFinnhub'
import { useTransactions } from '../../hooks/useTransactions'
import { fetchWallet } from '../../lib/trading'
import { Wallet, Briefcase, TrendingUp, TrendingDown, PieChart } from '../../lib/navIcons'
import DashboardStatCard from '../../components/ui/DashboardStatCard'
import { PageLoader, PageError } from '../../components/ui/PageState'
import MarketOverview from '../../components/tradingview/MarketOverview'
import FinancialNews from '../../components/tradingview/FinancialNews'
import StockMarketWatchlist from '../../components/tradingview/StockMarketWatchlist'
import RecentTransactions from '../../components/trading/RecentTransactions'
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

  if (loading) return <div className="container pt-12"><PageLoader /></div>
  if (error) {
    return (
      <div className="container pt-12">
        <PageError message={error} onRetry={() => { refresh(); refreshTx() }} />
      </div>
    )
  }

  const todayPnlClass = todayPnl >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'
  const returnClass = totalReturnPct >= 0 ? 'text-[#00C853]' : 'text-[#FF3B30]'

  return (
    <div className="container pt-6 pb-16 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard
          label="Wallet Balance"
          icon={Wallet}
          value={`$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <DashboardStatCard
          label="Portfolio Value"
          icon={Briefcase}
          value={`$${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <DashboardStatCard
          label="Today P&L"
          icon={todayPnl >= 0 ? TrendingUp : TrendingDown}
          value={`${todayPnl >= 0 ? '+' : '-'}$${Math.abs(todayPnl).toFixed(2)}`}
          valueClassName={todayPnlClass}
        />
        <DashboardStatCard
          label="Total Return"
          icon={PieChart}
          value={`${totalReturnPct >= 0 ? '+' : '-'}${Math.abs(totalReturnPct).toFixed(2)}%`}
          valueClassName={returnClass}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 w-full bg-[#111111] rounded-lg overflow-hidden h-[550px]">
          <MarketOverview />
        </div>

        <div className="w-full bg-[#111111] rounded-lg overflow-hidden h-[550px]">
          <StockMarketWatchlist />
        </div>

        <div className="w-full bg-[#111111] rounded-lg overflow-hidden border-t border-[#1E1E1E]">
          <FinancialNews />
        </div>

        <div className="w-full">
          <RecentTransactions transactions={transactions} />
        </div>

        <div className="w-full bg-[#111111] rounded-lg overflow-hidden flex flex-col relative h-[500px]">
          <PortfolioPie holdings={holdings} />
        </div>
      </div>
    </div>
  )
}
