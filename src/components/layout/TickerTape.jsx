import { useEffect, useRef } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const TICKER_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'

const CONFIG = {
  symbols: [
    { proName: 'NASDAQ:AAPL', title: 'AAPL' },
    { proName: 'NASDAQ:TSLA', title: 'TSLA' },
    { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
    { proName: 'NASDAQ:MSFT', title: 'MSFT' },
    { proName: 'NASDAQ:AMZN', title: 'AMZN' },
    { proName: 'NASDAQ:NVDA', title: 'NVDA' },
    { proName: 'NASDAQ:META', title: 'META' },
    { proName: 'NASDAQ:NFLX', title: 'NFLX' },
    { proName: 'SP:SPX', title: 'S&P 500' },
    { proName: 'DJ:DJI', title: 'Dow 30' },
    { proName: 'NASDAQ:COMP', title: 'Nasdaq' },
    { proName: 'FOREXCOM:XAUUSD', title: 'Gold' },
  ],
  showSymbolLogo: true,
  colorTheme: 'dark',
  isTransparent: true,
  displayMode: 'adaptive',
  locale: 'en',
}

export default function TickerTape() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup = () => {}
    let cancelled = false

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, TICKER_SCRIPT, CONFIG)
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
      className="tradingview-widget-container ticker-tape-container w-full border-b border-[#1A1A1A]"
    />
  )
}
