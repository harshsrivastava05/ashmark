"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useRazorpay } from "react-razorpay"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddressForm } from "@/components/checkout/address-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/cart-context"
import { Input } from "@/components/ui/input"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { error, isLoading, Razorpay } = useRazorpay()
  const { cartItems } = useCart()
  
  type Address = {
    id: string
    name: string
    phone: string
    street: string
    city: string
    state: string
    pincode: string
    country: string
    isDefault: boolean
  }
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [orderTotal, setOrderTotal] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)
  const [applyingPromo, setApplyingPromo] = useState(false)

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data: { addresses: Address[] } = await response.json()
        setAddresses(data.addresses)
        const defaultAddress = data.addresses.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }, [])

  const calculateOrderTotal = useCallback(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )
    const shipping = subtotal > 1000 ? 0 : 100
    setOrderTotal(subtotal + shipping - discount)
  }, [cartItems, discount])

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Promo Code Required",
        description: "Please enter a promo code",
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
      calculateOrderTotal()
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
    calculateOrderTotal()
  }

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    if (cartItems.length === 0) {
      router.push('/cart')
      return
    }

    fetchAddresses()
    calculateOrderTotal()
  }, [session, router, fetchAddresses, calculateOrderTotal, cartItems])

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderTotal,
          addressId: selectedAddress.id,
          promoCode: appliedPromoCode || undefined,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()

      type RazorpayResponse = {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ASHMARK",
        description: "Purchase from ASHMARK",
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
              }),
            })

            if (verifyResponse.ok) {
              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully!",
              })
              router.push(`/orders/${orderData.orderId}`)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if payment was deducted.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: selectedAddress?.phone || '',
        },
        theme: {
          color: "#dc2626",
        },
      }

      const razorpayInstance = new Razorpay(options as any)
      razorpayInstance.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AddressForm
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                onAddressUpdate={fetchAddresses}
              />
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Promo Code Section */}
                  <div className="mb-4 space-y-2">
                    {appliedPromoCode ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {appliedPromoCode}
                          </span>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            -{formatPrice(discount)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
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

                  <OrderSummary promoCode={appliedPromoCode} discount={discount} />
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between font-semibold text-lg mb-4">
                      <span>Total</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                    <Button
                      className="w-full bg-crimson-600 hover:bg-crimson-700"
                      onClick={handlePayment}
                      disabled={processing || isLoading || !selectedAddress}
                    >
                      {processing ? "Processing..." : `Pay ${formatPrice(orderTotal)}`}
                    </Button>
                    {error && (
                      <p className="text-sm text-destructive mt-2">
                        Error loading payment gateway. Please refresh the page.
                      </p>
                    )}
                  </div>
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
