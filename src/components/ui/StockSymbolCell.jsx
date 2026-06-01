import { Link } from 'react-router-dom'
import StockLogo from './StockLogo'

/**
 * Logo + symbol (+ optional name) for tables and list rows.
 * Uses cached Finnhub CDN logos — same as Search cards.
 */
export default function StockSymbolCell({
  symbol,
  name,
  size = 26,
  link = true,
  showName = true,
  showLogo = true,
  className = '',
}) {
  const sym = symbol?.trim().toUpperCase() ?? ''

  const inner = (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      {showLogo && <StockLogo symbol={sym} size={size} className="flex-none" />}
      <div className="min-w-0">
        <span className="font-semibold text-white font-mono text-sm block leading-tight">
          {sym}
        </span>
        {showName && name && (
          <span className="text-gray-500 text-xs truncate block max-w-[140px] sm:max-w-[200px]">
            {name}
          </span>
        )}
      </div>
    </div>
  )

  if (link && sym) {
    return (
      <Link
        to={`/stock/${sym}`}
        className="hover:opacity-90 min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </Link>
    )
  }

  return inner
}
