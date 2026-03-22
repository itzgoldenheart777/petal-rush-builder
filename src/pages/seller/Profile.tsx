import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Store, User } from 'lucide-react';

export default function SellerProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankDetails, setBankDetails] = useState<any>({});
  const [store, setStore] = useState<any>(null);
  const [storeForm, setStoreForm] = useState({ name: '', tagline: '', description: '', whatsapp: '', email: '', return_policy: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setBankDetails(typeof profile.bank_details === 'object' ? profile.bank_details : {});
    }
    if (user) {
      supabase.from('stores').select('*').eq('seller_id', user.id).single().then(({ data }) => {
        if (data) {
          setStore(data);
          setStoreForm({ name: data.name, tagline: data.tagline || '', description: data.description || '', whatsapp: data.whatsapp || '', email: data.email || '', return_policy: data.return_policy || '' });
        }
      });
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ name, phone, bank_details: bankDetails }).eq('user_id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Profile saved!' }); await refreshProfile(); }
    setLoading(false);
  };

  const handleSaveStore = async () => {
    if (!user) return;
    setLoading(true);
    if (store) {
      const { error } = await supabase.from('stores').update(storeForm).eq('id', store.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Store updated!' });
    } else {
      const { error } = await supabase.from('stores').insert({ ...storeForm, seller_id: user.id });
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Store created!' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile & Store</h1>
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="space-y-2"><Label>Bank Account</Label><Input placeholder="Account Number" value={(bankDetails as any)?.account || ''} onChange={e => setBankDetails((p: any) => ({ ...p, account: e.target.value }))} /></div>
          <div className="space-y-2"><Label>IFSC Code</Label><Input value={(bankDetails as any)?.ifsc || ''} onChange={e => setBankDetails((p: any) => ({ ...p, ifsc: e.target.value }))} /></div>
          <div className="space-y-2"><Label>UPI ID</Label><Input value={(bankDetails as any)?.upi || ''} onChange={e => setBankDetails((p: any) => ({ ...p, upi: e.target.value }))} /></div>
          <Button onClick={handleSaveProfile} disabled={loading}>Save Profile</Button>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Store Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Store Name</Label><Input value={storeForm.name} onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Tagline</Label><Input value={storeForm.tagline} onChange={e => setStoreForm(f => ({ ...f, tagline: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={storeForm.description} onChange={e => setStoreForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="space-y-2"><Label>WhatsApp</Label><Input value={storeForm.whatsapp} onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={storeForm.email} onChange={e => setStoreForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Return Policy</Label><Textarea value={storeForm.return_policy} onChange={e => setStoreForm(f => ({ ...f, return_policy: e.target.value }))} /></div>
          <Button onClick={handleSaveStore} disabled={loading}>Save Store</Button>
        </CardContent>
      </Card>
    </div>
  );
}
