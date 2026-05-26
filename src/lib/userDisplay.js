/** Leaderboard / trader label from profile metadata or email fallback. */
export function getTraderDisplayName(row) {
  const fromMeta = row?.display_name?.trim()
  if (fromMeta) return fromMeta
  const email = row?.user_email ?? row?.email
  return email?.split('@')[0] ?? 'Trader'
}
