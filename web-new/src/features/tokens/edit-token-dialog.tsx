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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { getSystemStatus, getUserGroups, type TokenItem, updateToken } from "./api"

type EditTokenDialogProps = {
  open: boolean
  token: TokenItem | null
  onOpenChange: (open: boolean) => void
  onUpdated: () => Promise<void> | void
}

function formatDateTimeLocal(ts?: number) {
  if (!ts || ts <= 0 || ts === -1) return ""
  const millis = ts > 1_000_000_000_000 ? ts : ts * 1000
  const d = new Date(millis)
  if (Number.isNaN(d.getTime())) return ""
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function toUnixSeconds(datetimeLocal: string) {
  if (!datetimeLocal) return -1
  const ms = new Date(datetimeLocal).getTime()
  if (!Number.isFinite(ms) || ms <= 0) return -1
  return Math.floor(ms / 1000)
}

export function EditTokenDialog({ open, token, onOpenChange, onUpdated }: EditTokenDialogProps) {
  const [name, setName] = useState("")
  const [group, setGroup] = useState("default")
  const [expireAt, setExpireAt] = useState("")
  const [amount, setAmount] = useState("0")
  const [unlimitedQuota, setUnlimitedQuota] = useState(false)
  const [allowIps, setAllowIps] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const groupsQuery = useQuery({
    queryKey: ["token-edit-user-groups"],
    queryFn: getUserGroups,
  })

  const statusQuery = useQuery({
    queryKey: ["token-edit-status-meta"],
    queryFn: getSystemStatus,
  })

  const quotaPerUnit = useMemo(() => {
    const value = Number(statusQuery.data?.quota_per_unit)
    return Number.isFinite(value) && value > 0 ? value : 500000
  }, [statusQuery.data?.quota_per_unit])

  const groupNames = useMemo(() => {
    const names = Object.keys(groupsQuery.data || {})
    if (!names.includes("default")) names.unshift("default")
    return names
  }, [groupsQuery.data])

  const hydrateFromToken = (source: TokenItem | null) => {
    if (!source) return
    setName(source.name || "")
    setGroup(source.group || "default")
    setExpireAt(formatDateTimeLocal(source.expired_time))
    setUnlimitedQuota(!!source.unlimited_quota)
    setAllowIps(source.allow_ips || "")
    if (source.unlimited_quota) {
      setAmount("0")
    } else {
      const total = Number(source.remain_quota || 0) + Number(source.used_quota || 0)
      setAmount((total / quotaPerUnit).toFixed(6))
    }
    setError("")
  }

  const submit = async () => {
    if (!token) return
    setSubmitting(true)
    setError("")
    try {
      const amountNum = Number(amount || "0")
      if (!unlimitedQuota && (!Number.isFinite(amountNum) || amountNum < 0)) {
        throw new Error("金额必须是非负数字")
      }
      const remainQuota = unlimitedQuota ? 0 : Math.floor(amountNum * quotaPerUnit)
      await updateToken({
        id: token.id,
        name: name.trim() || token.name,
        status: token.status,
        remain_quota: remainQuota,
        expired_time: toUnixSeconds(expireAt),
        unlimited_quota: unlimitedQuota,
        group: group || "default",
        allow_ips: allowIps || "",
        model_limits_enabled: !!token.model_limits_enabled,
        model_limits: token.model_limits || "",
        cross_group_retry: !!token.cross_group_retry,
      })
      await onUpdated()
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (nextOpen) hydrateFromToken(token)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑 API Key</DialogTitle>
          <DialogDescription>修改令牌基础信息与限制配置</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">名称</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">分组</label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger>
                <SelectValue />
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
              <label className="text-sm font-medium">过期时间</label>
              <Input type="datetime-local" value={expireAt} onChange={(e) => setExpireAt(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">金额（美元）</label>
              <Input
                type="number"
                min={0}
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={unlimitedQuota}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">无限额度</p>
              <p className="text-xs text-muted-foreground">关闭后按金额转换总额度</p>
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

          <div className="grid gap-2">
            <label className="text-sm font-medium">IP 限制</label>
            <Textarea
              rows={3}
              value={allowIps}
              onChange={(e) => setAllowIps(e.target.value)}
              placeholder="可按换行输入多个 IP，不填表示无限制"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={submit} disabled={submitting || !token}>
            {submitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
