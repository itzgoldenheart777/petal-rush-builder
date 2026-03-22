import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export default function DeliveryProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState<any>({});
  const [bankDetails, setBankDetails] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setVehicleDetails(typeof profile.vehicle_details === 'object' ? profile.vehicle_details : {});
      setBankDetails(typeof profile.bank_details === 'object' ? profile.bank_details : {});
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ name, phone, vehicle_details: vehicleDetails, bank_details: bankDetails }).eq('user_id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Profile saved!' }); await refreshProfile(); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader><CardTitle>Vehicle Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Vehicle Type</Label><Input placeholder="e.g. Bike, Scooter" value={(vehicleDetails as any)?.type || ''} onChange={e => setVehicleDetails((p: any) => ({ ...p, type: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Vehicle Number</Label><Input value={(vehicleDetails as any)?.number || ''} onChange={e => setVehicleDetails((p: any) => ({ ...p, number: e.target.value }))} /></div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Account Number</Label><Input value={(bankDetails as any)?.account || ''} onChange={e => setBankDetails((p: any) => ({ ...p, account: e.target.value }))} /></div>
          <div className="space-y-2"><Label>IFSC</Label><Input value={(bankDetails as any)?.ifsc || ''} onChange={e => setBankDetails((p: any) => ({ ...p, ifsc: e.target.value }))} /></div>
          <div className="space-y-2"><Label>UPI ID</Label><Input value={(bankDetails as any)?.upi || ''} onChange={e => setBankDetails((p: any) => ({ ...p, upi: e.target.value }))} /></div>
        </CardContent>
      </Card>
      <Button onClick={handleSave} disabled={loading} className="active:scale-[0.97]">{loading ? 'Saving...' : 'Save Profile'}</Button>
    </div>
  );
}
