"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isNewUser } from "@/lib/promo-codes"

export function PromoMarquee() {
  const { data: session, status } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if marquee was dismissed
    const dismissed = localStorage.getItem('promo-marquee-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Check if user is new (signed up within last 15 days)
    if (status === 'authenticated' && session?.user) {
      // We need to fetch user data to check createdAt
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.createdAt) {
            const userIsNew = isNewUser(data.user.createdAt)
            setIsVisible(userIsNew)
          } else {
            setIsVisible(false)
          }
        })
        .catch(() => {
          // If error, don't show
          setIsVisible(false)
        })
    } else if (status === 'unauthenticated') {
      // Show for visitors (not logged in)
      setIsVisible(true)
    }
  }, [session, status])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('promo-marquee-dismissed', 'true')
  }

  if (isDismissed || !isVisible) {
    return null
  }

  return (
    <div className="relative bg-[#8B0000] text-white py-2 overflow-hidden">
      <div className="flex items-center justify-between">
        {/* Scrolling marquee */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex whitespace-nowrap" style={{
            animation: 'marquee 30s linear infinite',
          }}>
            <div className="flex items-center gap-8 px-8">
              <span className="font-semibold">Use Code: <strong>"FLATS"</strong> Flat 5% off on Pre-Paid Order</span>
              <span className="mx-4">•</span>
              <span className="font-semibold">Use Code: <strong>"SAMV20"</strong> Shop more than 1200 Get 200 off</span>
              <span className="mx-4">•</span>
              <span className="font-semibold">Use Code: <strong>"SAMV30"</strong> Shop more than 1600 get 300 off</span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center gap-8 px-8">
              <span className="font-semibold">Use Code: <strong>"FLATS"</strong> Flat 5% off on Pre-Paid Order</span>
              <span className="mx-4">•</span>
              <span className="font-semibold">Use Code: <strong>"SAMV20"</strong> Shop more than 1200 Get 200 off</span>
              <span className="mx-4">•</span>
              <span className="font-semibold">Use Code: <strong>"SAMV30"</strong> Shop more than 1600 get 300 off</span>
            </div>
          </div>
        </div>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-auto py-1 px-2 mr-4 flex-shrink-0 z-10"
          onClick={handleDismiss}
          aria-label="Dismiss promo banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

