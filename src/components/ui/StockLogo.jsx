import { useEffect, useMemo, useState } from 'react'
import {
  getLogoCacheStatus,
  getStockLogoUrl,
  setLogoCacheStatus,
  stockLogoInitials,
} from '../../lib/stockLogo'

function getDisplayDpr() {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, 2)
}

export default function StockLogo({ symbol, size = 48, className = '' }) {
  const sym = symbol?.trim().toUpperCase() ?? ''
  const [variant, setVariant] = useState(0)
  const [failed, setFailed] = useState(() => getLogoCacheStatus(sym) === false)
  const [loaded, setLoaded] = useState(() => getLogoCacheStatus(sym) === true)
  const [dpr, setDpr] = useState(getDisplayDpr)

  const renderSize = useMemo(() => Math.round(size * dpr), [size, dpr])

  useEffect(() => {
    setDpr(getDisplayDpr())
  }, [])

  useEffect(() => {
    const status = getLogoCacheStatus(sym)
    setVariant(0)
    setFailed(status === false)
    setLoaded(status === true)
  }, [sym])

  const url = failed ? '' : getStockLogoUrl(sym, variant)
  const px = `${size}px`
  const showImg = Boolean(url && !failed)

  const handleError = () => {
    if (variant < 2 && sym.includes('.')) {
      setVariant((v) => v + 1)
      setLoaded(false)
      return
    }
    setLogoCacheStatus(sym, false)
    setFailed(true)
    setLoaded(false)
  }

  const handleLoad = () => {
    setLogoCacheStatus(sym, true)
    setLoaded(true)
  }

  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden bg-[#141414] border border-gray-600/80 flex items-center justify-center ${className}`}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
    >
      {showImg ? (
        <img
          src={url}
          alt=""
          width={renderSize}
          height={renderSize}
          loading="lazy"
          decoding="sync"
          className={`stock-logo-img block h-full w-full object-cover object-center ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ maxWidth: px, maxHeight: px }}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <span
          className="w-full text-center font-mono font-bold text-gray-400 select-none leading-none"
          style={{ fontSize: Math.max(10, size * 0.34) }}
        >
          {stockLogoInitials(sym)}
        </span>
      )}
    </div>
  )
}
