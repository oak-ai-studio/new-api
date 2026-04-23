import axios from "axios"

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
})

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config
  }
  const raw = localStorage.getItem("user")
  if (!raw) return config
  try {
    const user = JSON.parse(raw)
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    if (user?.id) {
      config.headers["New-API-User"] = user.id
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
