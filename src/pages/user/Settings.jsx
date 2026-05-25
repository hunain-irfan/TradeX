import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import PageHeader from '../../components/ui/PageHeader'
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  LogOut,
} from '../../lib/navIcons'

const SECTIONS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'preferences', label: 'Preferences', icon: Bell },
]

function SettingsPanel({ id, title, description, children }) {
  return (
    <section id={id} className="dashboard-card space-y-4 scroll-mt-24">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer group">
      <span className="min-w-0">
        <span className="text-white text-sm font-medium block">{label}</span>
        {description && <span className="text-gray-500 text-xs mt-0.5 block">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
          checked ? 'bg-primary-500' : 'bg-gray-600'
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const {
    user,
    isEmailVerified,
    updateProfile,
    updatePassword,
    resendSignupConfirmation,
    signOut,
  } = useAuth()

  const prefs = user?.user_metadata?.preferences ?? {}

  const [displayName, setDisplayName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErr, setProfileErr] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [passwordErr, setPasswordErr] = useState(null)

  const [emailAlerts, setEmailAlerts] = useState(prefs.email_alerts !== false)
  const [tradeConfirm, setTradeConfirm] = useState(prefs.trade_confirm !== false)
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsMsg, setPrefsMsg] = useState(null)

  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState(null)

  useEffect(() => {
    setDisplayName(user?.user_metadata?.display_name ?? '')
    setEmailAlerts(prefs.email_alerts !== false)
    setTradeConfirm(prefs.trade_confirm !== false)
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)
    setProfileErr(null)

    const { error } = await updateProfile({ displayName })
    if (error) setProfileErr(error.message)
    else setProfileMsg('Profile updated successfully.')

    setProfileSaving(false)
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    setPasswordMsg(null)
    setPasswordErr(null)

    if (newPassword.length < 6) {
      setPasswordErr('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('Passwords do not match.')
      return
    }

    setPasswordSaving(true)
    const { error } = await updatePassword(newPassword)
    if (error) setPasswordErr(error.message)
    else {
      setPasswordMsg('Password updated successfully.')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  const savePreferences = async (next) => {
    setPrefsSaving(true)
    setPrefsMsg(null)
    const { error } = await updateProfile({ preferences: next })
    if (!error) setPrefsMsg('Preferences saved.')
    setPrefsSaving(false)
  }

  const handleEmailAlerts = async (v) => {
    setEmailAlerts(v)
    await savePreferences({ email_alerts: v })
  }

  const handleTradeConfirm = async (v) => {
    setTradeConfirm(v)
    await savePreferences({ trade_confirm: v })
  }

  const handleResend = async () => {
    if (!user?.email) return
    setResendLoading(true)
    setResendMsg(null)
    const { error } = await resendSignupConfirmation(user.email)
    setResendMsg(error ? error.message : 'Confirmation email sent — check your inbox.')
    setResendLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="container pt-6 pb-16 space-y-6">
      <PageHeader title="Settings" icon={SettingsIcon} />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        <nav className="dashboard-card p-3 lg:sticky lg:top-[68px] space-y-1 hidden lg:block">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 text-sm font-medium transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
              {label}
            </a>
          ))}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-primary-400 hover:bg-primary-500/10 text-sm font-medium mt-2"
          >
            View profile
          </Link>
        </nav>

        <div className="space-y-6">
          <SettingsPanel
            id="account"
            title="Account"
            description="Your public name and email shown across TradeX."
          >
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm">Display name</label>
                <input
                  type="text"
                  className="form-input w-full mt-1"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={48}
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm">Email</label>
                <input
                  type="email"
                  className="form-input w-full mt-1 opacity-70 cursor-not-allowed"
                  value={user?.email ?? ''}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed here. Contact support if you need a new address.
                </p>
              </div>
              {!isEmailVerified && (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                  <p className="text-orange-400 text-sm font-medium">Email not verified</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Confirm your email to unlock full trading access.
                  </p>
                  <button
                    type="button"
                    className="secondary-btn mt-3 text-xs h-8"
                    onClick={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Sending…' : 'Resend confirmation'}
                  </button>
                  {resendMsg && <p className="text-xs text-gray-400 mt-2">{resendMsg}</p>}
                </div>
              )}
              {profileErr && <p className="text-red-500 text-sm">{profileErr}</p>}
              {profileMsg && <p className="text-green-500 text-sm">{profileMsg}</p>}
              <button type="submit" className="primary-btn" disabled={profileSaving}>
                {profileSaving ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </SettingsPanel>

          <SettingsPanel
            id="security"
            title="Security"
            description="Update your password while signed in."
          >
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm">New password</label>
                <input
                  type="password"
                  className="form-input w-full mt-1"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm">Confirm password</label>
                <input
                  type="password"
                  className="form-input w-full mt-1"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {passwordErr && <p className="text-red-500 text-sm">{passwordErr}</p>}
              {passwordMsg && <p className="text-green-500 text-sm">{passwordMsg}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="primary-btn" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating…' : 'Update password'}
                </button>
                <Link to="/forgot-password" className="secondary-btn">
                  Forgot password?
                </Link>
              </div>
            </form>
          </SettingsPanel>

          <SettingsPanel
            id="preferences"
            title="Preferences"
            description="Control notifications and trading prompts."
          >
            <div className="space-y-5">
              <Toggle
                label="Email notifications"
                description="Product updates and account alerts (when enabled)."
                checked={emailAlerts}
                onChange={handleEmailAlerts}
                disabled={prefsSaving}
              />
              <Toggle
                label="Confirm before trades"
                description="Show an extra confirmation step on buy/sell (coming soon)."
                checked={tradeConfirm}
                onChange={handleTradeConfirm}
                disabled={prefsSaving}
              />
              {prefsMsg && <p className="text-green-500 text-sm">{prefsMsg}</p>}
            </div>
          </SettingsPanel>

          <section className="dashboard-card border-red-500/20">
            <h2 className="text-lg font-semibold text-white">Session</h2>
            <p className="text-gray-500 text-sm mt-1 mb-4">Sign out on this device.</p>
            <button type="button" className="secondary-btn gap-2 text-red-400 hover:text-red-300" onClick={handleLogout}>
              <LogOut className="w-4 h-4" strokeWidth={2} aria-hidden />
              Log out
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
