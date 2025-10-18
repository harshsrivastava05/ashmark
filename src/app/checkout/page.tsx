"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useRazorpay } from "react-razorpay"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  // removed unused Separator import
import { AddressForm } from "@/components/checkout/address-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { error, isLoading, Razorpay } = useRazorpay()
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

  const fetchOrderSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        type CartItem = { product: { price: number | string }, quantity: number }
        const subtotal = (data.cartItems as CartItem[]).reduce(
          (sum: number, item: CartItem) => sum + Number(item.product.price) * item.quantity,
          0
        )
        const shipping = subtotal > 1000 ? 0 : 100
        setOrderTotal(subtotal + shipping)
      }
    } catch (error) {
      console.error('Error fetching order summary:', error)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    fetchAddresses()
    fetchOrderSummary()
  }, [session, router, fetchAddresses, fetchOrderSummary])

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
                  <OrderSummary />
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
