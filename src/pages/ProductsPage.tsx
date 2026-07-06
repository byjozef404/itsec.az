import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid, List, ShoppingCart, Heart, Search, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { fetchProducts, fetchCategories, fetchBrands, resolvePrice, subscribeToTable } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { toggleWishlist } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Product, Category, Brand } from '@/types/types';

const LIMIT = 20;

const ProductsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const { user, profile } = useAuth();
  const role = profile?.role ?? 'customer';
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  const page = parseInt(params.get('page') ?? '1');
  const category = params.get('category') ?? '';
  const brand = params.get('brand') ?? '';
  const search = params.get('search') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const [searchInput, setSearchInput] = useState(search);

  const load = React.useCallback(() => {
    setLoading(true);
    fetchProducts({ categorySlug: category || undefined, brandSlug: brand || undefined, search: search || undefined, page, limit: LIMIT, sort: sort as 'newest' | 'price_asc' | 'price_desc' })
      .then(({ data, count }) => { setProducts(data); setCount(count); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, brand, search, page, sort]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchBrands().then(setBrands).catch(console.error);
  }, []);

  // Live sync: refresh the list automatically whenever the admin adds,
  // edits, or removes a product — no manual page reload needed for shoppers.
  useEffect(() => {
    const unsubscribe = subscribeToTable('products', () => load());
    return unsubscribe;
  }, [load]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const handleWishlist = async (productId: string) => {
    if (!user) { toast.error('Sign in to save to wishlist'); return; }
    const result = await toggleWishlist(productId);
    toast.success(result === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const totalPages = Math.ceil(count / LIMIT);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 red-stripe pl-3">Category</h4>
        <div className="space-y-1">
          <button onClick={() => setParam('category', '')}
            className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${!category ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            All Categories
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setParam('category', c.slug)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${category === c.slug ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 red-stripe pl-3">Brand</h4>
        <div className="space-y-1">
          <button onClick={() => setParam('brand', '')}
            className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${!brand ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            All Brands
          </button>
          {/* Avitel pinned first with partner badge */}
          {brands.filter(b => b.slug === 'avitel').map(b => (
            <button key={b.id} onClick={() => setParam('brand', b.slug)}
              className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded transition-colors font-semibold border ${brand === b.slug ? 'text-primary bg-primary/10 border-primary/30' : 'text-primary border-primary/20 bg-primary/5 hover:bg-primary/10'}`}>
              <span>{b.name}</span>
              <span className="badge-red text-[9px] py-0 px-1.5">PARTNER</span>
            </button>
          ))}
          {brands.filter(b => b.slug !== 'avitel').map(b => (
            <button key={b.id} onClick={() => setParam('brand', b.slug)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${brand === b.slug ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Camera type quick-filter bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: '📷 Bütün kameralar', value: '' },
          { label: '🏠 Daxili kamera', value: 'indoor-cameras' },
          { label: '🌧 Xarici kamera', value: 'outdoor-cameras' },
          { label: '📡 IP kamera', value: 'ip-cameras' },
          { label: '📼 Analog kamera', value: 'analog-cameras' },
          { label: '🖥 DVR / NVR', value: 'dvr-nvr' },
          { label: '🔌 Switch', value: 'switches' },
          { label: '🔒 Giriş nəzarəti', value: 'access-control' },
        ].map(item => (
          <button
            key={item.value}
            onClick={() => setParam('category', item.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors font-medium ${
              category === item.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">
            {category ? categories.find(c => c.slug === category)?.name ?? 'Products'
              : brand ? brands.find(b => b.slug === brand)?.name ?? 'Products'
              : search ? `Search: "${search}"` : 'All Products'}
          </h1>
          <p className="text-sm text-muted-foreground">{count} products found</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <form onSubmit={e => { e.preventDefault(); setParam('search', searchInput); }} className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search..." className="pl-9 h-9 text-sm bg-muted border-border w-48" />
            </div>
            <Button size="sm" type="submit" className="bg-primary text-primary-foreground hover:bg-accent">Search</Button>
          </form>
          <Select value={sort} onValueChange={v => setParam('sort', v)}>
            <SelectTrigger className="w-36 h-9 bg-muted border-border text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-secondary border-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded overflow-hidden">
            <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-none ${view === 'grid' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setView('grid')}><Grid size={16} /></Button>
            <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-none ${view === 'list' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setView('list')}><List size={16} /></Button>
          </div>
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden border border-border"><Filter size={16} className="mr-1" />Filter</Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-secondary border-border w-72 overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-4">Filters</h3>
              <FilterPanel />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-52 shrink-0">
          <div className="bg-card border border-border rounded p-4 sticky top-20">
            <FilterPanel />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-muted rounded animate-pulse aspect-square" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package size={48} className="mx-auto mb-4 opacity-30" />
              <p>No products found. Try different filters.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map(p => (
                view === 'grid' ? (
                  <Card key={p.id} className="bg-card border-border hover:border-primary/40 transition-all group overflow-hidden">
                    <Link to={`/products/${p.slug}`}>
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        <img src={p.thumbnail_url ?? ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {p.is_featured && <Badge className="absolute top-2 left-2 badge-red">Featured</Badge>}
                      </div>
                    </Link>
                    <div className="p-4">
                      {p.brands && <div className="text-xs text-primary font-semibold uppercase mb-1">{p.brands.name}</div>}
                      <Link to={`/products/${p.slug}`}>
                        <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors">{p.name}</h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="price-tag text-lg">₼{resolvePrice(p, role).toFixed(2)}</span>
                          {resolvePrice(p, role) < p.price && (
                            <span className="text-xs text-muted-foreground line-through ml-2">₼{p.price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleWishlist(p.id)}><Heart size={14} /></Button>
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent text-xs" onClick={() => addToCart(p.id)} disabled={p.stock_qty === 0}>
                            <ShoppingCart size={14} className="mr-1" />{p.stock_qty === 0 ? 'Out' : 'Add'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card key={p.id} className="bg-card border-border hover:border-primary/40 transition-all group">
                    <div className="flex gap-4 p-4">
                      <Link to={`/products/${p.slug}`} className="shrink-0">
                        <div className="w-24 h-24 overflow-hidden rounded bg-muted">
                          <img src={p.thumbnail_url ?? ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        {p.brands && <div className="text-xs text-primary font-semibold uppercase mb-1">{p.brands.name}</div>}
                        <Link to={`/products/${p.slug}`}>
                          <h3 className="text-sm font-semibold text-foreground mb-1 hover:text-primary transition-colors line-clamp-2">{p.name}</h3>
                        </Link>
                        {p.sku && <p className="text-xs text-muted-foreground mb-2">SKU: {p.sku}</p>}
                        <div className="flex items-center gap-3">
                          <span className="price-tag text-lg">₼{resolvePrice(p, role).toFixed(2)}</span>
                          {resolvePrice(p, role) < p.price && (
                            <span className="text-xs text-muted-foreground line-through">₼{p.price.toFixed(2)}</span>
                          )}
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent text-xs" onClick={() => addToCart(p.id)} disabled={p.stock_qty === 0}>
                            <ShoppingCart size={14} className="mr-1" />Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="ghost" size="sm" disabled={page <= 1}
                onClick={() => { const n = new URLSearchParams(params); n.set('page', String(page - 1)); setParams(n); }}
                className="border border-border">
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages}
                onClick={() => { const n = new URLSearchParams(params); n.set('page', String(page + 1)); setParams(n); }}
                className="border border-border">
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
