import { api, unwrap } from "@/shared/api/client"
import type { Paged } from "@/shared/api/types"

export type UserItem = {
  id: number
  username: string
  role: number
  status: number
  group: string
  quota: number
}

export async function listUsers(page: number, pageSize: number) {
  return unwrap<Paged<UserItem>>(api.get(`/api/user/?p=${page}&page_size=${pageSize}`))
}

export async function manageUser(id: number, action: string) {
  return unwrap(api.post("/api/user/manage", { id, action }))
}
