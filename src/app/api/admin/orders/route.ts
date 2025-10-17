import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'

    const skip = (page - 1) * limit
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const orderBy: any = {}
    orderBy[sort] = 'desc'

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
          shippingAddress: {
            select: {
              city: true,
              state: true,
              pincode: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.order.count({ where }),
    ])

    const serialized = orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      user: {
        id: o.user?.id || '',
        name: o.user?.name || null,
        email: o.user?.email || '',
        image: o.user?.image || null,
      },
      items: o.items.map((it) => ({
        quantity: it.quantity,
        product: {
          name: it.product.name,
          images: it.product.images,
        },
      })),
      shippingAddress: o.shippingAddress
        ? {
            city: o.shippingAddress.city,
            state: o.shippingAddress.state,
            pincode: o.shippingAddress.pincode,
          }
        : null,
    }))

    return NextResponse.json({
      orders: serialized,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
