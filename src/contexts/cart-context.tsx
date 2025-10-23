"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"

interface CartItem {
  id: string
  productId: string
  quantity: number
  size?: string
  color?: string
  product: {
    id: string
    name: string
    price: number
    comparePrice?: number | null
    images: string[]
    slug: string
  }
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart items on mount and when session changes
  useEffect(() => {
    loadCartItems()
  }, [session])

  const loadCartItems = async () => {
    setLoading(true)
    try {
      if (session?.user) {
        // Load from database for logged-in users
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          setCartItems(data.cartItems || [])
        }
      } else {
        // Load from localStorage for guest users
        const savedCart = localStorage.getItem('guest-cart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGuestCart = (items: CartItem[]) => {
    if (!session?.user) {
      localStorage.setItem('guest-cart', JSON.stringify(items))
    }
  }

  const addToCart = async (productId: string, quantity = 1, size?: string, color?: string) => {
    try {
      if (session?.user) {
        // Add to database for logged-in users
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity, size, color }),
        })

        if (response.ok) {
          const data = await response.json()
          setCartItems(prev => {
            const existingIndex = prev.findIndex(item => 
              item.productId === productId && item.size === size && item.color === color
            )
            
            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity }
              return updated
            } else {
              return [...prev, data.cartItem]
            }
          })
        }
      } else {
        // Add to localStorage for guest users
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const product = await response.json()
          const newItem: CartItem = {
            id: `guest-${Date.now()}-${Math.random()}`,
            productId,
            quantity,
            size,
            color,
            product: {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
              images: product.images,
              slug: product.slug,
            },
          }

          setCartItems(prev => {
            const existingIndex = prev.findIndex(item => 
              item.productId === productId && item.size === size && item.color === color
            )
            
            if (existingIndex >= 0) {
              const updated = [...prev]
              updated[existingIndex] = { 
                ...updated[existingIndex], 
                quantity: updated[existingIndex].quantity + quantity 
              }
              return updated
            } else {
              return [...prev, newItem]
            }
          })
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId)
      return
    }

    try {
      if (session?.user) {
        // Update in database for logged-in users
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        })

        if (response.ok) {
          setCartItems(prev => 
            prev.map(item => 
              item.id === itemId ? { ...item, quantity } : item
            )
          )
        }
      } else {
        // Update in localStorage for guest users
        setCartItems(prev => {
          const updated = prev.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          )
          saveGuestCart(updated)
          return updated
        })
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      if (session?.user) {
        // Remove from database for logged-in users
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setCartItems(prev => prev.filter(item => item.id !== itemId))
        }
      } else {
        // Remove from localStorage for guest users
        setCartItems(prev => {
          const updated = prev.filter(item => item.id !== itemId)
          saveGuestCart(updated)
          return updated
        })
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const clearCart = () => {
    setCartItems([])
    if (!session?.user) {
      localStorage.removeItem('guest-cart')
    }
  }

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!session?.user && cartItems.length > 0) {
      saveGuestCart(cartItems)
    }
  }, [cartItems, session])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}