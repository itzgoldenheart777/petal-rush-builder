import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { fmtINR, fmtDate } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Package } from 'lucide-react';

export default function DeliveryActive() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [otpValues, setOtpValues] = useState<Record<string, string>>({});

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase.from('orders').select('*').eq('delivery_partner_id', user.id).eq('status', 'shipped').order('created_at', { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const confirmDelivery = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const entered = otpValues[orderId] || '';
    if (entered !== order.delivery_code) {
      toast({ title: 'Invalid code', description: 'The delivery code does not match.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Delivery confirmed! 🎉' }); fetchOrders(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Active Deliveries</h1>
      {orders.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-3 text-muted-foreground/40" />
          <p>No active deliveries</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const addr = order.address as any;
            const mapsUrl = addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([addr.line1, addr.city, addr.pin].filter(Boolean).join(', '))}` : '';
            return (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id.slice(0,8)}</p>
                      <p className="font-bold">{fmtINR(order.total_amount)}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">In Transit</Badge>
                  </div>
                  {addr && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-muted-foreground">{[addr.line1, addr.line2, addr.city, addr.state, addr.pin].filter(Boolean).join(', ')}</p>
                          {addr.phone && <p className="text-muted-foreground">📞 {addr.phone}</p>}
                        </div>
                      </div>
                      {mapsUrl && (
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-2"><Navigation className="h-3.5 w-3.5" /> Navigate</Button>
                        </a>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Enter 6-digit delivery code</p>
                    <InputOTP maxLength={6} value={otpValues[order.id] || ''} onChange={v => setOtpValues(prev => ({ ...prev, [order.id]: v }))}>
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                      </InputOTPGroup>
                    </InputOTP>
                    <Button onClick={() => confirmDelivery(order.id)} className="active:scale-[0.97]">Confirm Delivery</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
