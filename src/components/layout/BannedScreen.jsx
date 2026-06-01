import { supabase } from '../../lib/supabase'
import Logo from './Logo'

export default function BannedScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 px-4">
      <Logo to="/" link={false} className="h-7 w-auto max-w-[120px]" />
      <h1 className="text-2xl font-bold text-red-500">Account Banned</h1>
      <p className="text-gray-400 text-center max-w-md">
        Your account has been suspended. Contact support if you believe this is an error.
      </p>
      <button type="button" onClick={handleSignOut} className="primary-btn">
        Sign Out
      </button>
    </div>
  )
}
