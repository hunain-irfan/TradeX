export default function PriceTag({ price, change, changePercent, size = 'md' }) {
  const isUp = Number(change) >= 0
  const sizeClass = size === 'lg' ? 'text-3xl font-bold' : 'text-base font-semibold'

  return (
    <div className="flex flex-col items-end">
      <span className={`${sizeClass} text-white`}>
        ${Number(price ?? 0).toFixed(2)}
      </span>
      {(change != null || changePercent != null) && (
        <span className={isUp ? 'profit-text text-sm' : 'loss-text text-sm'}>
          {isUp ? '+' : ''}
          {change != null ? Number(change).toFixed(2) : ''}
          {changePercent != null ? ` (${Number(changePercent).toFixed(2)}%)` : ''}
        </span>
      )}
    </div>
  )
}
