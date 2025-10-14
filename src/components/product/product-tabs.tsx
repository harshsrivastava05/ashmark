"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface ProductTabsProps {
  product: {
    id: string
    name: string
    description: string | null
    sizes: string[]
    colors: string[]
  }
}

export function ProductTabs({ product }: ProductTabsProps) {
  // Mock reviews data - in real app, fetch from API
  const reviews = [
    {
      id: 1,
      user: "Rahul S.",
      rating: 5,
      comment: "Excellent quality t-shirt! The fabric is soft and comfortable. Highly recommended!",
      date: "2025-01-15",
      verified: true,
    },
    {
      id: 2,
      user: "Priya M.",
      rating: 4,
      comment: "Good quality product. Fast delivery. The fit is perfect as per size chart.",
      date: "2025-01-10",
      verified: true,
    },
    {
      id: 3,
      user: "Amit K.",
      rating: 5,
      comment: "Love the design and quality. Colors remain vibrant even after multiple washes.",
      date: "2025-01-08",
      verified: false,
    },
  ]

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium">Key Features:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Premium quality cotton blend fabric</li>
                  <li>Comfortable regular fit design</li>
                  <li>Machine washable - colors won't fade</li>
                  <li>Soft and breathable material</li>
                  <li>Durable construction with reinforced seams</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Material</h4>
                  <p className="text-muted-foreground">100% Premium Cotton</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Fit</h4>
                  <p className="text-muted-foreground">Regular Fit</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Care Instructions</h4>
                  <p className="text-muted-foreground">Machine wash cold, tumble dry low</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Origin</h4>
                  <p className="text-muted-foreground">Made in India</p>
                </div>
              </div>

              {product.sizes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Available Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Badge key={size} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Available Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Badge key={color} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          {/* Rating Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {reviews.length} reviews
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
