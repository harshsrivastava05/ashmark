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
    const status = searchParams.get('status') || undefined
    const paymentStatus = searchParams.get('paymentStatus') || undefined
    const search = searchParams.get('search') || undefined

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (paymentStatus && paymentStatus !== 'all') where.paymentStatus = paymentStatus
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Order ID',
      'Date',
      'Status',
      'Payment Status',
      'Customer Name',
      'Customer Email',
      'Items',
      'Total',
      'City',
      'State',
      'Pincode',
    ]

    const rows = orders.map((o) => [
      o.id,
      o.createdAt.toISOString(),
      o.status,
      o.paymentStatus,
      o.user?.name ?? '',
      o.user?.email ?? '',
      o.items.reduce((sum, it) => sum + it.quantity, 0).toString(),
      Number(o.total).toString(),
      o.shippingAddress ? o.shippingAddress.city : '',
      o.shippingAddress ? o.shippingAddress.state : '',
      o.shippingAddress ? o.shippingAddress.pincode : '',
    ])

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=orders-${new Date().toISOString().slice(0,10)}.csv`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error exporting orders:', error)
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 })
  }
}

