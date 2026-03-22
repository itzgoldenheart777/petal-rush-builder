import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

export default function BuyerReviews() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [ordersRes, reviewsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('buyer_id', user.id).eq('status', 'delivered'),
        supabase.from('reviews').select('*').eq('user_id', user.id),
      ]);
      setOrders(ordersRes.data || []);
      setReviews(reviewsRes.data || []);
    };
    fetch();
  }, [user]);

  const reviewedOrderIds = new Set(reviews.map(r => r.order_id));
  const unreviewedOrders = orders.filter(o => !reviewedOrderIds.has(o.id));

  const handleSubmit = async () => {
    if (!selectedOrder || !user) return;
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Buyer',
      order_id: selectedOrder,
      rating,
      comment,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Review submitted!' });
      setComment('');
      setRating(5);
      setSelectedOrder(null);
      // refresh
      const { data } = await supabase.from('reviews').select('*').eq('user_id', user.id);
      setReviews(data || []);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>
      {unreviewedOrders.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Leave a Review</h3>
            <select className="w-full rounded-md border p-2 text-sm bg-background" value={selectedOrder || ''} onChange={e => setSelectedOrder(e.target.value)}>
              <option value="">Select a delivered order</option>
              {unreviewedOrders.map(o => <option key={o.id} value={o.id}>Order #{o.id.slice(0,8)}</option>)}
            </select>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
                  <Star className={`h-6 w-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Your review..." value={comment} onChange={e => setComment(e.target.value)} />
            <Button onClick={handleSubmit} disabled={!selectedOrder} className="active:scale-[0.97]">Submit Review</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {reviews.map(r => (
          <Card key={r.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />)}
              </div>
              <p className="text-sm">{r.comment || 'No comment'}</p>
              <p className="text-xs text-muted-foreground mt-1">Order #{r.order_id?.slice(0,8)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
