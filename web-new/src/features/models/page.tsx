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
import { getPricing } from "../pricing/api"

type DisplayModel = {
  id: number
  model_name: string
  vendor_id?: number
  quota_type?: number
  status?: number
  readOnly: boolean
}

export function ModelsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ["models", page],
    queryFn: () => listModels(page, pageSize),
  })
  const errorMessage = query.error instanceof Error ? query.error.message : ""
  const fallbackPricingQuery = useQuery({
    queryKey: ["models-fallback-pricing"],
    queryFn: getPricing,
    enabled: !query.isLoading && !errorMessage && (query.data?.items?.length || 0) === 0,
  })

  const primaryItems = query.data?.items || []
  const fallbackItems: DisplayModel[] = (fallbackPricingQuery.data?.items || []).map((item, index) => ({
    id: -(index + 1),
    model_name: item.model_name,
    vendor_id: item.vendor_id,
    quota_type: item.quota_type,
    status: undefined,
    readOnly: true,
  }))
  const displayItems: DisplayModel[] =
    primaryItems.length > 0
      ? primaryItems.map((item) => ({ ...item, readOnly: false }))
      : fallbackItems.slice((page - 1) * pageSize, page * pageSize)

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
              {displayItems.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id > 0 ? m.id : "-"}</TableCell>
                  <TableCell>{m.model_name}</TableCell>
                  <TableCell>{m.vendor_id ?? "-"}</TableCell>
                  <TableCell>{m.quota_type ?? "-"}</TableCell>
                  <TableCell>
                    {m.readOnly ? "-" : m.status === 1 ? "启用" : "禁用"}
                  </TableCell>
                  <TableCell>
                    {m.readOnly ? (
                      <span className="text-xs text-slate-500">只读（来自定价）</span>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await setModelStatus(m.id, m.status === 1 ? 0 : 1)
                          await qc.invalidateQueries({ queryKey: ["models"] })
                        }}
                      >
                        {m.status === 1 ? "禁用" : "启用"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!query.isLoading && !errorMessage && displayItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    暂无模型数据
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
            disabled={displayItems.length < pageSize}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
