import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { adminFetchAllProducts, adminUpsertProduct, adminDeleteProduct, fetchCategories, fetchBrands, subscribeToTable } from '@/services/api';
import { toast } from 'sonner';
import type { Product, Category, Brand } from '@/types/types';
import ImageUpload from '@/components/common/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';

const EMPTY: Partial<Product> = {
  name: '', slug: '', sku: '', price: 0, dealer_price: undefined,
  distributor_price: undefined, cost_price: undefined,
  description: '', category_id: '', brand_id: '', stock_qty: 0,
  warranty_months: 24, is_active: true, is_featured: false,
  thumbnail_url: '', image_url_2: null, image_url_3: null, tags: [],
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<false | 'create' | 'edit'>(false);
  const [selected, setSelected] = useState<Partial<Product>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { profile } = useAuth();
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminFetchAllProducts(page, LIMIT)
      .then(({ data, count }) => { setProducts(data); setCount(count); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchBrands().then(setBrands).catch(console.error);
  }, []);

  // Live sync: if another admin (or this admin in another tab) changes the
  // products table, refresh this list automatically.
  useEffect(() => {
    const unsubscribe = subscribeToTable('products', () => load());
    return unsubscribe;
  }, [load]);

  const openCreate = () => { setSelected(EMPTY); setDialog('create'); };
  const openEdit = (p: Product) => { setSelected(p); setDialog('edit'); };
  const closeDialog = () => { setDialog(false); setSelected(EMPTY); };

  const handleSave = async () => {
    if (!selected.name || !selected.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      // Auto-generate slug from name if empty
      const slug = selected.slug || selected.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      // Convert empty SKU to null — prevents unique constraint violation when SKU is not provided
      const sku = selected.sku?.trim() || null;
      await adminUpsertProduct({ ...selected, slug, sku });
      toast.success(dialog === 'create' ? 'Product created!' : 'Product updated!');
      closeDialog();
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to save product: ${msg}`);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    await adminDeleteProduct(id);
    toast.success('Product deactivated');
    load();
  };

  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products;
  const totalPages = Math.ceil(count / LIMIT);

  const setField = (field: string, value: unknown) => setSelected(s => ({ ...s, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-foreground">Products ({count})</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 h-9 bg-muted border-border text-sm w-48" />
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent" onClick={openCreate}>
            <Plus size={14} className="mr-1" />Add Product
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-border">
                {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnail_url ?? ''} alt={p.name} className="w-9 h-9 rounded object-cover bg-muted shrink-0" />
                      <span className="text-sm font-medium text-foreground max-w-[200px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.categories?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm price-tag">₼{p.price}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.stock_qty}</td>
                  <td className="px-4 py-3">
                    <Badge className={p.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border border-border"><ChevronLeft size={16} /></Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {page} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border border-border"><ChevronRight size={16} /></Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={!!dialog} onOpenChange={v => !v && closeDialog()}>
        <DialogContent className="bg-secondary border-border max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === 'create' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Product Name *</label>
              <Input value={selected.name ?? ''} onChange={e => setField('name', e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">SKU</label>
              <Input value={selected.sku ?? ''} onChange={e => setField('sku', e.target.value)} className="bg-muted border-border h-9 text-sm" placeholder="DS-2CD2143G2-I" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Model Number</label>
              <Input value={selected.model_number ?? ''} onChange={e => setField('model_number', e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price (₼) — Pərakəndə *</label>
              <Input type="number" value={selected.price ?? 0} onChange={e => setField('price', +e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topdancı qiyməti (₼) — 15% off</label>
              <Input type="number" value={selected.dealer_price ?? ''} onChange={e => setField('dealer_price', e.target.value ? +e.target.value : undefined)} placeholder="Boş buraxsanız avtomatik" className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Diler qiyməti (₼) — 10% off</label>
              <Input type="number" value={selected.distributor_price ?? ''} onChange={e => setField('distributor_price', e.target.value ? +e.target.value : undefined)} placeholder="Boş buraxsanız avtomatik" className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Maya dəyəri (₼) — Admin görür</label>
              <Input type="number" value={selected.cost_price ?? ''} onChange={e => setField('cost_price', e.target.value ? +e.target.value : undefined)} placeholder="Admin üçün daxili qiymət" className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <Select value={selected.category_id ?? ''} onValueChange={v => setField('category_id', v)}>
                <SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Brand</label>
              <Select value={selected.brand_id ?? ''} onValueChange={v => setField('brand_id', v)}>
                <SelectTrigger className="bg-muted border-border h-9 text-sm"><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Stock Quantity</label>
              <Input type="number" value={selected.stock_qty ?? 0} onChange={e => setField('stock_qty', +e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Warranty (months)</label>
              <Input type="number" value={selected.warranty_months ?? 24} onChange={e => setField('warranty_months', +e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div className="md:col-span-2">
              {/* Multi-image upload: thumbnail + 2 extra images */}
              <label className="text-xs text-muted-foreground mb-2 block font-semibold">Product Images (up to 3)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Main image *</p>
                  <ImageUpload bucket="products" path={profile?.id ?? 'admin'} currentUrl={selected.thumbnail_url ?? ''} onUploaded={url => setField('thumbnail_url', url)} label="" aspectRatio="square" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Image 2</p>
                  <ImageUpload bucket="products" path={profile?.id ?? 'admin'} currentUrl={selected.image_url_2 ?? ''} onUploaded={url => setField('image_url_2', url || null)} label="" aspectRatio="square" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Image 3</p>
                  <ImageUpload bucket="products" path={profile?.id ?? 'admin'} currentUrl={selected.image_url_3 ?? ''} onUploaded={url => setField('image_url_3', url || null)} label="" aspectRatio="square" />
                </div>
              </div>
              <Input value={selected.thumbnail_url ?? ''} onChange={e => setField('thumbnail_url', e.target.value)} className="bg-muted border-border h-9 text-sm mt-2" placeholder="Or paste main image URL directly…" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea value={selected.description ?? ''} onChange={e => setField('description', e.target.value)}
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={selected.is_active ?? true} onChange={e => setField('is_active', e.target.checked)} className="accent-primary" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={selected.is_featured ?? false} onChange={e => setField('is_featured', e.target.checked)} className="accent-primary" />
                Featured
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="border border-border" onClick={closeDialog}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-accent" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
