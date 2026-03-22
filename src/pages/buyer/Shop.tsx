import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES, fmtINR } from '@/lib/constants';
import { Search, Star, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
  sellerName: string;
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('petalrush_cart') || '[]'); } catch { return []; }
}
function saveCart(items: CartItem[]) { localStorage.setItem('petalrush_cart', JSON.stringify(items)); }

export default function BuyerShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').gt('stock', 0).order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  const addToCart = (product: any) => {
    const cart = getCart();
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0] || '',
        sellerId: product.seller_id,
        sellerName: product.seller_name || 'Vendor',
      });
    }
    saveCart(cart);
    toast({ title: 'Added to cart', description: `${product.name} added` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Shop Flowers</h1>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/buyer/cart')}>
          <ShoppingCart className="h-4 w-4" /> Cart ({getCart().reduce((s, i) => s + i.quantity, 0)})
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search flowers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Flower2 className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50" />
          <p>No flowers found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => (
            <Card key={p.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <Flower2 className="h-12 w-12 text-muted-foreground/30" />
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold line-clamp-1">{p.name}</h3>
                  <Badge variant="secondary" className="text-xs shrink-0 ml-2">{p.category}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{Number(p.rating).toFixed(1)}</span>
                  <span>·</span>
                  <span>{p.stock} in stock</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-primary">{fmtINR(p.price)}</span>
                  <Button size="sm" onClick={() => addToCart(p)} className="active:scale-[0.95]">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export cart helpers for other pages
export { getCart, saveCart };
import { Flower2 } from 'lucide-react';
