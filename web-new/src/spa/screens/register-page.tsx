"use client"

import { FormEvent, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { GalleryVerticalEndIcon, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/shared/api/client"

type StatusPayload = {
  email_verification?: boolean
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const statusQuery = useQuery({
    queryKey: ["status-for-register"],
    queryFn: async () => {
      const resp = await api.get("/api/status")
      if (!resp.data?.success) {
        throw new Error(resp.data?.message || "获取系统状态失败")
      }
      return (resp.data?.data || {}) as StatusPayload
    },
  })

  const needEmailVerification = !!statusQuery.data?.email_verification

  async function sendVerificationCode() {
    setError("")
    if (!email.trim()) {
      setError("请先输入邮箱")
      return
    }
    setSendingCode(true)
    try {
      const resp = await api.get(`/api/verification?email=${encodeURIComponent(email.trim())}`)
      if (!resp.data?.success) {
        setError(resp.data?.message || "验证码发送失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败")
    } finally {
      setSendingCode(false)
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password || !password2) {
      setError("请完整填写注册信息")
      return
    }
    if (password.length < 8) {
      setError("密码长度至少 8 位")
      return
    }
    if (password !== password2) {
      setError("两次输入的密码不一致")
      return
    }
    if (needEmailVerification) {
      if (!email.trim() || !verificationCode.trim()) {
        setError("当前站点要求邮箱验证码，请先完成验证")
        return
      }
    }

    setSubmitting(true)
    try {
      const payload: Record<string, string> = {
        username: username.trim(),
        password,
      }
      if (needEmailVerification) {
        payload.email = email.trim()
        payload.verification_code = verificationCode.trim()
      }
      const affCode = localStorage.getItem("aff")
      if (affCode) {
        payload.aff_code = affCode
      }
      const resp = await api.post("/api/user/register", payload)
      if (!resp.data?.success) {
        setError(resp.data?.message || "注册失败")
        return
      }
      navigate("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败")
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

        <div className="mx-auto flex w-full max-w-sm flex-1 items-center py-6">
          <form className="w-full space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl leading-tight font-bold">创建账号</h1>
              <p className="text-sm text-muted-foreground">填写以下信息完成注册</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex h-5 items-center">
                <label htmlFor="username" className="text-sm leading-5 font-medium text-foreground">
                  用户名
                </label>
              </div>
              <Input
                id="username"
                className="h-11 bg-background"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {needEmailVerification && (
              <>
                <div className="space-y-2.5">
                  <div className="flex h-5 items-center">
                    <label htmlFor="email" className="text-sm leading-5 font-medium text-foreground">
                      邮箱
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      className="h-11 bg-background"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      className="h-11"
                      type="button"
                      variant="outline"
                      onClick={sendVerificationCode}
                      disabled={sendingCode}
                    >
                      {sendingCode ? "发送中..." : "发送验证码"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex h-5 items-center">
                    <label htmlFor="verification" className="text-sm leading-5 font-medium text-foreground">
                      邮箱验证码
                    </label>
                  </div>
                  <Input
                    id="verification"
                    className="h-11 bg-background"
                    placeholder="请输入验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2.5">
              <div className="flex h-5 items-center">
                <label htmlFor="password" className="text-sm leading-5 font-medium text-foreground">
                  密码
                </label>
              </div>
              <Input
                id="password"
                className="h-11 bg-background"
                type="password"
                placeholder="至少 8 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">密码长度至少 8 位。</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex h-5 items-center">
                <label htmlFor="password2" className="text-sm leading-5 font-medium text-foreground">
                  确认密码
                </label>
              </div>
              <Input
                id="password2"
                className="h-11 bg-background"
                type="password"
                placeholder="请再次输入密码"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? "注册中..." : "创建账号"}
            </Button>

            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm">其他注册方式</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              type="button"
              className="h-11 w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              使用 GitHub 注册
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号？{" "}
              <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
                去登录
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
