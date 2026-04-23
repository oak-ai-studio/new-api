"use client"

import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Web 新版重构入口</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            当前为新版控制台，已接入核心模块（渠道、模型、定价、Token、用户、权限、日志）。
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/console">进入新版控制台</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/console" target="_blank" rel="noreferrer">
                打开旧版控制台
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
