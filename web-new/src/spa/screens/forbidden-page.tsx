"use client"

import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>无权限访问</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>当前账号没有访问该模块的权限，请联系管理员。</p>
          <Button asChild variant="outline">
            <Link to="/console">返回控制台</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
