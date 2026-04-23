import axios from "axios"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const api = axios.create({
  // Keep dev mode same-origin (proxied by Next rewrites),
  // which avoids browser CORS preflight failures in local setup.
  baseURL: process.env.NODE_ENV === "development" ? "" : process.env.NEXT_PUBLIC_SERVER_URL || "",
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config
  }
  const raw = localStorage.getItem("user")
  if (!raw) return config
  try {
    const user = JSON.parse(raw)
    // New-API-User is required by backend auth flow for console APIs.
    if (user?.id) {
      config.headers["New-API-User"] = user.id
    }
    // Only send Authorization when user id is also present, to avoid
    // "missing New-Api-User" errors in stale localStorage states.
    if (user?.token && user?.id) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
  } catch {
    // ignore parse error
  }
  return config
})

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const msg = err?.response?.data?.message || err?.message || "请求失败，请稍后重试"
    return Promise.reject(new Error(msg))
  },
)

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise
  if (!data.success) {
    throw new Error(data.message || "接口返回失败")
  }
  return data.data
}
