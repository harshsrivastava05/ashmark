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

type Errors = Partial<Record<keyof Address, string>>

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
    isDefault: false,
  })

  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: "India",
        type: address.type || "home",
        isDefault: address.isDefault,
      })
    }
  }, [address])

  const validate = () => {
    const newErrors: Errors = {}

    if (!/^[A-Za-z ]{2,50}$/.test(formData.name))
      newErrors.name = "Enter a valid full name"

    if (!/^[6-9]\d{9}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit Indian number"

    if (!formData.street.trim())
      newErrors.street = "Street address is required"

    if (!/^[A-Za-z ]+$/.test(formData.city))
      newErrors.city = "Enter valid city"

    if (!/^[A-Za-z ]+$/.test(formData.state))
      newErrors.state = "Enter valid state"

    if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Enter valid 6-digit PIN code"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const url = address
      ? `/api/addresses/${address.id}`
      : "/api/addresses"

    const method = address ? "PUT" : "POST"

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        phone: `+91${formData.phone}`,
      }),
    })

    onSave()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add Address"}</DialogTitle>
          <DialogDescription>
            {address
              ? "Update your address details"
              : "Add a new delivery address"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-4">

            {/* Name */}
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Input value="+91" disabled className="w-16" />
                <Input
                  value={formData.phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Address Type */}
            <div>
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

            {/* Street */}
            <div>
              <Label>Street</Label>
              <Input
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
              />
              {errors.street && (
                <p className="text-sm text-red-500">{errors.street}</p>
              )}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      city: e.target.value.replace(/[^A-Za-z ]/g, ""),
                    })
                  }
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value.replace(/[^A-Za-z ]/g, ""),
                    })
                  }
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Pincode & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PIN Code</Label>
                <Input
                  value={formData.pincode}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pincode: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
                {errors.pincode && (
                  <p className="text-sm text-red-500">{errors.pincode}</p>
                )}
              </div>

              <div>
                <Label>Country</Label>
                <Input value="India" disabled />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-crimson-600 hover:bg-crimson-700">
              {address ? "Update Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
