"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>仪表盘</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        控制台总览页面，后续可补充统计卡片与关键指标。
      </CardContent>
    </Card>
  )
}
