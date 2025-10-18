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
}: { params: { slug: string } }) {
  const { slug } = params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ProductImages images={product.images} name={product.name} />
            <ProductInfo
              product={{
                ...product,
                price: Number(product.price),
                comparePrice: product.comparePrice
                  ? Number(product.comparePrice)
                  : null,
              }}
            />
          </div>

          <div className="mt-16">
            <ProductTabs
              product={{
                ...product,
                price: Number(product.price),
                comparePrice: product.comparePrice
                  ? Number(product.comparePrice)
                  : null,
              }}
            />
          </div>

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
