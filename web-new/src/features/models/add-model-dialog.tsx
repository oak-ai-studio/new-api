"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { PlusIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { createModel, listVendors } from "./api"

type AddModelDialogProps = {
  onCreated: () => Promise<void> | void
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialModelName?: string
  hideTrigger?: boolean
}

export function AddModelDialog({
  onCreated,
  trigger,
  open: controlledOpen,
  onOpenChange,
  initialModelName = "",
  hideTrigger = false,
}: AddModelDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [modelName, setModelName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [tags, setTags] = useState("")
  const [vendorId, setVendorId] = useState("")
  const [endpoints, setEndpoints] = useState("")
  const [nameRule, setNameRule] = useState("0")
  const [status, setStatus] = useState("1")
  const [syncOfficial, setSyncOfficial] = useState("1")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const vendorsQuery = useQuery({
    queryKey: ["model-vendors"],
    queryFn: () => listVendors(1000),
  })

  const open = useMemo(
    () => (controlledOpen === undefined ? uncontrolledOpen : controlledOpen),
    [controlledOpen, uncontrolledOpen]
  )

  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  useEffect(() => {
    if (open) {
      setModelName(initialModelName || "")
    }
  }, [open, initialModelName])

  const canSubmit = modelName.trim().length > 0 && !submitting

  const reset = () => {
    setModelName("")
    setDescription("")
    setIcon("")
    setTags("")
    setVendorId("")
    setEndpoints("")
    setNameRule("0")
    setStatus("1")
    setSyncOfficial("1")
    setSubmitError("")
  }

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError("")
    try {
      const normalizedTags = tags
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .join(",")
      const vendorIdValue = vendorId.trim() ? Number(vendorId) : undefined
      if (vendorId.trim() && !Number.isFinite(vendorIdValue)) {
        throw new Error("供应商 ID 必须是数字")
      }
      await createModel({
        model_name: modelName.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        tags: normalizedTags || undefined,
        endpoints: endpoints.trim() || undefined,
        vendor_id: vendorIdValue,
        name_rule: Number(nameRule),
        status: Number(status),
        sync_official: Number(syncOfficial),
      })
      await onCreated()
      setOpen(false)
      reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建模型失败"
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) reset()
      }}
    >
      {!hideTrigger ? (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="default"
              className="h-9 border border-transparent bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <PlusIcon className="size-4" />
              添加模型
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加模型</DialogTitle>
          <DialogDescription>对齐旧版模型管理的新增能力，提交到 /api/models。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">模型名称 *</label>
            <Input className="h-9" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="例如：gpt-4.1" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">描述</label>
            <Input className="h-9" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="可选" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">图标</label>
            <Input
              className="h-9"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="OpenAI / Claude.Color / OpenAI.Avatar.type={'platform'}"
            />
            <p className="text-xs text-muted-foreground">
              支持链式参数：<code>OpenAI</code>、<code>Claude.Color</code>、
              <code>OpenAI.Avatar.type={"{'platform'}"}</code>、
              <code>OpenRouter.Avatar.shape={"{'square'}"}</code>，查询所有可用图标请
              <a
                className="ml-1 text-primary underline"
                href="https://icons.lobehub.com/"
                target="_blank"
                rel="noreferrer"
              >
                请点击我
              </a>
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">标签（逗号分隔）</label>
            <Input className="h-9" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="chat, vision, fast" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Endpoints（JSON，可选）</label>
            <Textarea
              rows={3}
              value={endpoints}
              onChange={(e) => setEndpoints(e.target.value)}
              placeholder='例如：[{"path":"/v1/chat/completions","method":"POST"}]'
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">供应商（可选）</label>
              <Select value={vendorId || "none"} onValueChange={(value) => setVendorId(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不设置供应商</SelectItem>
                  {(vendorsQuery.data || []).map((vendor) => (
                    <SelectItem key={vendor.id} value={String(vendor.id)}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">名称匹配规则</label>
              <Select value={nameRule} onValueChange={setNameRule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">精确名称匹配</SelectItem>
                  <SelectItem value="1">前缀名称匹配</SelectItem>
                  <SelectItem value="2">包含名称匹配</SelectItem>
                  <SelectItem value="3">后缀名称匹配</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">状态</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">启用</SelectItem>
                  <SelectItem value="0">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">同步官方模型</label>
              <Select value={syncOfficial} onValueChange={setSyncOfficial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">是</SelectItem>
                  <SelectItem value="0">否</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {submitting ? "提交中..." : "创建模型"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
