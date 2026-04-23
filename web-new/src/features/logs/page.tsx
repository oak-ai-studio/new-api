"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSessionUser } from "@/shared/auth/session"

import { listLogs } from "./api"

export function LogsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const admin = (getSessionUser()?.role || 0) >= 10

  const query = useQuery({
    queryKey: ["logs", page, admin],
    queryFn: () => listLogs(page, pageSize, admin),
  })
  const errorMessage = query.error instanceof Error ? query.error.message : ""
  const logs = query.data?.items || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>日志管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>时间戳</TableHead>
                {admin && <TableHead>用户</TableHead>}
                <TableHead>Token</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>消耗</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading && (
                <TableRow>
                  <TableCell colSpan={admin ? 7 : 6} className="text-center text-slate-500">
                    加载中...
                  </TableCell>
                </TableRow>
              )}
              {errorMessage && !query.isLoading && (
                <TableRow>
                  <TableCell colSpan={admin ? 7 : 6} className="text-center text-red-600">
                    {errorMessage}
                  </TableCell>
                </TableRow>
              )}
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.id}</TableCell>
                  <TableCell>{new Date(l.created_at * 1000).toLocaleString()}</TableCell>
                  {admin && <TableCell>{l.username || "-"}</TableCell>}
                  <TableCell>{l.token_name || "-"}</TableCell>
                  <TableCell>{l.model_name || "-"}</TableCell>
                  <TableCell>{l.type}</TableCell>
                  <TableCell>{l.quota}</TableCell>
                </TableRow>
              ))}
              {!query.isLoading && !errorMessage && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={admin ? 7 : 6} className="text-center text-slate-500">
                    暂无日志数据
                  </TableCell>
                </TableRow>
              )}
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
