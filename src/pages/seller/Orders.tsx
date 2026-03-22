import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUSES, fmtINR, fmtDate, generateCode } from '@/lib/constants';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

export default function SellerOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase.from('orders').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const updateStatus = async (orderId: string, newStatus: string, pickupCode?: string) => {
    const update: any = { status: newStatus };
    if (pickupCode) update.pickup_code = pickupCode;

    const { error } = await supabase.from('orders').update(update).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Order ${newStatus}` });
      fetchOrders();
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Confirm Order', next: 'confirmed' };
      case 'confirmed': return { label: 'Mark as Packed', next: 'packed', generatePickup: true };
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-3 text-muted-foreground/40" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const action = getNextAction(order.status);
            const statusInfo = ORDER_STATUSES.find(s => s.value === order.status);
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id.slice(0,8)}</p>
                      <p className="font-bold text-lg">{fmtINR(order.total_amount)}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(order.created_at)}</p>
                    </div>
                    <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="tabular-nums">{fmtINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your share: <span className="font-medium text-foreground">{fmtINR(order.seller_share || 0)}</span>
                  </div>
                  {order.pickup_code && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
                      <p className="text-sm font-medium">Pickup Code</p>
                      <QRCodeSVG value={order.pickup_code} size={100} />
                      <code className="text-lg font-mono font-bold tracking-widest">{order.pickup_code}</code>
                    </div>
                  )}
                  {action && (
                    <Button
                      className="active:scale-[0.97]"
                      onClick={() => {
                        const pickupCode = action.generatePickup ? generateCode(7) : undefined;
                        updateStatus(order.id, action.next, pickupCode);
                      }}
                    >
                      {action.label}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
