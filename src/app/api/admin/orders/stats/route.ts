import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const [
      totalStats,
      todayStats,
      statusStats,
    ] = await Promise.all([
      prisma.order.aggregate({
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    const statusCounts = statusStats.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalOrders: totalStats._count.id,
      totalRevenue: Number(totalStats._sum.total) || 0,
      averageOrderValue: Number(totalStats._avg.total) || 0,
      pendingOrders: statusCounts['PENDING'] || 0,
      completedOrders: statusCounts['DELIVERED'] || 0,
      cancelledOrders: statusCounts['CANCELLED'] || 0,
      todayOrders: todayStats._count.id,
      todayRevenue: Number(todayStats._sum.total) || 0,
      growthRate: 12.5, // Calculate from historical data
    })
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order statistics' },
      { status: 500 }
    )
  }
}
