import { prisma } from '@/lib/db'
import { ProductStory } from './product-story'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { jsonToStringArray } from '@/lib/utils'

export async function ProductStoriesSection() {
  try {
    // Fetch products that have stories
    const productsWithStories = await prisma.product.findMany({
      where: {
        AND: [
          { storyTitle: { not: null } },
          { storyContent: { not: null } },
          { storyTitle: { not: '' } },
          { storyContent: { not: '' } }
        ]
      },
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 6 // Show latest 6 products with stories
    })

    // type ProductWithStory = Awaited<ReturnType<typeof prisma.product.findMany>>[number]
    type ProductWithStory = (typeof productsWithStories)[number]

    if (productsWithStories.length === 0) {
      return (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Product Stories Coming Soon
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're working on bringing you the inspiring stories behind our products. Check back soon to discover the craftsmanship and passion that goes into each piece.
              </p>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Product Stories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Stories Behind Our Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the inspiration, craftsmanship, and passion that goes into creating each piece in our collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsWithStories.map((product: ProductWithStory) => {
              const images = jsonToStringArray(product.images)
              return (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    {images.length > 0 ? (
                      <Image
                        src={images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.storyTitle}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {product.storyContent}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{Number(product.price)}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Read Full Story →
                    </Link>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error fetching product stories:', error)
    return null
  }
}