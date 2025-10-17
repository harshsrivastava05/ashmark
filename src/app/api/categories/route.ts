import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }
}

