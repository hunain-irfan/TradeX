export default function DashboardStatCard({ label, value, valueClassName = 'text-white' }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 ">
      <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider font-mono block">
        {label}
      </span>
      <span
        className={`text-[24px] font-bold block mt-2 font-mono tracking-tight ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  )
}
