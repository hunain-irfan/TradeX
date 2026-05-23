const VARIANTS = {
  pending: 'bg-orange-500/20 text-orange-500',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  default: 'bg-primary-500/10 text-primary-400',
}

export default function Badge({ children, variant = 'default' }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-md text-xs font-semibold uppercase ${VARIANTS[variant] ?? VARIANTS.default}`}
    >
      {children}
    </span>
  )
}
