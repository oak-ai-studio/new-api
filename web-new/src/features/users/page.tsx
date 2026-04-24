"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  const [page, setPage] = useState(1)
  const pageSize = 20
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ["users", page],
    queryFn: () => listUsers(page, pageSize),
  })

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold">用户管理</h1>
        <p className="text-sm text-muted-foreground">查看用户信息，并进行启用、禁用和权限调整</p>
      </div>
      <Card className="rounded-xl">
        <CardContent className="space-y-3 pt-5">
          <div className="overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>分组</TableHead>
                  <TableHead>额度</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(query.data?.items || []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.status}</TableCell>
                    <TableCell>{u.group}</TableCell>
                    <TableCell>{u.quota}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await manageUser(u.id, u.status === 1 ? "disable" : "enable")
                          await qc.invalidateQueries({ queryKey: ["users"] })
                        }}
                      >
                        {u.status === 1 ? "禁用" : "启用"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await manageUser(u.id, u.role >= 10 ? "demote" : "promote")
                          await qc.invalidateQueries({ queryKey: ["users"] })
                        }}
                      >
                        {u.role >= 10 ? "降权" : "升权"}
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
    </div>
  )
}
