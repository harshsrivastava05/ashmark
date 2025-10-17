'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart, Heart } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    images: string[]
    featured: boolean
    trending: boolean
    category: {
      name: string
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercentage = product.comparePrice
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0

  const [isPending] = useTransition()
  const [adding, setAdding] = useState(false)

  const addToCart = async () => {
    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to add to cart')
      }
      toast({ title: 'Added to Cart', description: `${product.name} added to your cart.` })
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add to cart', variant: 'destructive' })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-crimson-600">Featured</Badge>
          )}
          {product.trending && (
            <Badge variant="secondary">Trending</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-green-600">{discountPercentage}% OFF</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">
          {product.category.name}
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-crimson-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPrice(Number(product.price))}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(Number(product.comparePrice))}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-crimson-600 hover:bg-crimson-700" onClick={addToCart} disabled={adding || isPending}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {adding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
