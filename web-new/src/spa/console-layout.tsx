"use client"

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  BookOpenTextIcon,
  CircleDollarSignIcon,
  KeyRoundIcon,
  LayoutListIcon,
  LogsIcon,
  Settings2Icon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { api } from "@/shared/api/client"
import { getSessionUser, isAdmin } from "@/shared/auth/session"

const navItems = [
  { to: "/console/channels", label: "渠道配置", adminOnly: true, icon: Settings2Icon },
  { to: "/console/models", label: "模型管理", adminOnly: true, icon: LayoutListIcon },
  { to: "/console/pricing", label: "定价查看", icon: CircleDollarSignIcon },
  { to: "/console/tokens", label: "API Key", icon: KeyRoundIcon },
  { to: "/console/users", label: "用户管理", adminOnly: true, icon: UsersIcon },
  { to: "/console/permissions", label: "权限管理", adminOnly: true, icon: ShieldCheckIcon },
  { to: "/console/logs", label: "日志管理", icon: LogsIcon },
]

export function ConsoleLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getSessionUser()
  const admin = isAdmin(user)
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || admin)

  const handleLogout = async () => {
    try {
      await api.get("/api/user/logout")
    } catch {
      // ignore network/logout error and continue clearing local state
    } finally {
      localStorage.removeItem("user")
      navigate("/login", { replace: true })
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="模型控制台">
                <Link to="/console/pricing">
                  <BookOpenTextIcon />
                  <span>New API Console</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
            {visibleNavItems.map((item) => {
              const active = location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={active}>
                    <Link to={item.to}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex h-8 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">New API Console</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              className="text-sm text-muted-foreground"
              href="/console"
              target="_blank"
              rel="noreferrer"
            >
              旧版控制台
            </a>
            <Button variant="outline" className="h-8 px-3 text-xs" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </header>
        <main className="mx-auto min-w-0 w-full max-w-7xl flex-1 px-4 py-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
