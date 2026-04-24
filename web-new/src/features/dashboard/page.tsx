"use client"

import { Card, CardContent } from "@/components/ui/card"

export function DashboardPage() {
  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="text-sm text-muted-foreground">控制台总览页面，后续可补充统计卡片与关键指标</p>
      </div>
      <Card className="rounded-xl">
        <CardContent className="pt-5 text-sm text-muted-foreground">
          控制台总览页面，后续可补充统计卡片与关键指标。
        </CardContent>
      </Card>
    </div>
  )
}
