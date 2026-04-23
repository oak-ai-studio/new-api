"use client"

import * as LobeIcons from "@lobehub/icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function parseValue(raw: string | null | undefined): boolean | number | string {
  if (raw == null) return true
  let value = String(raw).trim()
  if (value.startsWith("{") && value.endsWith("}")) {
    value = value.slice(1, -1).trim()
  }
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  if (value === "true") return true
  if (value === "false") return false
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

/**
 * Support icon expressions:
 * - OpenAI
 * - Claude.Color
 * - OpenAI.Avatar.type={'platform'}
 * - OpenRouter.Avatar.shape={'square'}
 */
export function getLobeHubIcon(iconName?: string, size = 14) {
  const normalized = String(iconName || "").trim()
  if (!normalized) {
    return (
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">?</AvatarFallback>
      </Avatar>
    )
  }

  const segments = normalized.split(".")
  const baseKey = segments[0]
  const base = (LobeIcons as Record<string, unknown>)[baseKey] as Record<string, unknown> | undefined

  let IconComponent: unknown = undefined
  let propStartIndex = 1

  if (base && segments.length > 1 && base[segments[1]]) {
    IconComponent = base[segments[1]]
    propStartIndex = 2
  } else {
    IconComponent = (LobeIcons as Record<string, unknown>)[baseKey]
  }

  if (!IconComponent || (typeof IconComponent !== "function" && typeof IconComponent !== "object")) {
    const firstLetter = normalized.charAt(0).toUpperCase()
    return (
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">{firstLetter}</AvatarFallback>
      </Avatar>
    )
  }

  const props: Record<string, boolean | number | string> = {}
  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) continue
    const eqIdx = seg.indexOf("=")
    if (eqIdx === -1) {
      props[seg.trim()] = true
      continue
    }
    const key = seg.slice(0, eqIdx).trim()
    const raw = seg.slice(eqIdx + 1).trim()
    props[key] = parseValue(raw)
  }
  if (props.size == null && size != null) props.size = size

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = IconComponent as any
  return <Comp {...props} />
}
