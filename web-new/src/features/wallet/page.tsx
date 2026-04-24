"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatQuotaDisplay } from "@/shared/quota-display"

import { getTopupStatus, getWalletProfile, redeemTopupCode } from "./api"

export function WalletPage() {
  const queryClient = useQueryClient()
  const [code, setCode] = useState("")
  const [redeemFeedback, setRedeemFeedback] = useState("")

  const profileQuery = useQuery({
    queryKey: ["wallet-profile"],
    queryFn: getWalletProfile,
  })

  const statusQuery = useQuery({
    queryKey: ["wallet-status"],
    queryFn: getTopupStatus,
  })

  const redeemMutation = useMutation({
    mutationFn: async () => {
      const text = code.trim()
      if (!text) {
        throw new Error("请输入兑换码")
      }
      return redeemTopupCode(text)
    },
    onSuccess: (addedQuota) => {
      setRedeemFeedback(`兑换成功，已增加额度 ${Number(addedQuota || 0).toLocaleString()}`)
      setCode("")
      queryClient.invalidateQueries({ queryKey: ["wallet-profile"] })
    },
    onError: (error) => {
      setRedeemFeedback(error instanceof Error ? error.message : "兑换失败")
    },
  })

  const stats = useMemo(() => {
    const quota = Number(profileQuery.data?.quota || 0)
    const used = Number(profileQuery.data?.used_quota || 0)
    return {
      remain: Number.isFinite(quota) ? quota : 0,
      used: Number.isFinite(used) ? used : 0,
      total: Number.isFinite(quota + used) ? quota + used : 0,
    }
  }, [profileQuery.data])
  const status = statusQuery.data

  const openTopupLink = () => {
    const link = status?.top_up_link
    if (!link) {
      setRedeemFeedback("当前未配置在线充值链接，请联系管理员")
      return
    }
    window.open(link, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold">钱包</h1>
        <p className="text-sm text-muted-foreground">查看余额、消费情况，并在此进行充值</p>
      </div>

      {profileQuery.isError ? (
        <Card className="rounded-xl">
          <CardContent className="py-8 text-sm text-red-600">
            {profileQuery.error instanceof Error ? profileQuery.error.message : "钱包数据加载失败"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardDescription>当前余额</CardDescription>
              <CardTitle className="text-2xl">{formatQuotaDisplay(stats.remain, status)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardDescription>已消费</CardDescription>
              <CardTitle className="text-2xl">{formatQuotaDisplay(stats.used, status)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardDescription>累计金额</CardDescription>
              <CardTitle className="text-2xl">{formatQuotaDisplay(stats.total, status)}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>充值</CardTitle>
          <CardDescription>支持兑换码充值，也可跳转在线充值页面</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <Input
              className="h-9"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="请输入兑换码"
            />
            <Button
              className="h-9"
              onClick={() => {
                setRedeemFeedback("")
                redeemMutation.mutate()
              }}
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? "兑换中..." : "兑换充值"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="h-9" onClick={openTopupLink}>
              前往在线充值
            </Button>
            <span className="text-xs text-muted-foreground">
              {status?.top_up_link ? "已检测到在线充值入口" : "未配置在线充值入口"}
            </span>
          </div>

          {redeemFeedback ? (
            <p
              className={`text-sm ${
                redeemFeedback.includes("成功") ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {redeemFeedback}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
