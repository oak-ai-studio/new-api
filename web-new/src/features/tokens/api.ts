import { api, unwrap } from "@/shared/api/client"
import type { Paged } from "@/shared/api/types"

export type TokenItem = {
  id: number
  name: string
  key: string
  status: number
  remain_quota: number
  used_quota?: number
  allow_ips?: string | null
  model_limits_enabled?: boolean
  model_limits?: string
  cross_group_retry?: boolean
  created_time?: number
  accessed_time?: number
  expired_time: number
  unlimited_quota?: boolean
  group: string
}

export async function listTokens(page: number, pageSize: number) {
  return unwrap<Paged<TokenItem>>(api.get(`/api/token/?p=${page}&page_size=${pageSize}`))
}

export async function addToken(payload: {
  name: string
  remain_quota: number
  expired_time: number
  unlimited_quota: boolean
  group: string
}) {
  return unwrap(api.post("/api/token/", payload))
}

export async function updateToken(payload: {
  id: number
  name: string
  status: number
  remain_quota: number
  expired_time: number
  unlimited_quota: boolean
  group: string
  allow_ips?: string | null
  model_limits_enabled?: boolean
  model_limits?: string
  cross_group_retry?: boolean
}) {
  return unwrap(api.put("/api/token/", payload))
}

export async function setTokenStatus(payload: { id: number; status: number }) {
  return unwrap(api.put("/api/token/?status_only=true", payload))
}

export type UserGroupMeta = {
  ratio: number | string
  desc?: string
}

export async function getUserGroups() {
  return unwrap<Record<string, UserGroupMeta>>(api.get("/api/user/self/groups"))
}

export async function getSystemStatus() {
  return unwrap<{ quota_per_unit?: number }>(api.get("/api/status"))
}

export async function deleteToken(id: number) {
  return unwrap(api.delete(`/api/token/${id}`))
}

export async function getTokenKey(id: number) {
  return unwrap<{ key: string }>(api.post(`/api/token/${id}/key`))
}
