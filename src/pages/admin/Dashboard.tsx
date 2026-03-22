import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtINR } from '@/lib/constants';
import { Users, Package, IndianRupee, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, gmv: 0, commission: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*'),
      ]);
      const orders = ordersRes.data || [];
      setStats({
        users: profilesRes.count || 0,
        orders: orders.length,
        gmv: orders.reduce((s, o) => s + (o.total_amount || 0), 0),
        commission: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.admin_commission || 0), 0),
      });
    };
    fetch();
  }, []);

  const tiles = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { label: 'Total Orders', value: stats.orders, icon: Package, color: 'text-secondary' },
    { label: 'GMV', value: fmtINR(stats.gmv), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Commission Earned', value: fmtINR(stats.commission), icon: IndianRupee, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiles.map(t => (
          <Card key={t.label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${t.color}`}><t.icon className="h-6 w-6" /></div>
              <div><p className="text-sm text-muted-foreground">{t.label}</p><p className="text-2xl font-bold tabular-nums">{t.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
