"use client"

import { Navigate, Route, Routes } from "react-router-dom"

import { ChannelsPage } from "@/features/channels/page"
import { LogsPage } from "@/features/logs/page"
import { ModelsPage } from "@/features/models/page"
import { PermissionsPage } from "@/features/permissions/page"
import { PricingPage } from "@/features/pricing/page"
import { TokensPage } from "@/features/tokens/page"
import { UsersPage } from "@/features/users/page"
import { AdminRoute, PrivateRoute } from "@/shared/auth/route-guard"
import { getSessionUser, isAdmin } from "@/shared/auth/session"

import { ConsoleLayout } from "./console-layout"
import { ForbiddenPage } from "./screens/forbidden-page"
import { LoginPage } from "./screens/login-page"
import { RegisterPage } from "./screens/register-page"

function ConsoleIndexRedirect() {
  const user = getSessionUser()
  return <Navigate to={isAdmin(user) ? "/console/channels" : "/console/tokens"} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route
        path="/console"
        element={
          <PrivateRoute>
            <ConsoleLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ConsoleIndexRedirect />} />
        <Route
          path="channels"
          element={
            <AdminRoute>
              <ChannelsPage />
            </AdminRoute>
          }
        />
        <Route
          path="models"
          element={
            <AdminRoute>
              <ModelsPage />
            </AdminRoute>
          }
        />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="tokens" element={<TokensPage />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="permissions"
          element={
            <AdminRoute>
              <PermissionsPage />
            </AdminRoute>
          }
        />
        <Route path="logs" element={<LogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
