import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Size, Color } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const productId: string = String(body.productId || '')
    const quantity: number = Math.max(1, Math.min(99, Number(body.quantity || 1)))
    // Normalize variant values to Prisma enums if provided
    const size: Size | null = body.size
      ? (String(body.size).toUpperCase() as Size)
      : null
    const color: Color | null = body.color
      ? (String(body.color).toUpperCase() as Color)
      : null

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Validate enum values against schema if provided
    if (size && !Object.values(Size).includes(size)) {
      return NextResponse.json({ error: 'Invalid size value' }, { status: 400 })
    }
    if (color && !Object.values(Color).includes(color)) {
      return NextResponse.json({ error: 'Invalid color value' }, { status: 400 })
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: session.user.id, productId, size, color },
    })

    let cartItem
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
          size,
          color,
        },
        include: { product: true },
      })
    }

    const serialized = {
      ...cartItem,
      product: {
        ...cartItem.product,
        price: Number(cartItem.product.price),
        comparePrice: cartItem.product.comparePrice ? Number(cartItem.product.comparePrice) : null,
      }
    }

    return NextResponse.json({ success: true, cartItem: serialized })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    })

    const cartItems = items.map((it) => ({
      ...it,
      product: {
        ...it.product,
        price: Number(it.product.price),
        comparePrice: it.product.comparePrice ? Number(it.product.comparePrice) : null,
      },
    }))

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Fetch cart error:', error)
    return NextResponse.json({ cartItems: [] }, { status: 200 })
  }
}
