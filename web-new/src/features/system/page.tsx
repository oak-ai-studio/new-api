"use client"

import { Card, CardContent } from "@/components/ui/card"

export function SystemPage() {
  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold">系统管理</h1>
        <p className="text-sm text-muted-foreground">管理系统参数、功能开关和运行配置</p>
      </div>
      <Card className="rounded-xl">
        <CardContent className="pt-5 text-sm text-muted-foreground">
          系统管理页面，后续可补充系统参数、开关和运行配置。
        </CardContent>
      </Card>
    </div>
  )
}
