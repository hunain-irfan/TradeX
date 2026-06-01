import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useFinnhubSocket } from '../../hooks/useFinnhubSocket'
import { useTransactions } from '../../hooks/useTransactions'
import { fetchWallet } from '../../lib/trading'
import DashboardStatCard from '../../components/ui/DashboardStatCard'
import { PageLoader, PageError } from '../../components/ui/PageState'
import MarketOverview from '../../components/tradingview/MarketOverview'
import FinancialNews from '../../components/tradingview/FinancialNews'
import StockMarketWatchlist from '../../components/tradingview/StockMarketWatchlist'
import RecentTransactions from '../../components/trading/RecentTransactions'
import PortfolioPie from '../../components/charts/PortfolioPie'
import {
  computeAccountValue,
  computeHoldingsMarketValue,
  computeTodayPnl,
  computeTotalReturnPct,
  DEFAULT_STARTING_CAPITAL,
  pnlToneClass,
} from '../../lib/portfolioMetrics'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useAlertChecker } from '../../hooks/useAlertChecker'

export default function Dashboard() {
  const { user } = useAuth()
  const { holdings, loading: portLoading, updateLivePrices, refresh } = usePortfolio()
  const { transactions, loading: txLoading, refresh: refreshTx } = useTransactions()
  const [walletBalance, setWalletBalance] = useState(0)
  const [totalDeposited, setTotalDeposited] = useState(DEFAULT_STARTING_CAPITAL)
  const [walletError, setWalletError] = useState(null)
  const [walletLoading, setWalletLoading] = useState(true)

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings])
  const { prices, loading: priceLoading } = useFinnhubSocket(symbols)
  const pricesForStats = useDebouncedValue(prices, 2000)

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      updateLivePrices(prices)
    }
  }, [prices, updateLivePrices])

  useAlertChecker(prices)

  useEffect(() => {
    if (!user) return
    setWalletLoading(true)
    fetchWallet(user.id)
      .then(({ data, error }) => {
        if (error) setWalletError(error.message)
        else {
          setWalletBalance(Number(data?.balance ?? 0))
          setTotalDeposited(Number(data?.total_deposited ?? DEFAULT_STARTING_CAPITAL))
        }
      })
      .finally(() => setWalletLoading(false))
  }, [user])

  const loading = portLoading || txLoading || walletLoading
  const error = walletError

  const marketValue = computeHoldingsMarketValue(holdings, pricesForStats)
  const accountValue = computeAccountValue(walletBalance, holdings, pricesForStats)
  const totalReturnPct = computeTotalReturnPct(accountValue, totalDeposited)

  const todayPnl = computeTodayPnl(holdings, pricesForStats, transactions)

  if (loading) return <div className="container pt-12"><PageLoader /></div>
  if (error) {
    return (
      <div className="container pt-12">
        <PageError message={error} onRetry={() => { refresh(); refreshTx() }} />
      </div>
    )
  }

  const todayPnlClass = pnlToneClass(todayPnl, { zeroClass: 'text-[#00C853]' })
  const returnClass = pnlToneClass(totalReturnPct, { zeroClass: 'text-gray-400' })

  return (
    <div className="container pt-6 pb-16 space-y-6">
      {priceLoading && (
        <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider -mt-2">
          Loading live prices for holdings…
        </p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard
          label="Wallet Balance"
          value={`$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <DashboardStatCard
          label="Portfolio Value"
          value={`$${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <DashboardStatCard
          label="Today P&L"
          value={`${todayPnl >= 0 ? '+' : '-'}$${Math.abs(todayPnl).toFixed(2)}`}
          valueClassName={todayPnlClass}
        />
        <DashboardStatCard
          label="Total Return"
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
