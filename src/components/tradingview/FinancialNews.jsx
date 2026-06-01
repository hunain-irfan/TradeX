import { useEffect, useRef, memo } from 'react'
import { mountTradingViewWidget } from '../../lib/tradingviewEmbed'

const SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'

const CONFIG = {
  feedMode: 'all_symbols',
  isTransparent: true,
  displayMode: 'regular',
  width: '100%',
  height: '547',
  colorTheme: 'dark',
  locale: 'en',
}

function FinancialNews() {
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
      className="tradingview-widget-container tv-hide-copyright tv-financial-news"
      style={{ width: '100%', height: 547 }}
    />
  )
}

export default memo(FinancialNews)
