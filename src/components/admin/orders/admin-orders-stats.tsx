"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Clock
} from "lucide-react"

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  todayOrders: number
  todayRevenue: number
  growthRate: number
}

export function AdminOrdersStats() {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderStats()
  }, [])

  const fetchOrderStats = async () => {
    try {
      const response = await fetch('/api/admin/orders/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch {
      console.error('Error fetching order stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-muted"></div>
                <div className="h-8 w-16 bg-muted"></div>
                <div className="h-3 w-20 bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsConfig = [
    {
      title: "Total Orders",
      value: stats?.totalOrders?.toLocaleString() || "0",
      description: "All time orders",
      icon: ShoppingBag,
      change: "+12.5%",
      changeType: "positive" as const,
      color: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      description: "Total earnings",
      icon: TrendingUp,
      change: `+${stats?.growthRate || 0}%`,
      changeType: "positive" as const,
      color: "text-green-600",
    },
    {
      title: "Average Order Value",
      value: formatPrice(stats?.averageOrderValue || 0),
      description: "Per order average",
      icon: Package,
      change: "+8.3%",
      changeType: "positive" as const,
      color: "text-purple-600",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders?.toLocaleString() || "0",
      description: "Awaiting processing",
      icon: Clock,
      change: "-2.1%",
      changeType: "negative" as const,
      color: "text-yellow-600",
    },
    {
      title: "Completed Orders",
      value: stats?.completedOrders?.toLocaleString() || "0",
      description: "Successfully delivered",
      icon: Package,
      change: "+15.7%",
      changeType: "positive" as const,
      color: "text-green-600",
    },
    {
      title: "Cancelled Orders",
      value: stats?.cancelledOrders?.toLocaleString() || "0",
      description: "Cancelled by customers",
      icon: Users,
      change: "+3.2%",
      changeType: "negative" as const,
      color: "text-red-600",
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders?.toLocaleString() || "0",
      description: "Orders placed today",
      icon: Calendar,
      change: "+25%",
      changeType: "positive" as const,
      color: "text-crimson-600",
    },
    {
      title: "Today's Revenue",
      value: formatPrice(stats?.todayRevenue || 0),
      description: "Revenue generated today",
      icon: TrendingUp,
      change: "+18%",
      changeType: "positive" as const,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div className="flex items-center gap-1 text-xs">
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.changeType === "positive" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
