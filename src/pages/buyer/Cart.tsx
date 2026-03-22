import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fmtINR } from '@/lib/constants';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartItem {
  productId: string; name: string; price: number; quantity: number; image: string; sellerId: string; sellerName: string;
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('petalrush_cart') || '[]'); } catch { return []; }
}
function saveCart(items: CartItem[]) { localStorage.setItem('petalrush_cart', JSON.stringify(items)); }

export default function BuyerCart() {
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const navigate = useNavigate();

  const updateQty = (productId: string, delta: number) => {
    const updated = cart.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    setCart(updated);
    saveCart(updated);
  };

  const remove = (productId: string) => {
    const updated = cart.filter(i => i.productId !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-muted-foreground">Browse our beautiful flower collection!</p>
        <Button className="mt-6" onClick={() => navigate('/buyer/shop')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <Card key={item.productId} className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.sellerName}</p>
                  <p className="font-semibold text-primary mt-1">{fmtINR(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.productId, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-8 text-center font-medium tabular-nums">{item.quantity}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.productId, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => remove(item.productId)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit shadow-sm">
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cart.map(i => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="truncate mr-2">{i.name} × {i.quantity}</span>
                <span className="tabular-nums">{fmtINR(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{fmtINR(total)}</span>
            </div>
            <Button className="w-full active:scale-[0.97]" onClick={() => navigate('/buyer/checkout')}>
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
