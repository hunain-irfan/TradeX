export default function DashboardStatCard({ label, value, valueClassName = 'text-white', icon: Icon }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 border-[3px]">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        )}
        <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider font-mono">
          {label}
        </span>
      </div>
      <span
        className={`text-[24px] font-bold block mt-2 font-mono tracking-tight ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  )
}
