"use client"

import { useMemo, useState } from "react"
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

import { addToken, getSystemStatus, getUserGroups } from "./api"

type AddTokenDialogProps = {
  onCreated: () => Promise<void> | void
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

function toUnixSeconds(datetimeLocal: string) {
  if (!datetimeLocal) return -1
  const ms = new Date(datetimeLocal).getTime()
  if (!Number.isFinite(ms) || ms <= 0) return -1
  return Math.floor(ms / 1000)
}

export function AddTokenDialog({ onCreated }: AddTokenDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [group, setGroup] = useState("default")
  const [count, setCount] = useState("1")
  const [amount, setAmount] = useState("0")
  const [unlimitedQuota, setUnlimitedQuota] = useState(true)
  const [expireAt, setExpireAt] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const groupsQuery = useQuery({
    queryKey: ["token-user-groups"],
    queryFn: getUserGroups,
  })

  const statusQuery = useQuery({
    queryKey: ["token-status-meta"],
    queryFn: getSystemStatus,
  })

  const groupNames = useMemo(() => {
    const names = Object.keys(groupsQuery.data || {})
    if (!names.includes("default")) names.unshift("default")
    return names
  }, [groupsQuery.data])

  const quotaPerUnit = useMemo(() => {
    const value = Number(statusQuery.data?.quota_per_unit)
    return Number.isFinite(value) && value > 0 ? value : 500000
  }, [statusQuery.data?.quota_per_unit])

  const canSubmit = name.trim().length > 0 && !submitting

  const setQuickExpire = (secondsFromNow?: number) => {
    if (!secondsFromNow) {
      setExpireAt("")
      return
    }
    const d = new Date(Date.now() + secondsFromNow * 1000)
    d.setSeconds(0, 0)
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setExpireAt(local)
  }

  const reset = () => {
    setName("")
    setGroup("default")
    setCount("1")
    setAmount("0")
    setUnlimitedQuota(true)
    setExpireAt("")
    setError("")
  }

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    try {
      const countValue = Number(count)
      if (!Number.isInteger(countValue) || countValue <= 0 || countValue > 20) {
        throw new Error("新建数量需为 1-20 的整数")
      }

      const amountValue = Number(amount || "0")
      if (!Number.isFinite(amountValue) || amountValue < 0) {
        throw new Error("金额必须是非负数字")
      }

      const remainQuota = unlimitedQuota ? 0 : Math.floor(amountValue * quotaPerUnit)
      const expiredTime = expireAt ? toUnixSeconds(expireAt) : -1

      for (let i = 0; i < countValue; i += 1) {
        const finalName = countValue === 1 ? name.trim() : `${name.trim()}-${randomSuffix()}`
        await addToken({
          name: finalName,
          remain_quota: remainQuota,
          expired_time: expiredTime,
          unlimited_quota: unlimitedQuota,
          group: group || "default",
        })
      }

      await onCreated()
      setOpen(false)
      reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败")
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
      <DialogTrigger asChild>
        <Button className="h-8" variant="outline">
          创建 API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>创建新的令牌</DialogTitle>
          <DialogDescription>填写令牌基础信息、过期时间和额度设置</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <section className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">基本信息</h3>
            <div className="grid gap-2">
              <label className="text-sm font-medium">名称 *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入名称" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">令牌分组</label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分组" />
                </SelectTrigger>
                <SelectContent>
                  {groupNames.map((it) => (
                    <SelectItem key={it} value={it}>
                      {it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">过期时间 *</label>
                <Input type="datetime-local" value={expireAt} onChange={(e) => setExpireAt(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">过期时间快捷设置</label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setQuickExpire()}>
                    永不过期
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setQuickExpire(30 * 24 * 3600)}>
                    一个月
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setQuickExpire(24 * 3600)}>
                    一天
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setQuickExpire(3600)}>
                    一小时
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">新建数量 *</label>
              <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(e.target.value)} />
              <p className="text-xs text-muted-foreground">批量创建会在名称后自动追加随机后缀</p>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">额度设置</h3>
            <div className="grid gap-2">
              <label className="text-sm font-medium">金额（美元）</label>
              <Input
                type="number"
                min={0}
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={unlimitedQuota}
                placeholder="0.000000"
              />
              <p className="text-xs text-muted-foreground">
                当前换算：1 USD = {quotaPerUnit.toLocaleString("zh-CN")} 额度
              </p>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">无限额度</p>
                <p className="text-xs text-muted-foreground">关闭后将按金额转换为总额度限制</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={unlimitedQuota ? "default" : "outline"}
                onClick={() => setUnlimitedQuota((v) => !v)}
              >
                {unlimitedQuota ? "开启" : "关闭"}
              </Button>
            </div>
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {submitting ? "提交中..." : "提交"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
