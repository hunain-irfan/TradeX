import { useEffect, useRef } from 'react'
import { mountTradingViewWidget, toTradingViewSymbol } from '../../lib/tradingviewEmbed'

const PROFILE_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js'

export default function CompanyProfile({ symbol, height = 360 }) {
  const containerRef = useRef(null)
  const tvSymbol = toTradingViewSymbol(symbol)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !tvSymbol) return

    let cleanup = () => {}
    let cancelled = false

    const config = {
      symbol: tvSymbol,
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'en',
      width: '100%',
      height: '100%',
    }

    const frameId = requestAnimationFrame(() => {
      if (cancelled) return
      cleanup = mountTradingViewWidget(container, PROFILE_SCRIPT, config)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      cleanup()
    }
  }, [tvSymbol])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container tv-hide-copyright w-full"
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    />
  )
}
