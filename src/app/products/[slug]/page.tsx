import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ProductImages } from "@/components/product/product-images"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import { prisma } from "@/lib/db"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const product = await prisma.product.findUnique({
    where: { slug: (await params).slug },
    include: {
      category: true,
    },
  })

  if (!product) {
    notFound()
  }

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <ProductImages images={product.images} name={product.name} />
            
            {/* Product Info */}
            <ProductInfo product={{ ...product, price: Number(product.price), comparePrice: product.comparePrice ? Number(product.comparePrice) : null }} />
          </div>
          
          {/* Product Details Tabs */}
          <div className="mt-16">
            <ProductTabs product={serializedProduct as any} />
          </div>
          
          {/* Related Products */}
          <div className="mt-16">
            <RelatedProducts
              categoryId={product.categoryId}
              currentProductId={product.id}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
  })

  return products.map((product) => ({
    slug: product.slug,
  }))
}