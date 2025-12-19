"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function EditAddressDialog({
  open,
  onOpenChange,
  address,
  onSave,
}: EditAddressDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "", // ONLY 10 digits (no +91 here)
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone.replace("+91", ""),
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: "India",
      })
    }
  }, [address])

  // 🔒 STRICT VALIDATION
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!/^[A-Za-z ]+$/.test(formData.name))
      newErrors.name = "Name should contain only alphabets"

    if (!/^[6-9]\d{9}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit Indian mobile number"

    if (!formData.street.trim())
      newErrors.street = "Street address is required"

    if (!/^[A-Za-z ]+$/.test(formData.city))
      newErrors.city = "City should contain only alphabets"

    if (!/^[A-Za-z ]+$/.test(formData.state))
      newErrors.state = "State should contain only alphabets"

    if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "PIN code must be 6 digits"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...formData,
      phone: `+91${formData.phone}`,
      country: "India",
    }

    const url = address
      ? `/api/addresses/${address.id}`
      : "/api/addresses"

    const method = address ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) onSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0">
        <DialogHeader>
          <DialogTitle>
            {address ? "Edit Address" : "Add Address"}
          </DialogTitle>
          <DialogDescription>
            Delivery address details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value.replace(/[^A-Za-z ]/g, ""),
                })
              }
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* PHONE */}
          <div>
            <Label>Phone Number</Label>
            <div className="flex gap-2">
              <Input value="+91" disabled className="w-16 text-center" />
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
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          {/* STREET */}
          <div>
            <Label>Street</Label>
            <Input
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
            />
            {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
          </div>

          {/* CITY + STATE */}
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
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
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
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
            </div>
          </div>

          {/* PIN + COUNTRY */}
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
              {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
            </div>

            <div>
              <Label>Country</Label>
              <Input value="India" disabled />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-crimson-600 hover:bg-crimson-700">
              {address ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
