"use client"

import { useEffect, useMemo, useState } from "react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { EllipsisIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { deleteChannel, listChannels, setChannelStatus } from "./api"
import { AddChannelDialog } from "./add-channel-dialog"
import { CHANNEL_TYPE_OPTIONS, getChannelTypeMeta } from "./channel-types"

export function ChannelsPage() {
  const pageSize = 20
  const [keyword, setKeyword] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const qc = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: ["channels", pageSize],
    queryFn: ({ pageParam }) => listChannels(pageParam, pageSize),
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

  const allItems = useMemo(
    () => query.data?.pages.flatMap((page) => page.items || []) || [],
    [query.data?.pages],
  )
  const items = allItems.filter((x) => {
    const name = x.name || ""
    const matchesKeyword = keyword ? name.toLowerCase().includes(keyword.toLowerCase()) : true
    const matchesType = typeFilter === "all" ? true : x.type === Number(typeFilter)
    const matchesStatus = statusFilter === "all" ? true : x.status === Number(statusFilter)
    return matchesKeyword && matchesType && matchesStatus
  })
  const errorMessage = query.error instanceof Error ? query.error.message : ""

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">渠道配置</h1>
          <p className="text-sm text-muted-foreground">管理渠道类型、状态、分组和可用模型</p>
        </div>
        <AddChannelDialog
          onCreated={async () => {
            await qc.invalidateQueries({ queryKey: ["channels"] })
          }}
        />
      </div>

      <Card className="rounded-xl">
        <CardContent className="space-y-3 pt-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              className="h-9 md:col-span-2"
              placeholder="按名称过滤"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="渠道类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {CHANNEL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="渠道状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="1">启用</SelectItem>
                <SelectItem value="2">禁用</SelectItem>
                <SelectItem value="3">自动禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>分组</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      加载中...
                    </TableCell>
                  </TableRow>
                )}
                {errorMessage && !query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-red-600">
                      {errorMessage}
                    </TableCell>
                  </TableRow>
                )}
                {items.map((ch) => (
                  <TableRow key={ch.id}>
                    <TableCell>{ch.id}</TableCell>
                    <TableCell>{ch.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getChannelTypeMeta(ch.type).className}>
                        {getChannelTypeMeta(ch.type).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{ch.status === 1 ? "启用" : "禁用"}</TableCell>
                    <TableCell>{ch.group}</TableCell>
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
                              await setChannelStatus(ch.id, ch.status === 1 ? 2 : 1)
                              await qc.invalidateQueries({ queryKey: ["channels"] })
                            }}
                          >
                            {ch.status === 1 ? "禁用" : "启用"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              await deleteChannel(ch.id)
                              await qc.invalidateQueries({ queryKey: ["channels"] })
                            }}
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!query.isLoading && !errorMessage && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      暂无渠道数据
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
