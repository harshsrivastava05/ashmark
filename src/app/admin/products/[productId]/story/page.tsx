'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Upload, X, Save, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  storyTitle?: string
  storyContent?: string
  storyImages: string[]
  category: {
    name: string
  }
}

export default function ProductStoryPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storyTitle, setStoryTitle] = useState('')
  const [storyContent, setStoryContent] = useState('')
  const [storyImages, setStoryImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    if (params.productId) {
      fetchProduct()
    }
  }, [params.productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
        setStoryTitle(data.product.storyTitle || '')
        setStoryContent(data.product.storyContent || '')
        setStoryImages(data.product.storyImages || [])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch product details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.url
        }
        throw new Error('Upload failed')
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setStoryImages(prev => [...prev, ...uploadedUrls])
      
      toast({
        title: 'Success',
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setStoryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!storyTitle.trim() || !storyContent.trim()) {
      toast({
        title: 'Error',
        description: 'Story title and content are required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${params.productId}/story`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyTitle: storyTitle.trim(),
          storyContent: storyContent.trim(),
          storyImages,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product story updated successfully',
        })
        router.push(`/admin/products/${params.productId}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update story')
      }
    } catch (error) {
      console.error('Error saving story:', error)
      toast({
        title: 'Error',
        description: 'Failed to save product story',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the story for this product?')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${params.productId}/story`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product story removed successfully',
        })
        setStoryTitle('')
        setStoryContent('')
        setStoryImages([])
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove story')
      }
    } catch (error) {
      console.error('Error removing story:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove product story',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/products/${params.productId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Product
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Product Story</h1>
          <p className="text-gray-600 mt-2">
            {product.name} • {product.category.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={saving || (!storyTitle && !storyContent)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Story
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Story'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="storyTitle">Story Title</Label>
              <Input
                id="storyTitle"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Enter the story title..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="storyContent">Story Content</Label>
              <Textarea
                id="storyContent"
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Tell the story behind this product..."
                className="mt-2 min-h-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Story Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUpload">Upload Images</Label>
                <div className="mt-2">
                  <input
                    id="imageUpload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    disabled={uploadingImages}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImages ? 'Uploading...' : 'Choose Images'}
                  </Button>
                </div>
              </div>

              {storyImages.length > 0 && (
                <div>
                  <Label>Current Images ({storyImages.length})</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {storyImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`Story image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}