import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: { category: true },
        },
      },
    })

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity = 1, size, color } = await request.json()

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId: session.user.id,
          productId,
          size,
          color,
        },
      },
    })

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: { category: true },
          },
        },
      })
      return NextResponse.json({ cartItem: updatedItem })
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
          size,
          color,
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      })
      return NextResponse.json({ cartItem: newItem })
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
