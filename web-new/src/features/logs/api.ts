import { api, unwrap } from "@/shared/api/client"
import type { Paged } from "@/shared/api/types"

export type LogItem = {
  id: number
  created_at: number
  username?: string
  token_name?: string
  model_name?: string
  type: number
  quota: number
}

export async function listLogs(page: number, pageSize: number, admin: boolean) {
  const path = admin ? "/api/log" : "/api/log/self"
  return unwrap<Paged<LogItem>>(api.get(`${path}?p=${page}&page_size=${pageSize}`))
}
