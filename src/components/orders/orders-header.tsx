import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Package, Truck, CheckCircle } from "lucide-react"

export function OrdersHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {/* Order Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: ShoppingBag, label: "Total Orders", count: 24, color: "text-blue-600" },
          { icon: Package, label: "Processing", count: 2, color: "text-yellow-600" },
          { icon: Truck, label: "Shipped", count: 1, color: "text-orange-600" },
          { icon: CheckCircle, label: "Delivered", count: 21, color: "text-green-600" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
