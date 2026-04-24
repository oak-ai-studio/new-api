import { api, unwrap } from "@/shared/api/client"

export type SelfPayload = {
  id: number
  username: string
  role: number
  permissions?: Record<string, unknown>
  capabilities?: Record<string, boolean>
  sidebar_modules?: string
}

export async function getSelf() {
  return unwrap<SelfPayload>(api.get("/api/user/self"))
}

export async function updateSidebarModules(sidebarModules: string) {
  return unwrap(api.put("/api/user/self", { sidebar_modules: sidebarModules }))
}
