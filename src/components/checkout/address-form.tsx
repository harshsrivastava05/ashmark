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
import { toast } from "@/components/ui/use-toast"
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
  addresses: Address[]
  selectedAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddressUpdate: () => void
}

export function AddressForm({
  selectedAddress,
  onAddressSelect,
  onAddressUpdate
}: AddressFormProps) {

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

  const [userAddresses, setUserAddresses] = useState<Address[]>([])

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

  /* =========================
     VALIDATION HELPERS
  ========================== */

  const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone)
  const isValidPincode = (pin: string) => /^\d{6}$/.test(pin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidPhone(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      })
      return
    }

    if (!isValidPincode(formData.pincode)) {
      toast({
        title: "Invalid PIN Code",
        description: "PIN code must be exactly 6 digits",
        variant: "destructive",
      })
      return
    }

    const url = editingAddress
      ? `/api/addresses/${editingAddress.id}`
      : "/api/addresses"

    const method = editingAddress ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      toast({
        title: "Success",
        description: editingAddress ? "Address updated" : "Address added",
      })
      setIsAddingNew(false)
      setEditingAddress(null)
      onAddressUpdate()
      fetchAddresses()
    } else {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (address: Address) => {
    setFormData(address)
    setEditingAddress(address)
    setIsAddingNew(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return
    await fetch(`/api/addresses/${id}`, { method: "DELETE" })
    fetchAddresses()
    onAddressUpdate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Address
        </CardTitle>
        <CardDescription>Select delivery address</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAddress?.id || ""}
          onValueChange={(id) => {
            const addr = userAddresses.find(a => a.id === id)
            if (addr) onAddressSelect(addr)
          }}
        >
          {userAddresses.map(addr => (
            <div key={addr.id} className="flex gap-3 p-3 bg-muted/30">
              <RadioGroupItem value={addr.id} />
              <div className="flex-1">
                <div className="font-medium">{addr.name}</div>
                <div className="text-sm text-muted-foreground">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </div>
                <div className="text-sm">+91 {addr.phone}</div>
                {addr.isDefault && <Badge>Default</Badge>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleEdit(addr)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(addr.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
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

              <div>
                <Label>Full Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Input value="+91" disabled className="w-16 text-center" />
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Street</Label>
                <Input required value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input required value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input required value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PIN Code</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pincode: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value="India" disabled />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-crimson-600">
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
