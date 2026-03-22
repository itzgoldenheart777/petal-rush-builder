import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { fmtINR, PAYMENT_SPLIT, generateCode } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string; name: string; price: number; quantity: number; image: string; sellerId: string; sellerName: string;
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('petalrush_cart') || '[]'); } catch { return []; }
}

export default function BuyerCheckout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart] = useState<CartItem[]>(getCart());
  const [paymentMode, setPaymentMode] = useState('cod');
  const [address, setAddress] = useState({ name: '', line1: '', line2: '', city: '', state: '', pin: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.addresses && Array.isArray(profile.addresses) && profile.addresses.length > 0) {
      const a = profile.addresses[0] as any;
      setAddress(prev => ({ ...prev, ...a }));
    }
  }, [profile]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleOrder = async () => {
    if (!user || !address.line1 || !address.city || !address.pin) {
      toast({ title: 'Please fill in your delivery address', variant: 'destructive' });
      return;
    }
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Group items by seller
      const bySeller: Record<string, CartItem[]> = {};
      cart.forEach(item => {
        if (!bySeller[item.sellerId]) bySeller[item.sellerId] = [];
        bySeller[item.sellerId].push(item);
      });

      for (const [sellerId, items] of Object.entries(bySeller)) {
        const orderTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const deliveryCode = generateCode(6);

        const { error } = await supabase.from('orders').insert({
          buyer_id: user.id,
          seller_id: sellerId,
          items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          total_amount: orderTotal,
          payment_mode: paymentMode,
          address: address,
          delivery_code: deliveryCode,
          seller_share: +(orderTotal * PAYMENT_SPLIT.seller).toFixed(2),
          delivery_share: +(orderTotal * PAYMENT_SPLIT.delivery).toFixed(2),
          admin_commission: +(orderTotal * PAYMENT_SPLIT.admin).toFixed(2),
          estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (error) throw error;
      }

      localStorage.removeItem('petalrush_cart');
      toast({ title: 'Order placed!', description: 'Your flowers are on their way 🌸' });
      navigate('/buyer/orders');
    } catch (err: any) {
      toast({ title: 'Order failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/buyer/cart');
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address Line 1</Label><Input value={address.line1} onChange={e => setAddress(p => ({ ...p, line1: e.target.value }))} required /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address Line 2</Label><Input value={address.line2} onChange={e => setAddress(p => ({ ...p, line2: e.target.value }))} /></div>
              <div className="space-y-2"><Label>City</Label><Input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>State</Label><Input value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} /></div>
              <div className="space-y-2"><Label>PIN Code</Label><Input value={address.pin} onChange={e => setAddress(p => ({ ...p, pin: e.target.value }))} required /></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Payment Mode</CardTitle></CardHeader>
            <CardContent>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit shadow-sm">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cart.map(i => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="truncate mr-2">{i.name} × {i.quantity}</span>
                <span className="tabular-nums">{fmtINR(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Seller ({(PAYMENT_SPLIT.seller*100).toFixed(0)}%)</span><span>{fmtINR(total * PAYMENT_SPLIT.seller)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Delivery ({(PAYMENT_SPLIT.delivery*100).toFixed(0)}%)</span><span>{fmtINR(total * PAYMENT_SPLIT.delivery)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Platform ({(PAYMENT_SPLIT.admin*100).toFixed(0)}%)</span><span>{fmtINR(total * PAYMENT_SPLIT.admin)}</span></div>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-primary">{fmtINR(total)}</span>
            </div>
            <Button className="w-full active:scale-[0.97]" onClick={handleOrder} disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order 🌸'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
