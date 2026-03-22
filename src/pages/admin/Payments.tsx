import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fmtINR, fmtDate } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { IndianRupee } from 'lucide-react';

export default function AdminPayments() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').eq('status', 'delivered').order('created_at', { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { fetchOrders(); }, []);

  const totalGMV = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalCommission = orders.reduce((s, o) => s + (o.admin_commission || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments & Payouts</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm"><CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary"><IndianRupee className="h-6 w-6" /></div>
          <div><p className="text-sm text-muted-foreground">Total GMV</p><p className="text-2xl font-bold">{fmtINR(totalGMV)}</p></div>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-secondary"><IndianRupee className="h-6 w-6" /></div>
          <div><p className="text-sm text-muted-foreground">Commission Earned</p><p className="text-2xl font-bold">{fmtINR(totalCommission)}</p></div>
        </CardContent></Card>
      </div>
      <Card className="shadow-sm">
        <CardHeader><CardTitle>Delivered Order Payments</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Order #{o.id.slice(0,8)}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
              </div>
              <div className="text-right text-sm">
                <p>Seller: {fmtINR(o.seller_share || 0)}</p>
                <p>Delivery: {fmtINR(o.delivery_share || 0)}</p>
                <p className="font-medium text-primary">Commission: {fmtINR(o.admin_commission || 0)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
