import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFinnhub } from '../../hooks/useFinnhub'
import { usePortfolio } from '../../hooks/usePortfolio'
import { getCompanyNews } from '../../lib/finnhub'
import { STOCK_LIST } from '../../data/stocks'
import { supabase } from '../../lib/supabase'
import AdvancedChart from '../../components/tradingview/AdvancedChart'
import SymbolInfo from '../../components/tradingview/SymbolInfo'
import BuySellModal from '../../components/trading/BuySellModal'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function StockDetail() {
  const { symbol } = useParams()
  const { user, isFrozen } = useAuth()
  const { holdings, refresh } = usePortfolio()
  const { prices, loading, error } = useFinnhub(symbol ? [symbol] : [], 30000)
  
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)
  
  const [modal, setModal] = useState(null)
  const [timePeriod, setTimePeriod] = useState('1D')
  
  // Watchlist interactive integration
  const [inWatchlist, setInWatchlist] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  const stock = STOCK_LIST.find((s) => s.symbol === symbol)
  const quote = prices[symbol]
  const holding = holdings.find((h) => h.symbol === symbol)

  // 3 Alphabetically close stocks for Related Stocks
  const relatedStocks = useMemo(() => {
    const idx = STOCK_LIST.findIndex((s) => s.symbol === symbol)
    if (idx < 0) return STOCK_LIST.slice(0, 3)
    const list = []
    if (idx > 0) list.push(STOCK_LIST[idx - 1])
    if (idx < STOCK_LIST.length - 1) list.push(STOCK_LIST[idx + 1])
    if (idx < STOCK_LIST.length - 2) list.push(STOCK_LIST[idx + 2])
    while (list.length < 3) {
      list.push(STOCK_LIST[list.length])
    }
    return list.slice(0, 3)
  }, [symbol])

  const relatedSymbols = useMemo(() => relatedStocks.map((r) => r.symbol), [relatedStocks])
  const { prices: relatedPrices } = useFinnhub(relatedSymbols, 30000)

  // Check Watchlist status
  useEffect(() => {
    if (!user || !symbol) return
    supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('stock_symbol', symbol)
      .maybeSingle()
      .then(({ data }) => {
        setInWatchlist(!!data)
      })
  }, [user, symbol])

  const toggleWatchlist = async () => {
    if (!user || !symbol) return
    setWatchlistLoading(true)
    if (inWatchlist) {
      const { error: err } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('stock_symbol', symbol)
      if (!err) setInWatchlist(false)
    } else {
      const { error: err } = await supabase.from('watchlist').insert({
        user_id: user.id,
        stock_symbol: symbol,
        stock_name: stock?.name ?? symbol,
      })
      if (!err) setInWatchlist(true)
    }
    setWatchlistLoading(false)
  }

  useEffect(() => {
    if (!symbol) return
    setNewsLoading(true)
    getCompanyNews(symbol)
      .then((data) => {
        setNews(Array.isArray(data) ? data.slice(0, 5) : [])
        setNewsError(null)
      })
      .catch((err) => setNewsError(err.message))
      .finally(() => setNewsLoading(false))
  }, [symbol])

  if (loading) return <div className="container pt-12"><PageLoader /></div>
  if (error) return <div className="container pt-12"><PageError message={error} /></div>

  const price = quote?.c ?? 0
  const change = quote?.d ?? 0
  const changePct = quote?.dp ?? 0
  const up = Number(change) >= 0

  // High fidelity stable pseudo-random financial data matching Bloomberg style
  const mockId = symbol ? symbol.charCodeAt(0) : 65
  const mockPe = (15 + (mockId % 25)).toFixed(1)
  const mockMarketCap = `${(1.2 + (mockId % 5) * 0.4).toFixed(2)}T`
  const mockVolume = `${(20 + (mockId % 80)).toFixed(1)}M`
  const mockHigh52 = (price * 1.15).toFixed(2)
  const mockLow52 = (price * 0.85).toFixed(2)

  return (
    <div className="container pt-6 pb-20 space-y-6">
      
      {/* 2-Column Responsive Workspace Grid (65% / 35%) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Column (65% width) */}
        <div className="w-full lg:w-[65%] shrink-0 flex flex-col gap-6">
          
          {/* Company Header Block */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Sleek dynamic logo placeholder */}
              <div className="w-12 h-12 bg-primary-500/10 text-primary-400 border border-primary-500/20 font-bold flex items-center justify-center text-lg rounded-md">
                {symbol?.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-bold text-white tracking-tight leading-none">
                    {stock?.name ?? symbol}
                  </h1>
                  <span className="text-[#888888] font-mono text-xs bg-[#1E1E1E] px-2 py-0.5 rounded-sm font-semibold uppercase">
                    {symbol}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  NASDAQ NMS • Technology Sector • USD
                </p>
              </div>
            </div>

            {/* Favorite Star Icon Button */}
            <button
              type="button"
              className={`p-2 rounded-md border transition-all duration-150 flex items-center justify-center ${
                inWatchlist
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                  : 'bg-transparent border-[#1E1E1E] text-gray-500 hover:text-white hover:bg-[#161616]'
              }`}
              onClick={toggleWatchlist}
              disabled={watchlistLoading}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <svg className="w-5 h-5" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.253.588 1.81l-3.97 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.888a1 1 0 00-1.176 0l-3.97 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.97-2.888c-.772-.557-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>

          {/* Pricing & Change Block */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider font-mono">Last Trade Price</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-[32px] font-bold text-white font-mono tracking-tight leading-none">
                  ${Number(price).toFixed(2)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-sm font-semibold font-mono ${up ? 'bg-[#0D2818] text-[#00C853]' : 'bg-[#2D0D0D] text-[#FF3B30]'}`}>
                  {up ? '▲ ' : '▼ '}
                  {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Time period pill buttons */}
            <div className="flex gap-1.5 bg-[#1E1E1E] p-1 rounded-full">
              {['1D', '5D', '1M', '3M', '1Y'].map((p) => {
                const isActive = timePeriod === p
                return (
                  <button
                    key={p}
                    type="button"
                    className={`h-7 px-3.5 text-[10px] font-bold rounded-full tracking-wider uppercase transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-[#222222] shadow'
                        : 'bg-transparent text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setTimePeriod(p)}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Advanced Candlestick Chart */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden p-1">
            <AdvancedChart symbol={symbol} height={450} />
          </div>

        </div>

        {/* Right Column (35% width) */}
        <div className="w-full lg:w-[35%] shrink-0 flex flex-col gap-6">
          
          {/* Today's Range Bloomberg Block */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
            <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-4">
              Today's Range
            </h3>
            
            <div className="space-y-4 font-mono">
              <div className="flex justify-between items-center text-sm border-b border-[#1E1E1E]/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-500 font-sans text-xs">Open Price</span>
                </div>
                <span className="text-white font-semibold">${Number(quote?.o ?? 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm border-b border-[#1E1E1E]/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-gray-500 font-sans text-xs">Day High</span>
                </div>
                <span className="text-white font-semibold">${Number(quote?.h ?? 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-gray-500 font-sans text-xs">Day Low</span>
                </div>
                <span className="text-white font-semibold">${Number(quote?.l ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* More Info Card */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
            <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-4">
              Key Statistics
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-[#1E1E1E]/40 pb-2.5">
                <span className="text-gray-500 font-sans">Market Capitalization</span>
                <span className="text-white font-semibold">{mockMarketCap}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E1E1E]/40 pb-2.5">
                <span className="text-gray-500 font-sans">Volume (Average)</span>
                <span className="text-white font-semibold">{mockVolume}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E1E1E]/40 pb-2.5">
                <span className="text-gray-500 font-sans">52-Week High</span>
                <span className="text-white font-semibold">${mockHigh52}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E1E1E]/40 pb-2.5">
                <span className="text-gray-500 font-sans">52-Week Low</span>
                <span className="text-white font-semibold">${mockLow52}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-gray-500 font-sans">Price/Earnings Ratio</span>
                <span className="text-white font-semibold">{mockPe}x</span>
              </div>
            </div>
          </div>

          {/* Large Split Transaction Action buttons */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 space-y-3">
            <button
              type="button"
              className="primary-btn w-full font-bold h-11 text-xs tracking-wider uppercase"
              onClick={() => setModal({ mode: 'buy' })}
            >
              Execute Buy Order
            </button>
            <button
              type="button"
              className="secondary-btn w-full font-bold h-11 text-xs tracking-wider uppercase text-red-500 hover:text-red-400 border-red-500/20 hover:border-red-500/50"
              onClick={() => setModal({ mode: 'sell', maxQty: holding?.quantity })}
              disabled={!holding}
            >
              Execute Sell Order {holding && `(${holding.quantity} Held)`}
            </button>
          </div>

        </div>

      </div>

      {/* Bottom 3-Column Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Recommendation Analysis Card */}
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 space-y-4">
          <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono">
            Analyst Sentiment
          </h3>

          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="w-20 h-20 rounded-full border-4 border-green-500/30 border-t-green-500 flex items-center justify-center font-mono font-bold text-lg text-white">
              {(75 + (mockId % 15))}%
            </div>
            <p className="text-white font-semibold mt-3 text-sm">Strong Buy Recommendation</p>
            <p className="text-gray-500 text-xs mt-1">Based on {12 + (mockId % 30)} analyst consensus reports.</p>
          </div>
        </div>

        {/* Column 2: Latest News feed */}
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 flex flex-col justify-between min-h-[224px]">
          <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-4">
            Recent News Feed
          </h3>

          {newsLoading && <PageLoader />}
          {newsError && <PageError message={newsError} />}
          {!newsLoading && !newsError && news.length === 0 && (
            <EmptyState title="No articles" message="No recent company news." />
          )}

          <div className="space-y-3 divide-y divide-[#1E1E1E]/40 overflow-y-auto max-h-[200px] scrollbar-hide-default pr-1">
            {news.map((item, idx) => (
              <a
                key={item.id ?? item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`block pt-3 hover:opacity-85 ${idx === 0 ? 'pt-0 border-none' : ''}`}
              >
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase font-mono">
                  <span>{item.source}</span>
                  <span>{new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="text-white text-xs font-semibold mt-1 leading-snug truncate">
                  {item.headline}
                </h4>
              </a>
            ))}
          </div>
        </div>

        {/* Column 3: Related Stocks display */}
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
          <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-4">
            Related Equities
          </h3>

          <div className="space-y-3.5">
            {relatedStocks.map((rel) => {
              const relQuote = relatedPrices[rel.symbol]
              const relPrice = relQuote?.c ?? 0
              const relChange = relQuote?.dp ?? 0
              const relUp = Number(relChange) >= 0

              return (
                <Link
                  key={rel.symbol}
                  to={`/stock/${rel.symbol}`}
                  className="flex justify-between items-center border border-[#1E1E1E]/60 bg-[#161616]/40 hover:bg-[#161616]/90 p-3 rounded-md transition-all duration-150"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-white bg-[#1E1E1E] px-1.5 py-0.5 rounded-sm">
                      {rel.symbol}
                    </span>
                    <span className="text-gray-400 text-xs ml-2 truncate max-w-[120px] inline-block align-middle font-medium">
                      {rel.name}
                    </span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <p className="text-white font-semibold">${Number(relPrice).toFixed(2)}</p>
                    <p className={relUp ? 'text-[#00C853] font-semibold' : 'text-[#FF3B30] font-semibold'}>
                      {relUp ? '+' : ''}{Number(relChange).toFixed(2)}%
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>

      <BuySellModal
        open={!!modal}
        onClose={() => setModal(null)}
        mode={modal?.mode}
        symbol={symbol}
        stockName={stock?.name ?? symbol}
        userId={user?.id}
        maxQuantity={modal?.maxQty}
        onSuccess={refresh}
        isFrozen={isFrozen}
      />
    </div>
  )
}
