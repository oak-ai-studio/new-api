"use client"

import { FormEvent, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>注册账号</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input
              type="password"
              placeholder="密码（至少 8 位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="确认密码"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />

            {needEmailVerification && (
              <>
                <div className="flex gap-2">
                  <Input placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                  >
                    {sendingCode ? "发送中..." : "发送验证码"}
                  </Button>
                </div>
                <Input
                  placeholder="邮箱验证码"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </>
            )}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "注册中..." : "注册"}
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate("/")}>
                返回首页
              </Button>
            </div>
          </form>

          <p className="text-sm text-slate-600">
            已有账号？{" "}
            <Link className="text-blue-600 hover:text-blue-800" to="/login">
              去登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
