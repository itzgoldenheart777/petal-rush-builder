import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { fmtINR } from '@/lib/constants';
import { Bike, CheckCircle2, IndianRupee, Package } from 'lucide-react';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('delivery_partner_id', user.id).then(({ data }) => setOrders(data || []));
  }, [user]);

  const active = orders.filter(o => o.status === 'shipped').length;
  const completed = orders.filter(o => o.status === 'delivered').length;
  const earnings = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.delivery_share || 0), 0);

  const tiles = [
    { label: 'Active Deliveries', value: active, icon: Bike, color: 'text-primary' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-secondary' },
    { label: 'Total Earnings', value: fmtINR(earnings), icon: IndianRupee, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
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
