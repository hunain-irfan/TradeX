import { useEffect, useRef, memo } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'

const CONFIG = {
  colorTheme: 'dark',
  dateRange: '12M',
  locale: 'en',
  largeChartUrl: '',
  isTransparent: true,
  showFloatingTooltip: false,
  plotLineColorGrowing: 'rgba(0, 200, 83, 1)',
  plotLineColorFalling: 'rgba(255, 59, 48, 1)',
  gridLineColor: 'rgba(30, 30, 30, 1)',
  scaleFontColor: '#888888',
  belowLineFillColorGrowing: 'rgba(0, 200, 83, 0.12)',
  belowLineFillColorFalling: 'rgba(255, 59, 48, 0.12)',
  belowLineFillColorGrowingBottom: 'rgba(0, 200, 83, 0)',
  belowLineFillColorFallingBottom: 'rgba(255, 59, 48, 0)',
  symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
  tabs: [
    {
      title: 'Indices',
      symbols: [
        { s: 'FOREXCOM:SPXUSD', d: 'S&P 500 Index' },
        { s: 'FOREXCOM:NSXUSD', d: 'US 100 Cash CFD' },
        { s: 'FOREXCOM:DJI', d: 'Dow Jones Industrial Average Index' },
      ],
      originalTitle: 'Indices',
    },
    {
      title: 'Forex',
      symbols: [
        { s: 'FX:EURUSD', d: 'EUR to USD' },
        { s: 'FX:GBPUSD', d: 'GBP to USD' },
        { s: 'FX:USDJPY', d: 'USD to JPY' },
      ],
      originalTitle: 'Forex',
    },
  ],
  support_host: 'https://www.tradingview.com',
  backgroundColor: 'rgba(0,0,0,0)',
  width: '100%',
  height: '100%',
  showSymbolLogo: true,
  showChart: true,
}

function StockMarketWatchlist() {
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

export default memo(StockMarketWatchlist)
