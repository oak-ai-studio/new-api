export type QuotaDisplayStatus = {
  quota_per_unit?: number
  quota_display_type?: "USD" | "CNY" | "CUSTOM" | "TOKENS" | string
  usd_exchange_rate?: number
  custom_currency_symbol?: string
  custom_currency_exchange_rate?: number
}

export function formatQuotaDisplay(
  quota: number | undefined,
  status?: QuotaDisplayStatus,
  digits = 2,
): string {
  const numericQuota = Number(quota || 0)
  if (!Number.isFinite(numericQuota)) {
    return "--"
  }

  const displayType = status?.quota_display_type || "USD"
  if (displayType === "TOKENS") {
    return Math.round(numericQuota).toLocaleString()
  }

  const quotaPerUnit = Number(status?.quota_per_unit)
  const denominator = Number.isFinite(quotaPerUnit) && quotaPerUnit > 0 ? quotaPerUnit : 500000
  const usdAmount = numericQuota / denominator

  if (displayType === "CNY") {
    const usdRate = Number(status?.usd_exchange_rate)
    const rate = Number.isFinite(usdRate) && usdRate > 0 ? usdRate : 1
    return `¥${(usdAmount * rate).toFixed(digits)}`
  }
  if (displayType === "CUSTOM") {
    const symbol = status?.custom_currency_symbol || "¤"
    const customRate = Number(status?.custom_currency_exchange_rate)
    const rate = Number.isFinite(customRate) && customRate > 0 ? customRate : 1
    return `${symbol}${(usdAmount * rate).toFixed(digits)}`
  }
  return `$${usdAmount.toFixed(digits)}`
}
