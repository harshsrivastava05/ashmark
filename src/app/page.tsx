import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Star } from "lucide-react"
import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/product/product-card"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default async function HomePage() {
  const [featuredProducts, trendingProducts] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { trending: true },
      take: 4,
      include: { category: true },
    }),
  ])

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <video
            autoPlay
            muted
            loop
            className="absolute inset-0 hero-video"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              ASHMARK
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Premium T-Shirts. Unique Designs. Unmatched Quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-crimson-600 hover:bg-crimson-700">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Our Products Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Products</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our latest drop of premium t-shirts designed for style and comfort
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={{ ...product, price: product.price.toNumber(), comparePrice: product.comparePrice?.toNumber() }} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Most selling products loved by our customers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={{ ...product, price: product.price.toNumber(), comparePrice: product.comparePrice?.toNumber() }} />
              ))}
            </div>
          </div>
        </section>

        {/* Our Store Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Store</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Visit us at our physical location
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">ASHMARK Flagship Store</h3>
                <address className="not-italic text-muted-foreground mb-6">
                  <p>123 Fashion Street</p>
                  <p>Mumbai, Maharashtra 400001</p>
                  <p>India</p>
                  <p className="mt-2">Phone: +91 9876543210</p>
                  <p>Email: store@ashmark.com</p>
                </address>
                <Button asChild>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Directions
                  </a>
                </Button>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8751!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3Msm1MidMpJ?"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real reviews from satisfied customers
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Rahul Sharma",
                  rating: 5,
                  review: "Amazing quality t-shirts! The fabric is so comfortable and the designs are unique. Highly recommended!",
                  verified: true,
                },
                {
                  name: "Priya Patel",
                  rating: 5,
                  review: "Love shopping at ASHMARK. Fast delivery and excellent customer service. Will definitely order again!",
                  verified: true,
                },
                {
                  name: "Amit Kumar",
                  rating: 5,
                  review: "Best t-shirt collection I've seen. The fit is perfect and colors remain vibrant even after multiple washes.",
                  verified: true,
                },
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{testimonial.review}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
