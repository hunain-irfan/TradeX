const VARIANTS = {
  pending: 'bg-orange-500/20 text-orange-500',
  approved: 'bg-green-500/20 text-green-500',
  active: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  banned: 'bg-red-500/20 text-red-500',
  frozen: 'bg-orange-500/20 text-orange-500',
  buy: 'bg-green-500/20 text-green-500',
  sell: 'bg-red-500/20 text-red-500',
  default: 'bg-primary-500/10 text-primary-400',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const key = typeof variant === 'string' ? variant.toLowerCase() : variant

  return (
    <span
      className={`inline-flex w-fit max-w-full shrink-0 justify-self-start self-start items-center whitespace-nowrap rounded px-2.5 py-1.5 text-[10px] font-semibold uppercase leading-none tracking-wide ${VARIANTS[key] ?? VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  )
}
