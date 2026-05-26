/** HTML email body — TradeX theme (#2962FF primary, dark grays). */
export function buildPriceAlertEmail({
  alertName,
  stockSymbol,
  stockName,
  conditionLabel,
  threshold,
  currentPrice,
  changePct,
  appUrl = '',
}) {
  const dashboardUrl = appUrl ? `${appUrl}/dashboard` : '/dashboard'
  const isAbove = conditionLabel === 'Above'
  const bannerText = isAbove ? 'Price Above Reached' : 'Price Below Reached'
  const changeStr =
    changePct != null && !Number.isNaN(changePct)
      ? `${changePct >= 0 ? '+' : ''}${Number(changePct).toFixed(1)}%`
      : '—'
  const changeColor = Number(changePct) >= 0 ? '#00C853' : '#FF3B30'

  const bg = '#0A0A0A'
  const card = '#111111'
  const cardElevated = '#161616'
  const border = '#1E1E1E'
  const primary = '#2962FF'
  const textMuted = '#888888'
  const textBody = '#CCCCCC'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bg};font-family:Inter,Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <tr><td style="padding-bottom:20px;">
      <span style="font-size:22px;font-weight:700;color:#fff;">Trade</span><span style="font-size:22px;font-weight:700;color:${primary};">X</span>
    </td></tr>
    <tr><td style="background:${primary};border-radius:10px 10px 0 0;padding:20px;text-align:center;">
      <div style="font-size:18px;font-weight:700;">${bannerText}</div>
      <div style="font-size:12px;opacity:0.9;margin-top:6px;">${new Date().toLocaleString()}</div>
    </td></tr>
    <tr><td style="background:${cardElevated};padding:24px;text-align:center;border-left:1px solid ${border};border-right:1px solid ${border};">
      <div style="font-size:16px;font-weight:600;">${stockSymbol} — ${stockName}</div>
      <div style="font-size:13px;color:${textMuted};margin-top:8px;">Current Price:</div>
      <div style="font-size:32px;font-weight:700;color:#00C853;margin-top:4px;font-family:'Roboto Mono',monospace;">$${Number(currentPrice).toFixed(2)}</div>
    </td></tr>
    <tr><td style="background:${card};padding:20px;border:1px solid ${border};border-top:none;">
      <div style="font-weight:600;margin-bottom:12px;">Alert Details:</div>
      <p style="color:${textBody};font-size:14px;line-height:1.6;margin:0 0 12px;">
        Your alert <strong style="color:#fff;">${alertName}</strong> for <strong style="color:#fff;">${stockName} (${stockSymbol})</strong> just triggered:
      </p>
      <ul style="color:${textBody};font-size:14px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Condition: Price ${conditionLabel.toLowerCase()} $${Number(threshold).toFixed(2)}</li>
        <li>Current Price: <strong style="color:#fff;">$${Number(currentPrice).toFixed(2)}</strong></li>
        <li>Change: <span style="color:${changeColor};font-weight:600;">${changeStr}</span></li>
      </ul>
    </td></tr>
    <tr><td style="background:${cardElevated};padding:20px;border:1px solid ${border};border-top:none;border-radius:0 0 10px 10px;">
      <div style="color:${primary};font-weight:700;margin-bottom:8px;">Opportunity Alert</div>
      <p style="color:${textBody};font-size:14px;line-height:1.6;margin:0;">
        ${stockSymbol} has reached your target price. Review your position on TradeX and consider your next move.
      </p>
    </td></tr>
    <tr><td style="padding:24px 0;text-align:center;">
      <a href="${dashboardUrl}"
         style="display:inline-block;background:${primary};color:#fff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;">
        View Dashboard
      </a>
    </td></tr>
    <tr><td style="color:${textMuted};font-size:12px;line-height:1.6;text-align:center;padding-top:8px;">
      <p style="margin:0 0 8px;">Stay sharp,<br><strong style="color:#fff;">TradeX</strong></p>
      <p style="margin:0;">You're receiving this because you created a price alert on TradeX.</p>
      <p style="margin:8px 0 0;">© ${new Date().getFullYear()} TradeX</p>
    </td></tr>
  </table>
</body>
</html>`
}
