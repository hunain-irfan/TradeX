export default function PageHeader({ title, icon: Icon, className = '' }) {
  return (
    <h1
      className={`text-2xl font-bold text-white mb-4 flex items-center gap-2.5 ${className}`}
    >
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
      )}
      {title}
    </h1>
  )
}
