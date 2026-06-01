import { Link } from 'react-router-dom'

export default function Logo({
  to = '/dashboard',
  className = 'h-8 w-auto max-w-[140px]',
  onClick,
  link = true,
}) {
  const image = (
    <img
      src="/logo.png"
      alt="TradeX"
      className={`object-contain object-left ${className}`}
      decoding="async"
    />
  )

  if (!link) {
    return <span className="inline-flex shrink-0 items-center">{image}</span>
  }

  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      {image}
    </Link>
  )
}
