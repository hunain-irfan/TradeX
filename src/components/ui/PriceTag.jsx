import { pnlToneClass } from '../../lib/portfolioMetrics'

export default function PriceTag({ price, change, changePercent, size = 'md' }) {
  const tone = pnlToneClass(change ?? changePercent ?? 0, { zeroClass: 'text-gray-400' })
  const sizeClass = size === 'lg' ? 'text-3xl font-bold' : 'text-base font-semibold'

  return (
    <div className="flex flex-col items-end">
      <span className={`${sizeClass} text-white`}>
        ${Number(price ?? 0).toFixed(2)}
      </span>
      {(change != null || changePercent != null) && (
        <span className={`text-sm ${tone}`}>
          {Number(change ?? changePercent ?? 0) > 0 ? '+' : ''}
          {change != null ? Number(change).toFixed(2) : ''}
          {changePercent != null ? ` (${Number(changePercent).toFixed(2)}%)` : ''}
        </span>
      )}
    </div>
  )
}
