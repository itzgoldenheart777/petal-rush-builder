import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fmtINR, fmtDate } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin } from 'lucide-react';

export default function DeliveryPickups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').eq('status', 'packed').is('delivery_partner_id', null).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase.from('orders').update({ delivery_partner_id: user.id, status: 'shipped' }).eq('id', orderId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Order accepted!' }); fetchOrders(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available Pickups</h1>
      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-3 text-muted-foreground/40" />
          <p>No available pickups right now</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const addr = order.address as any;
            return (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id.slice(0,8)}</p>
                      <p className="font-bold text-lg">{fmtINR(order.total_amount)}</p>
                      <p className="text-xs text-muted-foreground">Your share: {fmtINR(order.delivery_share || 0)}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Packed</Badge>
                  </div>
                  {addr && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{[addr.line1, addr.city, addr.pin].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <Button onClick={() => acceptOrder(order.id)} className="active:scale-[0.97]">Accept & Pick Up</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
