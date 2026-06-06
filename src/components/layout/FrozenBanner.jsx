import { Lock } from '../../lib/navIcons'

export default function FrozenBanner() {
  return (
    <div
      className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5"
      role="status"
    >
      <p className="container flex items-center justify-center gap-2 text-amber-400 text-sm text-center">
        <Lock className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
        Your account is frozen — browsing is allowed but trading is disabled. Contact support if
        this is unexpected.
      </p>
    </div>
  )
}
