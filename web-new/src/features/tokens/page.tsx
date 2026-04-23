"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSessionUser } from "@/shared/auth/session"

import { addToken, deleteToken, getTokenKey, listTokens, updateToken } from "./api"

export function TokensPage() {
  const [page, setPage] = useState(1)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [revealedKeys, setRevealedKeys] = useState<Record<number, string>>({})
  const [loadingKeys, setLoadingKeys] = useState<Record<number, boolean>>({})
  const qc = useQueryClient()
  const pageSize = 20

  const handleRevealKey = async (tokenId: number) => {
    setError("")
    setSuccess("")
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
      setError(err instanceof Error ? err.message : "获取密钥失败")
    } finally {
      setLoadingKeys((prev) => ({ ...prev, [tokenId]: false }))
    }
  }

  const handleCopyKey = async (tokenId: number) => {
    setError("")
    setSuccess("")
    try {
      const resolved = revealedKeys[tokenId]
      const fullKey = resolved || `sk-${(await getTokenKey(tokenId)).key}`
      await navigator.clipboard.writeText(fullKey)
      if (!resolved) {
        setRevealedKeys((prev) => ({ ...prev, [tokenId]: fullKey }))
      }
      setSuccess("已复制完整密钥")
    } catch (err) {
      setError(err instanceof Error ? err.message : "复制失败")
    }
  }

  const query = useQuery({
    queryKey: ["tokens", page],
    queryFn: () => listTokens(page, pageSize),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户 API Key 管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="新 Token 名称" value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            onClick={async () => {
              setError("")
              setSuccess("")
              if (!name.trim()) {
                setError("请输入 API Key 名称")
                return
              }
              setCreating(true)
              try {
                const user = getSessionUser()
                await addToken({
                  name: name.trim(),
                  remain_quota: 500000,
                  expired_time: -1,
                  unlimited_quota: false,
                  group: user?.group || "default",
                })
                setName("")
                setSuccess("创建成功")
                await qc.invalidateQueries({ queryKey: ["tokens"] })
              } catch (err) {
                setError(err instanceof Error ? err.message : "创建失败，请稍后重试")
              } finally {
                setCreating(false)
              }
            }}
            disabled={creating}
          >
            {creating ? "创建中..." : "创建"}
          </Button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <div className="overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>掩码 Key</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>剩余额度</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items || []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell className="max-w-[280px] truncate" title={revealedKeys[t.id] || t.key}>
                    {revealedKeys[t.id] || t.key}
                  </TableCell>
                  <TableCell>{t.status === 1 ? "启用" : "禁用"}</TableCell>
                  <TableCell>{t.remain_quota}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleRevealKey(t.id)}
                      disabled={!!loadingKeys[t.id]}
                    >
                      {loadingKeys[t.id]
                        ? "读取中..."
                        : revealedKeys[t.id]
                          ? "隐藏密钥"
                          : "查看密钥"}
                    </Button>
                    <Button variant="outline" onClick={() => handleCopyKey(t.id)}>
                      复制密钥
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await updateToken({
                          id: t.id,
                          name: t.name,
                          remain_quota: t.remain_quota,
                          expired_time: t.expired_time,
                          unlimited_quota: false,
                          group: t.group || "",
                          status: t.status === 1 ? 2 : 1,
                        })
                        await qc.invalidateQueries({ queryKey: ["tokens"] })
                      }}
                    >
                      {t.status === 1 ? "禁用" : "启用"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await deleteToken(t.id)
                        await qc.invalidateQueries({ queryKey: ["tokens"] })
                      }}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            上一页
          </Button>
          <Button
            variant="outline"
            disabled={(query.data?.items?.length || 0) < pageSize}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
