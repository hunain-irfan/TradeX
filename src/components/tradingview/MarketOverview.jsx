import { useEffect, useRef, memo } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'

const CONFIG = {
  colorTheme: 'dark',
  locale: 'en',
  largeChartUrl: '',
  isTransparent: true,
  showSymbolLogo: true,
  backgroundColor: 'rgba(0,0,0,0)',
  support_host: 'https://www.tradingview.com',
  width: '100%',
  height: '100%',
  symbolsGroups: [
    {
      name: 'Top 50 US Stocks',
      symbols: [
        { name: 'NASDAQ:AAPL', displayName: 'Apple' },
        { name: 'NASDAQ:NVDA', displayName: 'NVIDIA' },
        { name: 'NASDAQ:MSFT', displayName: 'Microsoft' },
        { name: 'NASDAQ:AMZN', displayName: 'Amazon' },
        { name: 'NASDAQ:GOOGL', displayName: 'Alphabet' },
        { name: 'NASDAQ:META', displayName: 'Meta' },
        { name: 'NASDAQ:TSLA', displayName: 'Tesla' },
        { name: 'NASDAQ:AVGO', displayName: 'Broadcom' },
        { name: 'NYSE:BRK.B', displayName: 'Berkshire' },
        { name: 'NYSE:JPM', displayName: 'JPMorgan' },
        { name: 'NYSE:LLY', displayName: 'Eli Lilly' },
        { name: 'NYSE:V', displayName: 'Visa' },
        { name: 'NYSE:XOM', displayName: 'Exxon Mobil' },
        { name: 'NYSE:UNH', displayName: 'UnitedHealth' },
        { name: 'NYSE:MA', displayName: 'Mastercard' },
        { name: 'NASDAQ:COST', displayName: 'Costco' },
        { name: 'NYSE:HD', displayName: 'Home Depot' },
        { name: 'NYSE:PG', displayName: 'P&G' },
        { name: 'NASDAQ:NFLX', displayName: 'Netflix' },
        { name: 'NYSE:WMT', displayName: 'Walmart' },
      ],
    },
  ],
}

function MarketOverview() {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cleanup = () => {}
    let cancelled = false

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(el, SCRIPT, CONFIG)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      cleanup()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container tv-hide-copyright"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default memo(MarketOverview)
