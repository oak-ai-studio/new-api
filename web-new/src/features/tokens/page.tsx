"use client"

import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, EllipsisIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSessionUser } from "@/shared/auth/session"
import { AddTokenDialog } from "./add-token-dialog"
import { EditTokenDialog } from "./edit-token-dialog"

import { deleteToken, getTokenKey, listTokens, setTokenStatus, type TokenItem } from "./api"

function formatTokenTime(ts?: number) {
  if (!ts || ts <= 0) return "-"
  const raw = Number(ts)
  const millis = raw > 1_000_000_000_000 ? raw : raw * 1000
  const d = new Date(millis)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("zh-CN", { hour12: false })
}

function formatTotalQuota(remain: number, used?: number, unlimited?: boolean) {
  if (unlimited) return "无限制"
  const total = Number(remain || 0) + Number(used || 0)
  return total.toLocaleString("zh-CN")
}

function formatIpLimit(allowIps?: string | null) {
  if (!allowIps) return "无限制"
  const list = allowIps
    .split("\n")
    .map((it) => it.trim())
    .filter(Boolean)
  if (list.length === 0) return "无限制"
  if (list.length === 1) return list[0]
  return `${list[0]} 等 ${list.length} 条`
}

export function TokensPage() {
  const user = getSessionUser()
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all")
  const [revealedKeys, setRevealedKeys] = useState<Record<number, string>>({})
  const [loadingKeys, setLoadingKeys] = useState<Record<number, boolean>>({})
  const [editingToken, setEditingToken] = useState<TokenItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const qc = useQueryClient()
  const pageSize = 20

  const handleRevealKey = async (tokenId: number) => {
    if (revealedKeys[tokenId]) {
      setRevealedKeys((prev) => {
        const next = { ...prev }
        delete next[tokenId]
        return next
      })
      return
    }

    setLoadingKeys((prev) => ({ ...prev, [tokenId]: true }))
    try {
      const data = await getTokenKey(tokenId)
      setRevealedKeys((prev) => ({ ...prev, [tokenId]: `sk-${data.key}` }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "获取密钥失败")
    } finally {
      setLoadingKeys((prev) => ({ ...prev, [tokenId]: false }))
    }
  }

  const handleCopyKey = async (tokenId: number) => {
    try {
      const resolved = revealedKeys[tokenId]
      const fullKey = resolved || `sk-${(await getTokenKey(tokenId)).key}`
      await navigator.clipboard.writeText(fullKey)
      if (!resolved) {
        setRevealedKeys((prev) => ({ ...prev, [tokenId]: fullKey }))
      }
      toast.success("已复制完整密钥")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "复制失败")
    }
  }

  const query = useQuery({
    queryKey: ["tokens", 1],
    queryFn: () => listTokens(1, pageSize),
  })

  const allItems = query.data?.items || []
  const filteredItems = useMemo(() => {
    return allItems.filter((it) => {
      const statusMatched = statusFilter === "active" ? it.status === 1 : true
      return statusMatched
    })
  }, [allItems, statusFilter])

  const allCount = allItems.length
  const activeCount = allItems.filter((it) => it.status === 1).length

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            创建并管理 API 密钥，用于访问 Fierce Gateway
          </p>
        </div>
        <AddTokenDialog
          onCreated={async () => {
            toast.success("创建成功")
            await qc.invalidateQueries({ queryKey: ["tokens"] })
          }}
        />
      </div>

      <Card className="rounded-xl">
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "active")}
              className="gap-0"
            >
              <TabsList>
                <TabsTrigger value="all">
                  全部
                  <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-[11px]">
                    {allCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  启用中
                  <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-[11px]">
                    {activeCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>创建者</TableHead>
                  <TableHead>用量</TableHead>
                  <TableHead>限制</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      <div className="flex max-w-[320px] items-center gap-1.5">
                        <span className="truncate" title={revealedKeys[t.id] || t.key}>
                          {revealedKeys[t.id] || t.key}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="shrink-0"
                          onClick={() => handleCopyKey(t.id)}
                          aria-label="复制密钥"
                        >
                          <CopyIcon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.status === 1 ? "secondary" : "outline"}
                        className={t.status === 1 ? "text-emerald-600" : ""}
                      >
                        {t.status === 1 ? "启用" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTokenTime(t.created_time)}</TableCell>
                    <TableCell>{user?.username || "-"}</TableCell>
                    <TableCell>$0.00</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <p>IP 限制：{formatIpLimit(t.allow_ips)}</p>
                      <p>总额度限制：{formatTotalQuota(t.remain_quota, t.used_quota, t.unlimited_quota)}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="actions">
                            <EllipsisIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRevealKey(t.id)}
                            disabled={!!loadingKeys[t.id]}
                          >
                            {loadingKeys[t.id]
                              ? "读取中..."
                              : revealedKeys[t.id]
                                ? "隐藏密钥"
                                : "查看密钥"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingToken(t)
                              setEditOpen(true)
                            }}
                          >
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await setTokenStatus({
                                  id: t.id,
                                  status: t.status === 1 ? 2 : 1,
                                })
                                toast.success(t.status === 1 ? "已禁用" : "已启用")
                                await qc.invalidateQueries({ queryKey: ["tokens"] })
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "更新状态失败")
                              }
                            }}
                          >
                            {t.status === 1 ? "禁用" : "启用"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              try {
                                await deleteToken(t.id)
                                toast.success("删除成功")
                                await qc.invalidateQueries({ queryKey: ["tokens"] })
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "删除失败")
                              }
                            }}
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-20 text-center text-sm text-muted-foreground">
                      暂无 API Key 数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>
      <EditTokenDialog
        open={editOpen}
        token={editingToken}
        onOpenChange={setEditOpen}
        onUpdated={async () => {
          toast.success("更新成功")
          await qc.invalidateQueries({ queryKey: ["tokens"] })
        }}
      />
    </div>
  )
}
