import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ruler, Shirt, AlertCircle } from "lucide-react"

export default function SizeGuidePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Size Guide</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your perfect fit with our comprehensive size guide. 
              We've designed our t-shirts to be true to size for the best comfort.
            </p>
          </div>

          {/* How to Measure */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">How to Measure</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-crimson-600" />
                    Chest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape measure horizontal.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="h-5 w-5 text-crimson-600" />
                    Length
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Measure from the highest point of the shoulder to the bottom hem.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-crimson-600" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Wear a well-fitting t-shirt while measuring and keep the tape snug but not tight.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Size Chart */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Size Chart</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Chest (inches)</TableHead>
                      <TableHead>Chest (cm)</TableHead>
                      <TableHead>Length (inches)</TableHead>
                      <TableHead>Length (cm)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">XS</TableCell>
                      <TableCell>32-34</TableCell>
                      <TableCell>81-86</TableCell>
                      <TableCell>26</TableCell>
                      <TableCell>66</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">S</TableCell>
                      <TableCell>34-36</TableCell>
                      <TableCell>86-91</TableCell>
                      <TableCell>27</TableCell>
                      <TableCell>69</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">M</TableCell>
                      <TableCell>36-38</TableCell>
                      <TableCell>91-97</TableCell>
                      <TableCell>28</TableCell>
                      <TableCell>71</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">L</TableCell>
                      <TableCell>38-40</TableCell>
                      <TableCell>97-102</TableCell>
                      <TableCell>29</TableCell>
                      <TableCell>74</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">XL</TableCell>
                      <TableCell>40-42</TableCell>
                      <TableCell>102-107</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>76</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">XXL</TableCell>
                      <TableCell>42-44</TableCell>
                      <TableCell>107-112</TableCell>
                      <TableCell>31</TableCell>
                      <TableCell>79</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Fit Guide */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Fit Guide</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Regular Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our regular fit t-shirts are designed for everyday comfort with a relaxed silhouette 
                    that's not too tight or too loose.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Comfortable chest measurement</li>
                    <li>• Standard sleeve length</li>
                    <li>• Relaxed through the body</li>
                    <li>• Perfect for casual wear</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Slim Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our slim fit t-shirts offer a more tailored look while maintaining comfort and mobility.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Tapered through the body</li>
                    <li>• Shorter sleeve length</li>
                    <li>• Modern, fitted silhouette</li>
                    <li>• Great for layering</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Care Instructions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Care Instructions</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Washing</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Machine wash cold with like colors</li>
                      <li>• Use gentle cycle</li>
                      <li>• Avoid bleach</li>
                      <li>• Turn inside out before washing</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Drying & Ironing</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Tumble dry low heat</li>
                      <li>• Remove promptly from dryer</li>
                      <li>• Iron on low heat if needed</li>
                      <li>• Do not over-dry</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Size Recommendation */}
          <div className="text-center">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Still Not Sure?</h2>
                <p className="text-muted-foreground mb-6">
                  If you're between sizes, we recommend sizing up for a more relaxed fit or sizing down 
                  for a more fitted look. Our customer service team is always happy to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="inline-block">
                    <button className="px-6 py-2 bg-crimson-600 text-white rounded-md hover:bg-crimson-700 transition-colors">
                      Contact Us
                    </button>
                  </a>
                  <a href="/products" className="inline-block">
                    <button className="px-6 py-2 border border-crimson-600 text-crimson-600 rounded-md hover:bg-crimson-50 transition-colors">
                      Shop Now
                    </button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}