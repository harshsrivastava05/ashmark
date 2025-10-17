"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Edit, Camera, Star } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface ProfileStats {
  totalOrders: number
  // totalSpent: number
  loyaltyPoints: number
  // memberTier: string
  memberSince: string
}

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileStats()
  }, [])

  const fetchProfileStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')
      const data = await response.json()
      setStats(data)
      setLoading(false)
      } catch (error) {
      console.error('Error fetching profile stats:', error)
      setLoading(false)
    }
  }

  // Mock data - in real app, fetch from API
  const displayStats = stats || {
    totalOrders: 0,
    // totalSpent: 0,
    loyaltyPoints: 0,
    // memberTier: 'Bronze',
    memberSince: new Date().toISOString().split('T')
  }

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentUser({ ...currentUser, ...updatedUser })
    setEditDialogOpen(false)
  }

  return (
    <>
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-20 h-20 bg-muted flex items-center justify-center overflow-hidden">
                {currentUser.image ? (
                  <Image
                    src={currentUser.image}
                    alt={currentUser.name || 'Profile'}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {currentUser.name || 'ASHMARK Customer'}
                    {currentUser.role === 'ADMIN' && (
                      <Badge className="bg-crimson-600 border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {formatDate(new Date(displayStats.memberSince[0] + 'T' + displayStats.memberSince[1]))}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(true)}
                  className="border-0 bg-muted/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 p-3">
                  <div className="text-xl font-bold text-crimson-600">
                    {displayStats.totalOrders}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                {/* <div className="bg-muted/30 p-3">
                  <div className="text-xl font-bold text-crimson-600">
                    ₹{displayStats.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div> */}
                <div className="bg-muted/30 p-3">
                  <div className="text-xl font-bold text-crimson-600 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {displayStats.loyaltyPoints}
                  </div>
                  <div className="text-sm text-muted-foreground">Loyalty Points</div>
                </div>
                {/* <div className="bg-muted/30 p-3">
                  <div className="text-xl font-bold text-green-600">Gold</div>
                  <div className="text-sm text-muted-foreground">Member Tier</div>
                </div> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={currentUser}
        onSave={handleProfileUpdate}
      />
    </>
  )
}
