"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"
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



interface OrderSummaryProps {
  cartItems: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  promoCode?: string | null
}

export function OrderSummary({
  cartItems,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  promoCode
}: OrderSummaryProps) {

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
                <h4 className="font-medium text-sm line-clamp-2 text-foreground">
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
                  <span className="text-sm text-foreground/70">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-semibold text-sm text-foreground">
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
          <div className="flex justify-between text-sm text-foreground">
            <span className="text-foreground">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm text-foreground">
            <span className="text-foreground">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="font-semibold text-green-700 dark:text-green-400">FREE</span>
              ) : (
                <span className="font-medium text-foreground">{formatPrice(shipping)}</span>
              )}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
              <span className="font-medium">
                {promoCode ? `Discount (${promoCode})` : "Discount (5% off on orders above ₹2000)"}
              </span>
              <span className="font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold text-lg text-foreground">
            <span className="text-foreground">Total</span>
            <span className="text-crimson-700 dark:text-crimson-400">{formatPrice(total)}</span>
          </div>
        </div>

        {/* SHIPPING / ALERT SECTIONS */}

        {subtotal < 1000 && (
          <div className="p-3 rounded-md bg-black text-white border border-black">
            <p className="font-semibold">Almost there!</p>
            <p className="text-sm text-gray-300">
              Add {formatPrice(1000 - subtotal)} more to get free shipping
            </p>
          </div>
        )}

        {shipping === 0 && (
          <div className="p-3 rounded-md bg-black text-white border border-black">
            <p className="font-semibold">Free shipping applied!</p>
            <p className="text-sm text-gray-300">
              Your order qualifies for free delivery
            </p>
          </div>
        )}


        {discount > 0 && (
          <div className="p-3 rounded-md bg-black text-white border border-black">
            <p className="font-semibold">Discount applied!</p>
            <p className="text-sm text-gray-300">
              You saved {formatPrice(discount)} on this order
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
