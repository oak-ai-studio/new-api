"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WalletPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>钱包</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        钱包功能页面，后续可接入余额、充值记录与账单明细。
      </CardContent>
    </Card>
  )
}
