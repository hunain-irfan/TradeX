import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { authRedirectUrl, AUTH_PATHS } from '../lib/authRedirect'
import { getAppHomePath } from '../lib/authPaths'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const role = user?.user_metadata?.role ?? 'user'
  const isAdmin = role === 'admin'
  const isBanned = user?.user_metadata?.is_banned === true
  const isFrozen = user?.user_metadata?.is_frozen === true
  const isEmailVerified = Boolean(user?.email_confirmed_at)

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const signUp = useCallback(async (email, password, displayName) => {
    const trimmedName = displayName?.trim()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authRedirectUrl(AUTH_PATHS.afterConfirm),
        data: trimmedName
          ? { display_name: trimmedName }
          : undefined,
      },
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  const resetPasswordForEmail = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl(AUTH_PATHS.afterReset),
    })
    return { data, error }
  }, [])

  const resendSignupConfirmation = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: authRedirectUrl(AUTH_PATHS.afterConfirm),
      },
    })
    return { data, error }
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    return { data, error }
  }, [])

  const updateProfile = useCallback(async ({ displayName, preferences } = {}) => {
    const meta = user?.user_metadata ?? {}
    const data = { ...meta }

    if (displayName !== undefined) {
      data.display_name = displayName.trim() || null
    }
    if (preferences !== undefined) {
      data.preferences = { ...(meta.preferences ?? {}), ...preferences }
    }

    const { data: result, error } = await supabase.auth.updateUser({ data })
    if (!error && result?.user) {
      setUser(result.user)
      setSession((s) => (s ? { ...s, user: result.user } : s))
    }
    return { data: result, error }
  }, [user])

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authRedirectUrl(getAppHomePath(false)),
      },
    })
    return { data, error }
  }, [])

  return {
    user,
    session,
    role,
    isAdmin,
    isBanned,
    isFrozen,
    isEmailVerified,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    resendSignupConfirmation,
    updatePassword,
    updateProfile,
    signInWithGoogle,
  }
}
