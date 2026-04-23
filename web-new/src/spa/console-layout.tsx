"use client"

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  BadgeCheckIcon,
  BookOpenTextIcon,
  ChevronsUpDownIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
  KeyRoundIcon,
  LayoutListIcon,
  LogOutIcon,
  LogsIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
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
  const isMobile = useIsMobile()
  const displayName = user?.username || "shadcn"
  const displayEmail = `${displayName}@example.com`

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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="https://github.com/shadcn.png" alt={displayName} />
                      <AvatarFallback className="rounded-lg">{displayName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{displayName}</span>
                      <span className="truncate text-xs">{displayEmail}</span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="https://github.com/shadcn.png" alt={displayName} />
                        <AvatarFallback className="rounded-lg">{displayName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{displayName}</span>
                        <span className="truncate text-xs">{displayEmail}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <SparklesIcon />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BadgeCheckIcon />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCardIcon />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b border-border bg-background px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="mx-auto min-w-0 w-full max-w-7xl flex-1 px-4 py-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
