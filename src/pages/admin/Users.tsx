import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, UserCheck, UserX } from 'lucide-react';
import { fmtDate } from '@/lib/constants';

export default function AdminUsers() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const updateStatus = async (userId: string, status: 'active' | 'pending' | 'suspended') => {
    const { error } = await supabase.from('profiles').update({ status }).eq('user_id', userId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: `User ${status}` }); fetchProfiles(); }
  };

  const filtered = profiles.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name || '—'}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{p.role}</Badge></TableCell>
                  <TableCell><Badge variant={p.status === 'active' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(p.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {p.status === 'pending' && <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(p.user_id, 'active')}><UserCheck className="h-3 w-3" /> Approve</Button>}
                    {p.status === 'active' && <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => updateStatus(p.user_id, 'suspended')}><UserX className="h-3 w-3" /> Suspend</Button>}
                    {p.status === 'suspended' && <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(p.user_id, 'active')}><UserCheck className="h-3 w-3" /> Activate</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
