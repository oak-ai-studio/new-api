"use client"

import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

import { getLobeHubIcon } from "@/shared/ui/lobe-icon"
import { createModel, deleteModel, listModels, searchModels, setModelStatus } from "./api"
import { getPricing } from "../pricing/api"
import { AddModelDialog } from "./add-model-dialog"

type DisplayModel = {
  id: number
  model_name: string
  icon?: string
  vendor_id?: number
  quota_type?: number
  quota_types?: number[]
  status?: number
  readOnly: boolean
}

export function ModelsPage() {
  const [page, setPage] = useState(1)
  const [configureOpen, setConfigureOpen] = useState(false)
  const [configureModelName, setConfigureModelName] = useState("")
  const [keyword, setKeyword] = useState("")
  const [vendorFilter, setVendorFilter] = useState("all")
  const [quotaFilter, setQuotaFilter] = useState("all")
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

  const vendorMap = useMemo(() => {
    const map = new Map<number, { name: string; icon?: string }>()
    for (const vendor of fallbackPricingQuery.data?.vendors || []) {
      map.set(vendor.id, { name: vendor.name, icon: vendor.icon })
    }
    return map
  }, [fallbackPricingQuery.data?.vendors])

  const renderQuotaType = (item: DisplayModel) => {
    const firstType = item.quota_type ?? item.quota_types?.[0]
    if (firstType === 1) return "按次计费"
    if (firstType === 0) return "按量计费"
    if (firstType === undefined || firstType === null) return "-"
    return `未知(${firstType})`
  }

  const vendorOptions = useMemo(() => {
    return Array.from(vendorMap.entries()).map(([id, vendor]) => ({ id, name: vendor.name }))
  }, [vendorMap])

  const filteredItems = displayItems.filter((item) => {
    const keywordMatched = keyword
      ? item.model_name.toLowerCase().includes(keyword.toLowerCase())
      : true
    const vendorMatched = vendorFilter === "all" ? true : item.vendor_id === Number(vendorFilter)
    const quotaType = item.quota_type ?? item.quota_types?.[0]
    const quotaMatched = quotaFilter === "all" ? true : quotaType === Number(quotaFilter)
    return keywordMatched && vendorMatched && quotaMatched
  })

  const renderModelIcon = (item: DisplayModel) => {
    const vendor = item.vendor_id ? vendorMap.get(item.vendor_id) : undefined
    const iconExpr = item.icon || vendor?.icon || vendor?.name || item.model_name
    return <span className="inline-flex items-center">{getLobeHubIcon(iconExpr, 18)}</span>
  }

  const findModelIdByName = async (modelName: string) => {
    const result = await searchModels(modelName, 1, 50)
    const exact = (result.items || []).find((x) => x.model_name === modelName)
    return exact?.id
  }

  const handleDisable = async (item: DisplayModel) => {
    if (!item.readOnly && item.id > 0) {
      await setModelStatus(item.id, 0)
      await qc.invalidateQueries({ queryKey: ["models"] })
      return
    }
    try {
      await createModel({
        model_name: item.model_name,
        icon: item.icon,
        vendor_id: item.vendor_id,
        status: 0,
        sync_official: 0,
        name_rule: 0,
      })
    } catch {
      const modelId = await findModelIdByName(item.model_name)
      if (modelId) {
        await setModelStatus(modelId, 0)
      }
    }
    await qc.invalidateQueries({ queryKey: ["models"] })
  }

  const handleDelete = async (item: DisplayModel) => {
    const modelId = item.id > 0 ? item.id : await findModelIdByName(item.model_name)
    if (!modelId) return
    await deleteModel(modelId)
    await qc.invalidateQueries({ queryKey: ["models"] })
  }

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">模型管理</h1>
          <p className="text-sm text-muted-foreground">管理模型配置、供应商和计费类型</p>
        </div>
        <AddModelDialog
          onCreated={async () => {
            await qc.invalidateQueries({ queryKey: ["models"] })
          }}
        />
      </div>
      <Card className="rounded-xl">
        <CardContent className="space-y-3 pt-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              className="h-9 md:col-span-2"
              placeholder="按模型名过滤"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="供应商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部供应商</SelectItem>
                {vendorOptions.map((vendor) => (
                  <SelectItem key={vendor.id} value={String(vendor.id)}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={quotaFilter} onValueChange={setQuotaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="计费类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部计费类型</SelectItem>
                <SelectItem value="0">按量计费</SelectItem>
                <SelectItem value="1">按次计费</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>图标</TableHead>
                  <TableHead>模型名</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead>计费类型</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
                      加载中...
                    </TableCell>
                  </TableRow>
                )}
                {errorMessage && !query.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-600">
                      {errorMessage}
                    </TableCell>
                  </TableRow>
                )}
                {filteredItems.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{renderModelIcon(m)}</TableCell>
                    <TableCell>{m.model_name}</TableCell>
                    <TableCell>
                      {m.vendor_id ? vendorMap.get(m.vendor_id)?.name || `#${m.vendor_id}` : "-"}
                    </TableCell>
                    <TableCell>{renderQuotaType(m)}</TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (m.readOnly || m.status === 1) {
                            await handleDisable(m)
                            return
                          }
                          await setModelStatus(m.id, 1)
                          await qc.invalidateQueries({ queryKey: ["models"] })
                        }}
                      >
                        {m.readOnly || m.status === 1 ? "禁用" : "启用"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setConfigureModelName(m.model_name)
                          setConfigureOpen(true)
                        }}
                      >
                        配置
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          await handleDelete(m)
                        }}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!query.isLoading && !errorMessage && filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
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
          <AddModelDialog
            hideTrigger
            open={configureOpen}
            onOpenChange={setConfigureOpen}
            initialModelName={configureModelName}
            onCreated={async () => {
              await qc.invalidateQueries({ queryKey: ["models"] })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
