"use client"

import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/shared/api/client"

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password) {
      setError("请输入用户名和密码")
      return
    }
    setSubmitting(true)
    try {
      const resp = await api.post("/api/user/login", {
        username: username.trim(),
        password,
      })
      const payload = resp?.data
      if (!payload?.success) {
        setError(payload?.message || "登录失败")
        return
      }
      if (payload?.data?.require_2fa) {
        setError("该账号已开启 2FA，请先在旧版完成二步验证登录。")
        return
      }
      const loginUser = payload?.data || {}
      localStorage.setItem("user", JSON.stringify(loginUser))
      navigate("/console")
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="space-y-3">
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "登录中..." : "登录"}
                </Button>
                <Button variant="outline" type="button" onClick={() => navigate("/")}>
                  返回首页
                </Button>
              </div>
            </form>
            <p className="text-sm text-slate-600">
              还没有账号？{" "}
              <Link className="text-blue-600 hover:text-blue-800" to="/register">
                去注册
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
