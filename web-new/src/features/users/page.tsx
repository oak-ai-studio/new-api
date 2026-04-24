"use client"

import { useEffect, useMemo } from "react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { EllipsisIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { listUsers, manageUser } from "./api"

export function UsersPage() {
  const pageSize = 20
  const qc = useQueryClient()
  const query = useInfiniteQuery({
    queryKey: ["users", pageSize],
    queryFn: ({ pageParam }) => listUsers(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const total = Number(lastPage.total || 0)
      const loaded = allPages.reduce((sum, page) => sum + (page.items?.length || 0), 0)
      if (loaded >= total) return undefined
      const currentPage = Number(lastPage.page || allPages.length)
      return currentPage + 1
    },
  })
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  const errorMessage = query.error instanceof Error ? query.error.message : ""

  useEffect(() => {
    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return
      const scrollBottom = window.innerHeight + window.scrollY
      const threshold = document.documentElement.scrollHeight - 180
      if (scrollBottom >= threshold) {
        fetchNextPage()
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items || []) || [],
    [query.data?.pages],
  )

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold">用户管理</h1>
        <p className="text-sm text-muted-foreground">查看用户信息，并进行启用、禁用和权限调整</p>
      </div>
      <Card className="rounded-xl">
        <CardContent className="space-y-3 pt-5">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>分组</TableHead>
                  <TableHead>额度</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500">
                      加载中...
                    </TableCell>
                  </TableRow>
                )}
                {errorMessage && !query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-600">
                      {errorMessage}
                    </TableCell>
                  </TableRow>
                )}
                {items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.status}</TableCell>
                    <TableCell>{u.group}</TableCell>
                    <TableCell>{u.quota}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="actions">
                            <EllipsisIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={async () => {
                              await manageUser(u.id, u.status === 1 ? "disable" : "enable")
                              await qc.invalidateQueries({ queryKey: ["users"] })
                            }}
                          >
                            {u.status === 1 ? "禁用" : "启用"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              await manageUser(u.id, u.role >= 10 ? "demote" : "promote")
                              await qc.invalidateQueries({ queryKey: ["users"] })
                            }}
                          >
                            {u.role >= 10 ? "降权" : "升权"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!query.isLoading && !errorMessage && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500">
                      暂无用户数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {query.isFetchingNextPage && (
            <div className="text-center text-xs text-muted-foreground">加载更多中...</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
