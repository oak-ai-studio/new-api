"use client"

import dynamic from "next/dynamic"

const SpaRoot = dynamic(() => import("@/spa/root").then((m) => m.SpaRoot), {
  ssr: false,
})

export default function SpaPageClient() {
  return <SpaRoot />
}
