import { api, unwrap } from "@/shared/api/client"
import type { Paged } from "@/shared/api/types"

export type ModelMeta = {
  id: number
  model_name: string
  status: number
  vendor_id?: number
  quota_type?: number
}

export async function listModels(page: number, pageSize: number) {
  return unwrap<Paged<ModelMeta>>(api.get(`/api/models/?p=${page}&page_size=${pageSize}`))
}

export async function setModelStatus(id: number, status: number) {
  return unwrap(api.put("/api/models/?status_only=true", { id, status }))
}
