import { api, unwrap } from "@/shared/api/client"
import type { Paged } from "@/shared/api/types"

export type ModelMeta = {
  id: number
  model_name: string
  status: number
  icon?: string
  vendor_id?: number
  quota_type?: number
}

export type CreateModelPayload = {
  model_name: string
  description?: string
  icon?: string
  tags?: string
  endpoints?: string
  vendor_id?: number
  name_rule?: number
  status?: number
  sync_official?: number
}

export async function listModels(page: number, pageSize: number) {
  return unwrap<Paged<ModelMeta>>(api.get(`/api/models?p=${page}&page_size=${pageSize}`))
}

export async function setModelStatus(id: number, status: number) {
  return unwrap(api.put("/api/models?status_only=true", { id, status }))
}

export async function createModel(payload: CreateModelPayload) {
  return unwrap(api.post("/api/models", payload))
}

export async function searchModels(keyword: string, page: number, pageSize: number) {
  const encoded = encodeURIComponent(keyword)
  return unwrap<Paged<ModelMeta>>(
    api.get(`/api/models/search?keyword=${encoded}&p=${page}&page_size=${pageSize}`)
  )
}

export async function deleteModel(id: number) {
  return unwrap(api.delete(`/api/models/${id}`))
}
