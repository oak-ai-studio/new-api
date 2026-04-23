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

import { deleteChannel, listChannels, setChannelStatus } from "./api"

export function ChannelsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [keyword, setKeyword] = useState("")
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["channels", page, pageSize],
    queryFn: () => listChannels(page, pageSize),
  })

  const items = (query.data?.items || []).filter((x) => {
    const name = x.name || ""
    return keyword ? name.toLowerCase().includes(keyword.toLowerCase()) : true
  })
  const errorMessage = query.error instanceof Error ? query.error.message : ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>渠道配置（AI Gateway）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="按名称过滤"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>操作</TableHead>
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
                  <TableCell>{ch.type}</TableCell>
                  <TableCell>{ch.status === 1 ? "启用" : "禁用"}</TableCell>
                  <TableCell>{ch.group}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await setChannelStatus(ch.id, ch.status === 1 ? 2 : 1)
                        await qc.invalidateQueries({ queryKey: ["channels"] })
                      }}
                    >
                      {ch.status === 1 ? "禁用" : "启用"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await deleteChannel(ch.id)
                        await qc.invalidateQueries({ queryKey: ["channels"] })
                      }}
                    >
                      删除
                    </Button>
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
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>总数：{query.data?.total || 0}</span>
          <div className="space-x-2">
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
        </div>
      </CardContent>
    </Card>
  )
}
