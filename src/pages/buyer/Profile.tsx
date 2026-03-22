import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export default function BuyerProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAddresses(Array.isArray(profile.addresses) ? profile.addresses as any[] : []);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ name, phone, addresses }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
      await refreshProfile();
    }
    setLoading(false);
  };

  const addAddress = () => {
    if (addresses.length >= 3) {
      toast({ title: 'Maximum 3 addresses allowed', variant: 'destructive' });
      return;
    }
    setAddresses([...addresses, { name: '', line1: '', city: '', state: '', pin: '', phone: '' }]);
  };

  const updateAddress = (idx: number, field: string, value: string) => {
    const updated = [...addresses];
    updated[idx] = { ...updated[idx], [field]: value };
    setAddresses(updated);
  };

  const removeAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ''} disabled /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Saved Addresses</CardTitle>
            <Button size="sm" variant="outline" onClick={addAddress}>Add Address</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {addresses.map((addr: any, idx: number) => (
            <div key={idx} className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Address {idx + 1}</span>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeAddress(idx)}>Remove</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Name" value={addr.name || ''} onChange={e => updateAddress(idx, 'name', e.target.value)} />
                <Input placeholder="Phone" value={addr.phone || ''} onChange={e => updateAddress(idx, 'phone', e.target.value)} />
                <Input placeholder="Address Line 1" value={addr.line1 || ''} onChange={e => updateAddress(idx, 'line1', e.target.value)} className="md:col-span-2" />
                <Input placeholder="City" value={addr.city || ''} onChange={e => updateAddress(idx, 'city', e.target.value)} />
                <Input placeholder="PIN" value={addr.pin || ''} onChange={e => updateAddress(idx, 'pin', e.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="active:scale-[0.97]">
        {loading ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}
