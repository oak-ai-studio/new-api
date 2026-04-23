export type SessionUser = {
  id: number
  username: string
  role: number
  group?: string
  token?: string
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function isAdmin(user: SessionUser | null) {
  return !!user && user.role >= 10
}
