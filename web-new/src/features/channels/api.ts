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

export type CreateChannelPayload = {
  mode: "single"
  channel: {
    name: string
    type: number
    key: string
    group: string
    models: string
    auto_ban: number
    base_url?: string
  }
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

export async function createChannel(payload: CreateChannelPayload) {
  return unwrap(api.post("/api/channel", payload))
}
