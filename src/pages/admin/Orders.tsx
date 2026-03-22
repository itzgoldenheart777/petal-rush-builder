import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ORDER_STATUSES, fmtINR, fmtDate } from '@/lib/constants';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || [])); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Orders</h1>
      <Card className="shadow-sm"><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Order ID</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead>Date</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {orders.map(o => {
              const s = ORDER_STATUSES.find(x => x.value === o.status);
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">#{o.id.slice(0,8)}</TableCell>
                  <TableCell className="tabular-nums">{fmtINR(o.total_amount)}</TableCell>
                  <TableCell><Badge className={s?.color}>{s?.label}</Badge></TableCell>
                  <TableCell className="uppercase text-xs">{o.payment_mode}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(o.created_at)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
