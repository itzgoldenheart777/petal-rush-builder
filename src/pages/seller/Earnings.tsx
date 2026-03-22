import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtINR, fmtDate } from '@/lib/constants';
import { IndianRupee, TrendingUp, Clock } from 'lucide-react';

export default function SellerEarnings() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('seller_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, [user]);

  const delivered = orders.filter(o => o.status === 'delivered');
  const totalEarnings = delivered.reduce((s, o) => s + (o.seller_share || 0), 0);
  const pendingEarnings = orders.filter(o => !['delivered','cancelled'].includes(o.status)).reduce((s, o) => s + (o.seller_share || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700"><IndianRupee className="h-6 w-6" /></div>
            <div><p className="text-sm text-muted-foreground">Total Earned</p><p className="text-2xl font-bold">{fmtINR(totalEarnings)}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Clock className="h-6 w-6" /></div>
            <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{fmtINR(pendingEarnings)}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><TrendingUp className="h-6 w-6" /></div>
            <div><p className="text-sm text-muted-foreground">Completed Orders</p><p className="text-2xl font-bold">{delivered.length}</p></div>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm">
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          {delivered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No completed orders yet</p>
          ) : (
            <div className="space-y-2">
              {delivered.map(o => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Order #{o.id.slice(0,8)}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
                  </div>
                  <span className="font-semibold text-green-600 tabular-nums">{fmtINR(o.seller_share || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
