import { api } from "@/shared/api/client"

export type PricingItem = {
  model_name: string
  description?: string
  quota_type: number
  model_ratio?: number
  model_price?: number
  vendor_id?: number
  tags?: string
}

export type PricingVendor = {
  id: number
  name: string
  description?: string
  icon?: string
}

export type PricingResponse = {
  items: PricingItem[]
  vendors: PricingVendor[]
  group_ratio: Record<string, number>
  usable_group: Record<string, unknown>
}

export async function getPricing() {
  const resp = await api.get("/api/pricing")
  const payload = resp?.data
  if (!payload?.success) {
    throw new Error(payload?.message || "获取定价失败")
  }
  return {
    items: (payload.data || []) as PricingItem[],
    vendors: (payload.vendors || []) as PricingVendor[],
    group_ratio: (payload.group_ratio || {}) as Record<string, number>,
    usable_group: (payload.usable_group || {}) as Record<string, unknown>,
  } satisfies PricingResponse
}
