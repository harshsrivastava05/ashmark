"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface Address {
  id: string
  name: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  type?: "home" | "work" | "other"
}

interface EditAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address | null
  onSave: () => void
}

export function EditAddressDialog({
  open,
  onOpenChange,
  address,
  onSave,
}: EditAddressDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "home" as "home" | "work" | "other",
  })

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone.replace(/\D/g, ""), // sanitize
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode.replace(/\D/g, ""),
        country: "India",
        type: address.type || "home",
      })
    }
  }, [address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // FINAL CLIENT VALIDATION
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      })
      return
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      toast({
        title: "Invalid PIN code",
        description: "PIN code must be exactly 6 digits",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/addresses/${address?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          country: "India",
        }),
      })

      if (!response.ok) throw new Error()

      toast({
        title: "Success",
        description: "Address updated successfully",
      })

      onSave()
    } catch {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-0 max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
          <DialogDescription>Update your address details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* NAME */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "")
                  if (digits.length <= 10) {
                    setFormData({ ...formData, phone: digits })
                  }
                }}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            {/* TYPE */}
            <div className="space-y-2">
              <Label>Address Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* STREET */}
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                required
              />
            </div>

            {/* CITY & STATE */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
              />
            </div>

            {/* PIN & COUNTRY */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                inputMode="numeric"
                maxLength={6}
                placeholder="PIN Code"
                value={formData.pincode}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "")
                  if (digits.length <= 6) {
                    setFormData({ ...formData, pincode: digits })
                  }
                }}
                required
              />
              <Input value="India" disabled />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-crimson-600 hover:bg-crimson-700">
              Update Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
