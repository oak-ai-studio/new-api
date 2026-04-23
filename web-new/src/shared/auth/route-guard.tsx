"use client"

import { Navigate, useLocation } from "react-router-dom"

import { getSessionUser, isAdmin } from "./session"

export function PrivateRoute({ children }: { children: React.ReactElement }) {
  const location = useLocation()
  const user = getSessionUser()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function AdminRoute({ children }: { children: React.ReactElement }) {
  const location = useLocation()
  const user = getSessionUser()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!isAdmin(user)) {
    return <Navigate to="/forbidden" replace />
  }
  return children
}
