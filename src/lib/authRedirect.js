/** Base URL for Supabase auth email links (must match Dashboard → URL Configuration). */
export function authRedirectUrl(path) {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}${path}`
}

export const AUTH_PATHS = {
  afterConfirm: '/login',
  afterReset: '/reset-password',
}
