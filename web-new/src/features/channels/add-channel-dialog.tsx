"use client"

import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"

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

import { createChannel } from "./api"
import { CHANNEL_TYPE_OPTIONS } from "./channel-types"

type AddChannelDialogProps = {
  onCreated: () => Promise<void> | void
}

export function AddChannelDialog({ onCreated }: AddChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("1")
  const [key, setKey] = useState("")
  const [group, setGroup] = useState("default")
  const [modelsText, setModelsText] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const parsedModels = useMemo(
    () =>
      modelsText
        .split(/[\n,]+/)
        .map((x) => x.trim())
        .filter(Boolean),
    [modelsText]
  )

  const canSubmit = name.trim() && key.trim() && parsedModels.length > 0 && !submitting

  const resetForm = () => {
    setName("")
    setType("1")
    setKey("")
    setGroup("default")
    setModelsText("")
    setBaseUrl("")
    setSubmitError("")
  }

  const submit = async () => {
    if (!canSubmit) {
      return
    }
    setSubmitting(true)
    setSubmitError("")
    try {
      await createChannel({
        mode: "single",
        channel: {
          name: name.trim(),
          type: Number(type),
          key: key.trim(),
          group: group.trim() || "default",
          models: parsedModels.join(","),
          auto_ban: 1,
          ...(baseUrl.trim() ? { base_url: baseUrl.trim().replace(/\/+$/, "") } : {}),
        },
      })
      await onCreated()
      setOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建渠道失败"
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
        if (!nextOpen) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="h-9 border border-transparent bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          <PlusIcon className="size-4" />
          添加渠道
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加渠道</DialogTitle>
          <DialogDescription>使用原生 shadcn Dialog 创建单个渠道。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">渠道名称</label>
            <Input placeholder="例如：OpenAI-主账号" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">渠道类型</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="选择渠道类型" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label} ({opt.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">渠道密钥</label>
            <Textarea
              rows={4}
              placeholder="输入 API Key；多 key 可按换行填写"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">模型列表</label>
            <Textarea
              rows={3}
              placeholder="按逗号或换行分隔，例如：gpt-4o-mini, gpt-4.1"
              value={modelsText}
              onChange={(e) => setModelsText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">已解析 {parsedModels.length} 个模型</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">分组</label>
              <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="default" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Base URL（可选）</label>
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" />
            </div>
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            取消
          </Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>
            {submitting ? "提交中..." : "创建渠道"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
