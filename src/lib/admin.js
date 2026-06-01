import { supabase } from './supabase'

export async function logAdminAction(action, targetUserId = null) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not authenticated') }

  return supabase.from('admin_logs').insert({
    action,
    performed_by: user.id,
    target_user_id: targetUserId,
  })
}

export async function adminListUsers() {
  return supabase.rpc('admin_list_users')
}

export async function adminUpdateUserMetadata(targetUserId, patch) {
  return supabase.rpc('admin_update_user_metadata', {
    p_target_user_id: targetUserId,
    p_patch: patch,
  })
}

export async function adminResetWallet(targetUserId) {
  const res = await supabase.rpc('admin_reset_wallet', {
    p_target_user_id: targetUserId,
  })
  if (!res.error) {
    await logAdminAction('RESET_WALLET', targetUserId)
  }
  return res
}

export async function adminDeleteUser(targetUserId) {
  const res = await supabase.rpc('admin_delete_user', {
    p_target_user_id: targetUserId,
  })
  if (!res.error) {
    await logAdminAction('DELETE_ACCOUNT', targetUserId)
  }
  return res
}

export async function adminDashboardStats() {
  return supabase.rpc('admin_dashboard_stats')
}

export async function adminAnalyticsData() {
  return supabase.rpc('admin_analytics_data')
}

export async function approveFundRequest(request, adminNote = '') {
  const { data: wallet, error: wErr } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', request.user_id)
    .single()

  if (wErr) return { error: wErr }

  const amount = Number(request.amount)
  const newBalance = Number(wallet.balance) + amount
  const newTotalDeposited =
    Number(wallet.total_deposited ?? 10000) + amount

  const { data: updated, error: reqErr } = await supabase
    .from('fund_requests')
    .update({
      status: 'approved',
      admin_note: adminNote || 'Approved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', request.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (reqErr) return { error: reqErr }
  if (!updated) return { error: new Error('Request already processed') }

  const { error: walletErr } = await supabase
    .from('wallets')
    .update({ balance: newBalance, total_deposited: newTotalDeposited })
    .eq('user_id', request.user_id)

  if (walletErr) {
    await supabase
      .from('fund_requests')
      .update({ status: 'pending', admin_note: null, resolved_at: null })
      .eq('id', request.id)
    return { error: walletErr }
  }

  await logAdminAction(`APPROVE_FUND_REQUEST $${request.amount}`, request.user_id)
  return { error: null }
}

export async function rejectFundRequest(requestId, userId, reason) {
  const { error } = await supabase
    .from('fund_requests')
    .update({
      status: 'rejected',
      admin_note: reason,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (!error) {
    await logAdminAction(`REJECT_FUND_REQUEST: ${reason}`, userId)
  }

  return { error }
}
