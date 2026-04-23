import { api, unwrap } from "@/shared/api/client"
import type { Paged } from "@/shared/api/types"

export type Channel = {
  id: number
  name: string
  type: number
  status: number
  group: string
  models: string
}

export async function listChannels(page: number, pageSize: number) {
  return unwrap<Paged<Channel>>(api.get(`/api/channel?p=${page}&page_size=${pageSize}`))
}

export async function setChannelStatus(id: number, status: number) {
  return unwrap(api.put("/api/channel", { id, status }))
}

export async function deleteChannel(id: number) {
  return unwrap(api.delete(`/api/channel/${id}`))
}
