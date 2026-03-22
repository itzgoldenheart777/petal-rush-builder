import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtINR, fmtDate } from '@/lib/constants';
import { CheckCircle2 } from 'lucide-react';

export default function DeliveryHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('delivery_partner_id', user.id).eq('status', 'delivered').order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Delivery History</h1>
      {orders.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground"><CheckCircle2 className="mx-auto h-12 w-12 mb-3 text-muted-foreground/40" /><p>No completed deliveries yet</p></div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Card key={o.id} className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Order #{o.id.slice(0,8)}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{fmtINR(o.delivery_share || 0)}</p>
                  <Badge variant="secondary" className="text-xs">Delivered</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
