import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronRight, Shield, Truck, Phone, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { fetchProductBySlug, resolvePrice, subscribeToTable } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toggleWishlist } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import type { Product } from '@/types/types';
import WhatsAppOrderSheet from '@/components/common/WhatsAppOrderSheet';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { user, profile, isDealer, isDistributor } = useAuth();
  const { t } = useLanguage();
  const role = profile?.role ?? 'customer';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [waOpen, setWaOpen] = useState(false);

  const load = React.useCallback(() => {
    if (!slug) return;
    fetchProductBySlug(slug)
      .then(p => { setProduct(p); setActiveImg(0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Live sync: if the admin updates price, stock, or images for this exact
  // product while a customer is viewing it, refresh automatically.
  useEffect(() => {
    const unsubscribe = subscribeToTable('products', () => load());
    return unsubscribe;
  }, [load]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, qty);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to save to wishlist'); return; }
    if (!product) return;
    const result = await toggleWishlist(product.id);
    toast.success(result === 'added' ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-muted rounded animate-pulse aspect-square" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-muted rounded animate-pulse h-6" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">
      Product not found. <Link to="/products" className="text-primary hover:underline">Back to products</Link>
    </div>
  );

  const displayPrice = resolvePrice(product, role);
  const retailPrice  = product.price;
  const isDiscounted = displayPrice < retailPrice;
  // Compute discount label per role
  const discountLabel = role === 'admin'
    ? t('price_cost')
    : role === 'dealer'
      ? t('discount_badge_dealer')
      : role === 'distributor'
        ? t('discount_badge_distributor')
        : null;
  const specs = product.specifications ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-primary">Products</Link>
        {product.categories && <>
          <ChevronRight size={12} />
          <Link to={`/products?category=${product.categories.slug}`} className="hover:text-primary">{product.categories.name}</Link>
        </>}
        <ChevronRight size={12} />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          {(() => {
            const gallery = [product.thumbnail_url, product.image_url_2, product.image_url_3].filter(
              (url): url is string => !!url
            );
            const current = gallery[activeImg] ?? gallery[0] ?? '';
            return (
              <>
                <div className="aspect-square overflow-hidden rounded bg-muted border border-border mb-3">
                  <img src={current} alt={product.name} className="w-full h-full object-contain p-4" />
                </div>
                {gallery.length > 1 && (
                  <div className="flex gap-2">
                    {gallery.map((url, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded border transition-colors overflow-hidden bg-muted ${activeImg === i ? 'border-primary' : 'border-border hover:border-primary/40'}`}>
                        <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Info */}
        <div>
          {product.brands && <div className="text-sm text-primary font-semibold uppercase mb-2">{product.brands.name}</div>}
          <h1 className="text-2xl font-bold text-foreground mb-2">{product.name}</h1>
          {product.sku && <p className="text-xs text-muted-foreground mb-4">SKU: {product.sku} | Model: {product.model_number ?? product.sku}</p>}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="price-tag text-3xl">₼{displayPrice.toFixed(2)}</span>
            {isDiscounted && (
              <span className="text-sm text-muted-foreground line-through">₼{retailPrice.toFixed(2)}</span>
            )}
            {discountLabel && (
              <Badge className="badge-red">{discountLabel}</Badge>
            )}
          </div>
          {/* Admin sees cost price row; others see only their own price */}
          {role === 'admin' && product.dealer_price && (
            <div className="flex gap-4 text-xs mb-3">
              <span className="text-muted-foreground">{t('price_dealer')}: <span className="text-yellow-400 font-semibold">₼{product.dealer_price.toFixed(2)}</span></span>
              {product.distributor_price && (
                <span className="text-muted-foreground">{t('price_distributor')}: <span className="text-blue-400 font-semibold">₼{product.distributor_price.toFixed(2)}</span></span>
              )}
              <span className="text-muted-foreground">{t('price_retail')}: <span className="text-foreground font-semibold">₼{retailPrice.toFixed(2)}</span></span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${product.stock_qty > 0 ? 'bg-green-400' : 'bg-destructive'}`} />
            <span className={`text-sm ${product.stock_qty > 0 ? 'text-green-400' : 'text-destructive'}`}>
              {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-border rounded overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">−</button>
              <span className="px-4 py-2 text-sm font-semibold text-foreground bg-muted">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">+</button>
            </div>
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-accent" onClick={handleAddToCart} disabled={product.stock_qty === 0}>
              <ShoppingCart size={16} className="mr-2" />Add to Cart
            </Button>
            <Button variant="ghost" size="icon" className="border border-border text-muted-foreground hover:text-primary" onClick={handleWishlist}>
              <Heart size={18} />
            </Button>
          </div>

          {/* WhatsApp order button */}
          <Button
            onClick={() => setWaOpen(true)}
            className="w-full mb-6 bg-green-700 hover:bg-green-600 text-white font-semibold h-10"
          >
            <MessageCircle size={16} className="mr-2" />
            WhatsApp ilə Sifariş / Order via WhatsApp
          </Button>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded text-center">
              <Shield size={18} className="text-primary" />
              <span className="text-xs text-muted-foreground">{product.warranty_months}mo Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded text-center">
              <Truck size={18} className="text-primary" />
              <span className="text-xs text-muted-foreground">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded text-center">
              <Phone size={18} className="text-primary" />
              <span className="text-xs text-muted-foreground">Tech Support</span>
            </div>
          </div>

          {product.description && (
            <div className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{product.description}</div>
          )}
        </div>
      </div>

      {/* Specifications */}
      {Object.keys(specs).length > 0 && (
        <Card className="bg-card border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 red-stripe pl-3">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(specs).map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="text-muted-foreground shrink-0 capitalize min-w-0 basis-1/2">{key.replace(/_/g, ' ')}</span>
                <span className="text-foreground font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">{tag}</Badge>
          ))}
        </div>
      )}

      {/* WhatsApp CTA */}
      <div className="mt-8 bg-green-900/20 border border-green-700/30 rounded p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm font-semibold text-foreground">Need installation or bulk pricing?</span>
          </div>
          <p className="text-sm text-muted-foreground">Our technical team is ready to help with installation, configuration, and bulk orders.</p>
        </div>
        <Button onClick={() => setWaOpen(true)} className="bg-green-700 hover:bg-green-600 text-white shrink-0">
          <MessageCircle size={15} className="mr-2" />Order via WhatsApp
        </Button>
      </div>

      <WhatsAppOrderSheet
        open={waOpen}
        onClose={() => setWaOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          brand: product.brands?.name,
          price: product.price,
          dealer_price: product.dealer_price,
          warranty_months: product.warranty_months,
          category: product.categories?.name,
          model_number: product.model_number,
        }}
      />
    </div>
  );
};

export default ProductDetailPage;
