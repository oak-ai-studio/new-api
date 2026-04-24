"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BrandMark } from "@/shared/ui/brand-mark"

const slogans = [
  "统一接入多模型，开发更高效。",
  "可观测、可计费、可扩展的一站式 AI 网关。",
  "让每一次调用都有清晰的成本与质量反馈。",
  "稳定连接上游能力，专注你的业务创新。",
]

export function AuthSidePanel() {
  const [sloganIndex, setSloganIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [holding, setHolding] = useState(false)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const current = slogans[sloganIndex] || ""
    let timer: ReturnType<typeof setTimeout>

    if (holding) {
      timer = setTimeout(() => {
        setHolding(false)
        setDeleting(true)
      }, 1700)
      return () => clearTimeout(timer)
    }

    if (switching) {
      timer = setTimeout(() => {
        setSwitching(false)
      }, 350)
      return () => clearTimeout(timer)
    }

    if (!deleting) {
      if (displayText.length < current.length) {
        timer = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1))
        }, 85)
      } else {
        setHolding(true)
      }
    } else if (displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1))
      }, 55)
    } else {
      setDeleting(false)
      setSwitching(true)
      setSloganIndex((prev) => (prev + 1) % slogans.length)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [deleting, displayText, holding, sloganIndex, switching])

  return (
    <div className="relative hidden overflow-hidden bg-black text-white md:flex md:flex-col">
      <Link to="/" className="flex items-center gap-2 px-8 py-6 text-white md:px-10">
        <BrandMark tone="dark" iconClassName="!size-5" textClassName="font-medium" />
      </Link>

      <div className="mt-auto px-8 pb-10 md:px-10">
        <p className="min-h-14 text-lg leading-8 text-white/90">
          {displayText}
          <span className="ml-0.5 inline-block h-5 w-0.5 animate-[caret-blink_1s_steps(1,end)_infinite] bg-white align-middle" />
        </p>
      </div>
      <style>{`
        @keyframes caret-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
