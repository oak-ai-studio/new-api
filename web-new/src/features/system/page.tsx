"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SystemPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>系统管理</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        系统管理页面，后续可补充系统参数、开关和运行配置。
      </CardContent>
    </Card>
  )
}
