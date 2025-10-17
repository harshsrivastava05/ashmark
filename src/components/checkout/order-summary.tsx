"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Truck, Receipt, Info } from "lucide-react"
import Image from "next/image"

interface CartItem {
  id: string
  quantity: number
  size?: string
  color?: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    slug: string
  }
}

export function OrderSummary() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.cartItems)
      }
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )
  const shipping = subtotal > 1000 ? 0 : 100
  const tax = 0
  const discount = subtotal > 2000 ? subtotal * 0.05 : 0
  const total = subtotal + shipping + tax - discount

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted"></div>
                  <div className="h-3 bg-muted w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order Summary
        </CardTitle>
        <CardDescription>
          Review your items before checkout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-muted/30">
              <Image
                src={item.product.images[0] || '/placeholder-product.jpg'}
                alt={item.product.name}
                width={48}
                height={48}
                className="object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.size && (
                    <Badge variant="outline" className="text-xs border-0 bg-muted/50">
                      {item.size}
                    </Badge>
                  )}
                  {item.color && (
                    <Badge variant="outline" className="text-xs border-0 bg-muted/50">
                      {item.color}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-medium text-sm">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4" />
              <span>Shipping</span>
            </div>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600 font-medium">FREE</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          
          {/* No tax applied */}

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount (5% off on orders above ₹2000)</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-crimson-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Shipping Info */}
        {subtotal < 1000 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Almost there!
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Add {formatPrice(1000 - subtotal)} more to get free shipping
                </p>
              </div>
            </div>
          </div>
        )}

        {shipping === 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400">
            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Free shipping applied!
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Your order qualifies for free delivery
                </p>
              </div>
            </div>
          </div>
        )}

        {discount > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400">
            <div className="flex items-start gap-2">
              <Receipt className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Discount applied!
                </p>
                <p className="text-green-700 dark:text-green-300">
                  You saved {formatPrice(discount)} on this order
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
