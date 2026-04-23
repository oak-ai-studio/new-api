"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

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

import { getPricing } from "./api"

export function PricingPage() {
  const [keyword, setKeyword] = useState("")
  const query = useQuery({
    queryKey: ["pricing"],
    queryFn: getPricing,
  })

  const items = useMemo(() => {
    const list = query.data?.items || []
    return list.filter((m) =>
      keyword ? m.model_name.toLowerCase().includes(keyword.toLowerCase()) : true,
    )
  }, [query.data, keyword])

  const vendorMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const vendor of query.data?.vendors || []) {
      map.set(vendor.id, vendor.name)
    }
    return map
  }, [query.data])

  const renderQuotaType = (quotaType: number) =>
    quotaType === 1 ? "按次计费" : quotaType === 0 ? "按量计费" : `未知(${quotaType})`

  const renderPrice = (quotaType: number, modelPrice?: number, modelRatio?: number) => {
    if (quotaType === 1) {
      return modelPrice ?? "-"
    }
    if (quotaType === 0) {
      return modelRatio !== undefined ? `按倍率结算（倍率 ${modelRatio}）` : "按倍率结算"
    }
    return "-"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>模型广场（定价查看）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="按模型名过滤"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>计费类型</TableHead>
                <TableHead>倍率</TableHead>
                <TableHead>价格/计费说明</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>描述</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.model_name}>
                  <TableCell>{it.model_name}</TableCell>
                  <TableCell>
                    {it.vendor_id ? vendorMap.get(it.vendor_id) || `#${it.vendor_id}` : "-"}
                  </TableCell>
                  <TableCell>{renderQuotaType(it.quota_type)}</TableCell>
                  <TableCell>{it.quota_type === 0 ? (it.model_ratio ?? "-") : "-"}</TableCell>
                  <TableCell>{renderPrice(it.quota_type, it.model_price, it.model_ratio)}</TableCell>
                  <TableCell>{it.tags || "-"}</TableCell>
                  <TableCell>{it.description || "-"}</TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500">
                    暂无可用模型定价
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
