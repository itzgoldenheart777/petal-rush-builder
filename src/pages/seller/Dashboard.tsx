import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtINR, fmtDate } from '@/lib/constants';
import { Package, ShoppingBag, IndianRupee, Clock } from 'lucide-react';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, earnings: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
        supabase.from('orders').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
      ]);
      const orders = ordersRes.data || [];
      const delivered = orders.filter(o => o.status === 'delivered');
      const pending = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
      setStats({
        products: productsRes.count || 0,
        orders: orders.length,
        earnings: delivered.reduce((s, o) => s + (o.seller_share || 0), 0),
        pending: pending.length,
      });
      setRecentOrders(orders.slice(0, 5));
    };
    fetch();
  }, [user]);

  const tiles = [
    { label: 'Products', value: stats.products, icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Orders', value: stats.orders, icon: Package, color: 'text-secondary' },
    { label: 'Earnings', value: fmtINR(stats.earnings), icon: IndianRupee, color: 'text-green-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiles.map(t => (
          <Card key={t.label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${t.color}`}>
                <t.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.label}</p>
                <p className="text-2xl font-bold tabular-nums">{t.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Order #{o.id.slice(0,8)}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{fmtINR(o.total_amount)}</p>
                    <Badge variant="outline" className="text-xs capitalize">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
