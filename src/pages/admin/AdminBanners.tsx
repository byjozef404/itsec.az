import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchBanners, adminUpsertBanner, adminDeleteBanner } from '@/services/api';
import { toast } from 'sonner';
import type { Banner } from '@/types/types';
import ImageUpload from '@/components/common/ImageUpload';

const EMPTY: Partial<Banner> = { title: '', subtitle: '', image_url: '', link_url: '', button_text: '', sort_order: 0, is_active: true };

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<Partial<Banner>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchBanners().then(setBanners).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setSelected(EMPTY); setDialog(true); };
  const openEdit = (b: Banner) => { setSelected(b); setDialog(true); };

  const handleSave = async () => {
    if (!selected.title || !selected.image_url) { toast.error('Title and image URL are required'); return; }
    setSaving(true);
    try {
      await adminUpsertBanner(selected);
      toast.success(selected.id ? 'Banner updated!' : 'Banner created!');
      setDialog(false);
      load();
    } catch { toast.error('Failed to save banner'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await adminDeleteBanner(id);
    toast.success('Banner deleted');
    load();
  };

  const setField = (f: string, v: unknown) => setSelected(s => ({ ...s, [f]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Banners</h1>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent" onClick={openCreate}>
          <Plus size={14} className="mr-1" />Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map(b => (
            <Card key={b.id} className="bg-card border-border overflow-hidden">
              <div className="aspect-video overflow-hidden bg-muted relative">
                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${b.is_active ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">Order: {b.sort_order}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(b)}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(b.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={v => !v && setDialog(false)}>
        <DialogContent className="bg-secondary border-border max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected.id ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input value={selected.title ?? ''} onChange={e => setField('title', e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
              <Input value={selected.subtitle ?? ''} onChange={e => setField('subtitle', e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <ImageUpload
              bucket="banners"
              path="hero"
              currentUrl={selected.image_url ?? ''}
              onUploaded={url => setField('image_url', url)}
              label="Banner Image *"
              aspectRatio="banner"
            />
            {/* Manual URL fallback */}
            <Input
              value={selected.image_url ?? ''}
              onChange={e => setField('image_url', e.target.value)}
              className="bg-muted border-border h-9 text-sm"
              placeholder="Or paste image URL directly…"
            />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Link URL</label>
              <Input value={selected.link_url ?? ''} onChange={e => setField('link_url', e.target.value)} className="bg-muted border-border h-9 text-sm" placeholder="/products?category=..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Button Text</label>
              <Input value={selected.button_text ?? ''} onChange={e => setField('button_text', e.target.value)} className="bg-muted border-border h-9 text-sm" placeholder="Shop Now" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
                <Input type="number" value={selected.sort_order ?? 0} onChange={e => setField('sort_order', +e.target.value)} className="bg-muted border-border h-9 text-sm" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={selected.is_active ?? true} onChange={e => setField('is_active', e.target.checked)} className="accent-primary" />
                  Active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="border border-border" onClick={() => setDialog(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-accent" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;
