"use client"

import { WaypointsIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
  textClassName?: string
  iconClassName?: string
  tone?: "light" | "dark"
}

export function BrandMark({ className, textClassName, iconClassName, tone = "light" }: BrandMarkProps) {
  const darkTone = tone === "dark"

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <WaypointsIcon
        className={cn(
          "size-7 shrink-0 stroke-[2.5]",
          darkTone ? "text-white" : "text-foreground",
          iconClassName,
        )}
      />
      <span
        className={cn(
          "text-[17px] leading-none font-bold tracking-tight",
          darkTone ? "text-white" : "text-foreground",
          textClassName,
        )}
        style={{
          fontFamily: '"Inter","SF Pro Text","PingFang SC","Microsoft YaHei","Helvetica Neue",sans-serif',
        }}
      >
        Fierce Gateway
      </span>
    </div>
  )
}
