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
  const candidates = admin
    ? ["/api/log", "/api/log/"]
    : ["/api/log/self", "/api/log/self/"]
  let lastError: unknown

  for (const path of candidates) {
    try {
      return await unwrap<Paged<LogItem>>(api.get(`${path}?p=${page}&page_size=${pageSize}`))
    } catch (error) {
      lastError = error
      // For non-network errors (auth, permission, business validation),
      // return immediately so users see the actual backend message.
      if (!(error instanceof Error) || !error.message.toLowerCase().includes("network")) {
        throw error
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }
  throw new Error("日志接口请求失败")
}
