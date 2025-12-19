"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, MapPin, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
}

interface AddressFormProps {
  selectedAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddressUpdate: () => void
}

export function AddressForm({
  selectedAddress,
  onAddressSelect,
  onAddressUpdate,
}: AddressFormProps) {
  const [userAddresses, setUserAddresses] = useState<Address[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")

  /* ---------------------------------- */
  /* Fetch addresses */
  /* ---------------------------------- */
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    const res = await fetch("/api/addresses")
    if (res.ok) {
      const data = await res.json()
      setUserAddresses(data.addresses)
    }
  }

  /* ---------------------------------- */
  /* Validation */
  /* ---------------------------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.street.trim()) newErrors.street = "Street address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit Indian mobile number"
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "PIN code must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ---------------------------------- */
  /* Submit */
  /* ---------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!validateForm()) {
      setFormError("Please fix the errors below before continuing.")
      return
    }

    const url = editingAddress
      ? `/api/addresses/${editingAddress.id}`
      : "/api/addresses"

    const method = editingAddress ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        phone: `+91${formData.phone}`,
        country: "India",
      }),
    })

    if (!res.ok) {
      setFormError("Failed to save address. Please try again.")
      return
    }

    setIsAddingNew(false)
    setEditingAddress(null)
    resetForm()
    fetchAddresses()
    onAddressUpdate()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: false,
    })
    setErrors({})
    setFormError("")
  }

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Address
        </CardTitle>
        <CardDescription>Select your delivery location</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAddress?.id || ""}
          onValueChange={(value) => {
            const addr = userAddresses.find((a) => a.id === value)
            if (addr) onAddressSelect(addr)
          }}
        >
          {userAddresses.map((address) => (
            <div key={address.id} className="flex gap-3 p-3 bg-muted/40">
              <RadioGroupItem value={address.id} />
              <div className="flex-1">
                <div className="font-medium">{address.name}</div>
                <div className="text-sm text-muted-foreground">
                  {address.street}, {address.city}, {address.state} - {address.pincode}
                </div>
                <div className="text-sm">Phone: {address.phone}</div>
              </div>
            </div>
          ))}
        </RadioGroup>

        <Separator />

        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add New Address
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-md bg-red-50 border border-red-300 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
              </div>

              <div>
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Input value="+91" disabled className="w-20" />
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
              </div>

              <div>
                <Label>Street Address</Label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
                {errors.street && <p className="text-red-600 text-sm">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                </div>

                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                  {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
                </div>
              </div>

              <div>
                <Label>PIN Code</Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pincode: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
                {errors.pincode && <p className="text-red-600 text-sm">{errors.pincode}</p>}
              </div>

              <div>
                <Label>Country</Label>
                <Input value="India" disabled />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full bg-crimson-600 hover:bg-crimson-700">
                  Save Address
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
