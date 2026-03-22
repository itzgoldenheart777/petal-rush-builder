import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORDER_STATUSES, fmtINR, fmtDate } from '@/lib/constants';
import { QRCodeSVG } from 'qrcode.react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

function ProgressBar({ status }: { status: string }) {
  const idx = statusSteps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {statusSteps.map((s, i) => (
        <div key={s} className="flex-1">
          <div className={`h-2 rounded-full transition-colors ${i <= idx ? 'bg-primary' : 'bg-muted'}`} />
          <span className="text-[10px] text-muted-foreground capitalize mt-1 block">{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function BuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-3 text-muted-foreground/40" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const expanded = expandedId === order.id;
            const statusInfo = ORDER_STATUSES.find(s => s.value === order.status);
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expanded ? null : order.id)}>
                    <div>
                      <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                      <p className="font-semibold mt-1">{fmtINR(order.total_amount)}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                  <ProgressBar status={order.status} />

                  {expanded && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Items</h4>
                        {items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="tabular-nums">{fmtINR(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      {order.delivery_code && (
                        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
                          <p className="text-sm font-medium">Delivery Code</p>
                          <QRCodeSVG value={order.delivery_code} size={120} />
                          <code className="text-lg font-mono font-bold tracking-widest">{order.delivery_code}</code>
                          <p className="text-xs text-muted-foreground text-center">Share this code with the delivery partner to confirm receipt</p>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Payment: {order.payment_mode?.toUpperCase()}</p>
                        {order.estimated_delivery && <p>Est. Delivery: {fmtDate(order.estimated_delivery)}</p>}
                      </div>
                    </div>
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
