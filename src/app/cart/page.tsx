"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { CartItem } from "@/components/cart/cart-item"
import { EmptyCart } from "@/components/cart/empty-cart"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface CartItemType {
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

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { cartItems, updateQuantity, removeItem, loading } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)
  const [applyingPromo, setApplyingPromo] = useState(false)

  const handleCheckout = () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      })
      router.push('/login')
      return
    }
    router.push('/checkout')
  }

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Promo Code Required",
        description: "Please enter a promo code",
        variant: "destructive",
      })
      return
    }

    if (!session) {
      toast({
        title: "Login Required",
        description: "Please log in to apply promo code",
        variant: "destructive",
      })
      return
    }

    setApplyingPromo(true)
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode: promoCode.trim(), subtotal }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Invalid Promo Code",
          description: data.error || "This promo code cannot be applied",
          variant: "destructive",
        })
        return
      }

      setAppliedPromoCode(data.code)
      setDiscount(data.discount || 0)
      toast({
        title: "Promo Code Applied",
        description: `Discount of ${formatPrice(data.discount || 0)} applied!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null)
    setDiscount(0)
    setPromoCode("")
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )
  const shipping = subtotal > 1000 ? 0 : 100
  const total = subtotal + shipping - discount

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <CartSkeleton />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <EmptyCart />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Promo Code Section */}
                  <div className="space-y-2">
                    {appliedPromoCode ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                            {appliedPromoCode}
                          </span>
                          <span className="text-xs font-bold text-green-700 dark:text-green-300">
                            -{formatPrice(discount)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-foreground hover:text-destructive"
                          onClick={handleRemovePromoCode}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyPromoCode()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleApplyPromoCode}
                          disabled={applyingPromo || !promoCode.trim()}
                          variant="outline"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-foreground">
                    <span className="text-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span className="text-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-700 dark:text-green-400 font-semibold">Free</span>
                      ) : (
                        <span className="font-medium text-foreground">{formatPrice(shipping)}</span>
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span className="font-medium">Discount</span>
                      <span className="font-semibold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg text-foreground">
                    <span className="text-foreground">Total</span>
                    <span className="text-crimson-700 dark:text-crimson-400">{formatPrice(total)}</span>
                  </div>
                  <Button
                    className="w-full bg-crimson-600 hover:bg-crimson-700"
                    onClick={handleCheckout}
                  >
                    {session ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </Button>
                  {subtotal < 1000 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Add {formatPrice(1000 - subtotal)} more for free shipping
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function CartSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="w-20 h-20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
