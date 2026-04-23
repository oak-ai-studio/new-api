"use client"

import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GalleryVerticalEndIcon, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="grid min-h-svh bg-background md:grid-cols-2">
      <div className="relative flex flex-col border-r bg-card px-8 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 font-medium text-foreground">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          New API
        </Link>

        <div className="mx-auto flex w-full max-w-xs flex-1 items-center">
          <form className="w-full space-y-5" onSubmit={onSubmit}>
            <div className="space-y-1 text-center">
              <h1 className="text-4xl leading-tight font-bold">登录账号</h1>
              <p className="text-sm text-muted-foreground">输入用户名和密码继续访问控制台</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                用户名
              </label>
              <Input
                id="username"
                className="h-11 bg-background"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  密码
                </label>
                <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                  忘记密码？
                </button>
              </div>
              <Input
                id="password"
                className="h-11 bg-background"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? "登录中..." : "登录"}
            </Button>

            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm">其他登录方式</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" type="button" className="h-11 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              使用 GitHub 登录
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              还没有账号？{" "}
              <Link to="/register" className="underline underline-offset-4 hover:text-foreground">
                去注册
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-muted md:block">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_55%,rgba(0,0,0,0.06),transparent_75%)]" />
        <div className="flex h-full items-center justify-center">
          <div className="relative flex size-24 items-center justify-center rounded-full border border-border bg-background/70">
            <div className="absolute inset-0 rounded-full border border-dashed border-border" />
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}
