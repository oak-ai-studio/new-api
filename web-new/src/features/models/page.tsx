"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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

import { listModels, setModelStatus } from "./api"

export function ModelsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ["models", page],
    queryFn: () => listModels(page, pageSize),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>模型查看与管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>模型名</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>计费类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items || []).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.model_name}</TableCell>
                  <TableCell>{m.vendor_id ?? "-"}</TableCell>
                  <TableCell>{m.quota_type ?? "-"}</TableCell>
                  <TableCell>{m.status === 1 ? "启用" : "禁用"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await setModelStatus(m.id, m.status === 1 ? 0 : 1)
                        await qc.invalidateQueries({ queryKey: ["models"] })
                      }}
                    >
                      {m.status === 1 ? "禁用" : "启用"}
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
