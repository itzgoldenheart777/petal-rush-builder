import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Flower2, Truck, ShieldCheck, ShoppingBag, Store, Bike } from 'lucide-react';
import petalLogo from '@/assets/petal-rush-logo.png';

const features = [
  { icon: Flower2, title: 'Farm Fresh Flowers', desc: 'Sourced directly from local growers, delivered at peak freshness.' },
  { icon: Truck, title: 'Swift Delivery', desc: 'Real-time tracking with verified delivery via secure QR codes.' },
  { icon: ShieldCheck, title: 'Trusted Vendors', desc: 'Every seller is vetted by our admin team before going live.' },
];

const howItWorks = [
  { step: '01', title: 'Browse & Choose', desc: 'Explore roses, lilies, bouquets, seasonal & exotic flowers.' },
  { step: '02', title: 'Place Your Order', desc: 'Pick an address, choose payment, and get a secure delivery code.' },
  { step: '03', title: 'Get It Delivered', desc: 'A verified partner picks up & delivers with QR confirmation.' },
];

export default function Index() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!profile) return '/auth';
    switch (profile.role) {
      case 'buyer': return '/buyer/shop';
      case 'seller': return '/seller/dashboard';
      case 'delivery': return '/delivery/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={petalLogo} alt="PetalRush" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-xl font-bold tracking-tight text-primary">PetalRush</span>
          </div>
          {user ? (
            <Button onClick={() => navigate(getDashboardPath())} className="active:scale-[0.97]">
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/auth')} className="active:scale-[0.97]">Log in</Button>
              <Button onClick={() => navigate('/auth?tab=signup')} className="active:scale-[0.97]">Sign Up</Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl" style={{ lineHeight: 1.1 }}>
              Order Flowers Like Never Before
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground" style={{ textWrap: 'pretty' }}>
              Fresh blooms from verified vendors, delivered to your doorstep with real-time tracking and QR-secured handoffs.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/auth?tab=signup')} className="active:scale-[0.97] text-base px-8">
                Start Shopping 🌸
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth?tab=signup&role=seller')} className="active:scale-[0.97] text-base px-8">
                Sell With Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">Three simple steps from browsing to blooming.</p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
                <span className="text-5xl font-black text-primary/15">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground" style={{ textWrap: 'pretty' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">Why PetalRush?</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role CTAs */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">Join the PetalRush Ecosystem</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: ShoppingBag, title: 'Shop as Buyer', desc: 'Browse hundreds of fresh flower arrangements.', role: 'buyer', color: 'text-primary' },
              { icon: Store, title: 'Become a Seller', desc: 'List your products and reach thousands of buyers.', role: 'seller', color: 'text-secondary' },
              { icon: Bike, title: 'Deliver With Us', desc: 'Earn by delivering flowers across your city.', role: 'delivery', color: 'text-orange-500' },
            ].map((cta) => (
              <Card key={cta.role} className="text-center shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <cta.icon className={`mx-auto h-10 w-10 ${cta.color}`} />
                  <h3 className="mt-4 text-xl font-semibold">{cta.title}</h3>
                  <p className="mt-2 text-muted-foreground">{cta.desc}</p>
                  <Button variant="outline" className="mt-6 active:scale-[0.97]" onClick={() => navigate(`/auth?tab=signup&role=${cta.role}`)}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center">
          <div className="flex items-center gap-2">
            <img src={petalLogo} alt="PetalRush" className="h-7 w-7 rounded object-contain" />
            <span className="font-bold text-primary">PetalRush</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PetalRush. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
