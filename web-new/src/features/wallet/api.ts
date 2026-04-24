import { api, unwrap } from "@/shared/api/client"
import type { QuotaDisplayStatus } from "@/shared/quota-display"

export type WalletProfile = {
  id: number
  username: string
  quota?: number
  used_quota?: number
  group?: string
}

type StatusPayload = QuotaDisplayStatus & {
  top_up_link?: string
}

export async function getWalletProfile() {
  return unwrap<WalletProfile>(api.get("/api/user/self"))
}

export async function getTopupStatus() {
  return unwrap<StatusPayload>(api.get("/api/status"))
}

export async function redeemTopupCode(code: string) {
  return unwrap<number>(api.post("/api/user/topup", { key: code }))
}
