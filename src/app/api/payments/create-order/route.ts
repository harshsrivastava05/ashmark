import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, addressId, idempotencyKey } = await request.json()

    // Load cart items to create order items from real data
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    // Compute totals from cart to avoid hardcoded values
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
    const shipping = subtotal > 1000 ? 0 : (cartItems.length > 0 ? 100 : 0)
    const tax = 0
    const computedTotal = subtotal + shipping + tax

    // If client sent amount, prefer computed to avoid tampering
    const finalAmount = computedTotal

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    })

    // Idempotent create/update: if idempotencyKey (orderId) provided, update it; else create new
    let order
    if (idempotencyKey) {
      order = await prisma.order.update({
        where: { id: idempotencyKey },
        data: {
          total: finalAmount,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          razorpayOrderId: razorpayOrder.id,
          addressId,
        },
      })
    } else {
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          total: finalAmount,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          razorpayOrderId: razorpayOrder.id,
          addressId,
          items: {
            create: cartItems.map((ci) => ({
              productId: ci.productId,
              quantity: ci.quantity,
              price: Number(ci.product.price),
              size: ci.size || undefined,
              color: ci.color || undefined,
            })),
          },
        },
      })
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
