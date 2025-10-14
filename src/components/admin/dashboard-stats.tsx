import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface DashboardStatsProps {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalRevenue: number
}

export function DashboardStats({
  totalOrders,
  totalProducts,
  totalUsers,
  totalRevenue
}: DashboardStatsProps) {
  // Mock data for percentage changes - in real app, calculate from historical data
  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      description: "Total earnings from sales",
      icon: TrendingUp,
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      description: "Orders placed this month",
      icon: ShoppingCart,
      change: "+8.3%",
      changeType: "positive" as const,
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      description: "Active products in catalog",
      icon: Package,
      change: "+2.1%",
      changeType: "positive" as const,
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      description: "Registered customers",
      icon: Users,
      change: "+15.7%",
      changeType: "positive" as const,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-0 shadow-md bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.changeType === "positive" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
