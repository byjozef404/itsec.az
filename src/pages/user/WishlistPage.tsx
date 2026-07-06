import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchWishlist, toggleWishlist } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import type { WishlistItem } from '@/types/types';

const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const load = () => {
    setLoading(true);
    fetchWishlist().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
    toast.success('Removed from wishlist');
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground red-stripe pl-3">My Wishlist ({items.length})</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Heart size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Link to="/products"><Button className="bg-primary text-primary-foreground hover:bg-accent">Browse Products</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="bg-card border-border overflow-hidden group">
              <Link to={`/products/${item.products?.slug}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={item.products?.thumbnail_url ?? ''} alt={item.products?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${item.products?.slug}`}>
                  <h3 className="text-xs font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">{item.products?.name}</h3>
                </Link>
                <div className="price-tag text-base mb-3">₼{item.products?.price?.toFixed(2)}</div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-accent text-xs"
                    onClick={() => { if (item.product_id) addToCart(item.product_id); }}>
                    <ShoppingCart size={12} className="mr-1" />Add
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 border border-border"
                    onClick={() => handleRemove(item.product_id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
