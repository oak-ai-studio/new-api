"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import { getSelf, updateSidebarModules } from "./api"

export function PermissionsPage() {
  const query = useQuery({
    queryKey: ["self-permissions"],
    queryFn: getSelf,
  })
  const qc = useQueryClient()
  const [sidebarJson, setSidebarJson] = useState("")
  useEffect(() => {
    if (query.data?.sidebar_modules) {
      setSidebarJson(query.data.sidebar_modules)
    }
  }, [query.data])

  return (
    <div className="space-y-4 pt-4 md:pt-6">
      <div>
        <h1 className="text-2xl font-semibold">权限管理</h1>
        <p className="text-sm text-muted-foreground">查看当前角色能力并维护侧边栏模块可见性</p>
      </div>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>权限信息（角色与能力）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <pre className="overflow-auto rounded-md bg-slate-100 p-3">
            {JSON.stringify(
              {
                role: query.data?.role,
                permissions: query.data?.permissions || {},
                capabilities: query.data?.capabilities || {},
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>模块可见性（sidebar_modules）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={sidebarJson} onChange={(e) => setSidebarJson(e.target.value)} />
          <Button
            onClick={async () => {
              await updateSidebarModules(sidebarJson)
              await qc.invalidateQueries({ queryKey: ["self-permissions"] })
            }}
          >
            保存配置
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
