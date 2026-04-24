"use client"

import { useEffect, useMemo, useState } from "react"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { EllipsisIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

import { getLobeHubIcon } from "@/shared/ui/lobe-icon"
import { createModel, deleteModel, listModels, listVendors, searchModels, setModelStatus } from "./api"
import { AddModelDialog } from "./add-model-dialog"

type DisplayModel = {
  id: number
  model_name: string
  icon?: string
  vendor_id?: number | string
  vendor_name?: string
  vendor_icon?: string
  quota_type?: number
  quota_types?: number[]
  status?: number
  readOnly: boolean
}

export function ModelsPage() {
  const [configureOpen, setConfigureOpen] = useState(false)
  const [configureModelName, setConfigureModelName] = useState("")
  const [keyword, setKeyword] = useState("")
  const [vendorFilter, setVendorFilter] = useState("all")
  const [quotaFilter, setQuotaFilter] = useState("all")
  const pageSize = 20
  const qc = useQueryClient()
  const query = useInfiniteQuery({
    queryKey: ["models", pageSize],
    queryFn: ({ pageParam }) => listModels(pageParam, pageSize),
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
  const vendorsQuery = useQuery({
    queryKey: ["model-vendors"],
    queryFn: () => listVendors(1000),
  })
  const errorMessage = query.error instanceof Error ? query.error.message : ""

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

  const primaryItems = useMemo(
    () => query.data?.pages.flatMap((page) => page.items || []) || [],
    [query.data?.pages],
  )
  const displayItems: DisplayModel[] = primaryItems.map((item) => ({ ...item, readOnly: false }))

  const vendorMap = useMemo(() => {
    const map = new Map<string, { name: string; icon?: string }>()
    for (const vendor of vendorsQuery.data || []) {
      map.set(String(vendor.id), {
        name: vendor.name,
        icon: vendor.icon,
      })
    }
    for (const item of displayItems) {
      if (!item.vendor_id || map.has(String(item.vendor_id))) {
        continue
      }
      map.set(String(item.vendor_id), {
        name: item.vendor_name || `#${item.vendor_id}`,
        icon: item.vendor_icon,
      })
    }
    return map
  }, [displayItems, vendorsQuery.data])

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
    const vendorMatched =
      vendorFilter === "all" ? true : String(item.vendor_id || "") === String(vendorFilter)
    const quotaType = item.quota_type ?? item.quota_types?.[0]
    const quotaMatched = quotaFilter === "all" ? true : quotaType === Number(quotaFilter)
    return keywordMatched && vendorMatched && quotaMatched
  })

  const renderModelIcon = (item: DisplayModel) => {
    const vendor = item.vendor_id ? vendorMap.get(String(item.vendor_id)) : undefined
    const iconExpr = item.icon || vendor?.icon || vendor?.name || item.model_name
    return <span className="inline-flex items-center">{getLobeHubIcon(iconExpr, 18)}</span>
  }

  const findModelIdByName = async (modelName: string) => {
    const result = await searchModels(modelName, 1, 50)
    const exact = (result.items || []).find((x) => x.model_name === modelName)
    return exact?.id
  }

  const normalizeVendorId = (vendorId: DisplayModel["vendor_id"]): number | undefined => {
    if (vendorId === undefined || vendorId === null || vendorId === "") {
      return undefined
    }
    const parsed = Number(vendorId)
    return Number.isFinite(parsed) ? parsed : undefined
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
        vendor_id: normalizeVendorId(item.vendor_id),
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
                  <TableHead className="text-right">操作</TableHead>
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
                      {m.vendor_id ? vendorMap.get(String(m.vendor_id))?.name || `#${m.vendor_id}` : "-"}
                    </TableCell>
                    <TableCell>{renderQuotaType(m)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="actions">
                            <EllipsisIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
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
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setConfigureModelName(m.model_name)
                              setConfigureOpen(true)
                            }}
                          >
                            配置
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              await handleDelete(m)
                            }}
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          {query.isFetchingNextPage && (
            <div className="text-center text-xs text-muted-foreground">加载更多中...</div>
          )}
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
