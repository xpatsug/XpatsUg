import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Store, Palette, Share2, Smartphone } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">XpatsUg</h1>
          </div>
          <Link href="/auth/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Build Your Online Shop in Minutes
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Create a beautiful online presence for your business. Showcase products, connect with customers via WhatsApp,
          and grow your business in Uganda.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/login">
            <Button size="lg" className="h-14 px-8 text-lg">
              Start Building Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Everything You Need to Succeed</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Easy Shop Setup</h4>
              <p className="text-muted-foreground">
                Create your shop profile with photos, description, and contact details in minutes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">WhatsApp Integration</h4>
              <p className="text-muted-foreground">
                Let customers order directly via WhatsApp with pre-filled messages.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Custom Themes</h4>
              <p className="text-muted-foreground">
                Personalize your shop with custom colors, gradients, and dark mode.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Easy Sharing</h4>
              <p className="text-muted-foreground">
                Share your shop and individual products on social media with one click.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary border-0 text-primary-foreground">
          <CardContent className="py-16 text-center">
            <h3 className="text-4xl font-bold mb-4">Ready to Start Selling?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of Ugandan entrepreneurs building their online presence
            </p>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
                Create Your Shop Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 XpatsUg. Built for Ugandan entrepreneurs.</p>
        </div>
      </footer>
    </div>
  )
}
