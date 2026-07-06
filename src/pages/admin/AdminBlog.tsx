import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchBlogPosts, adminUpsertBlogPost, adminDeleteBlogPost } from '@/services/api';
import { toast } from 'sonner';
import type { BlogPost } from '@/types/types';
import ImageUpload from '@/components/common/ImageUpload';

const EMPTY: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', thumbnail_url: '', is_published: false,
};

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<Partial<BlogPost>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    // Fetch all posts including unpublished by using admin context
    fetchBlogPosts(1, 50).then(({ data }) => setPosts(data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!selected.title || !selected.content) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      const slug = selected.slug || selected.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const published_at = selected.is_published ? new Date().toISOString() : null;
      await adminUpsertBlogPost({ ...selected, slug, published_at });
      toast.success(selected.id ? 'Post updated!' : 'Post created!');
      setDialog(false);
      load();
    } catch { toast.error('Failed to save post'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await adminDeleteBlogPost(id);
    toast.success('Post deleted');
    load();
  };

  const setField = (f: string, v: unknown) => setSelected(s => ({ ...s, [f]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Blog Posts</h1>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent" onClick={() => { setSelected(EMPTY); setDialog(true); }}>
          <Plus size={14} className="mr-1" />New Post
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {posts.map(p => (
            <Card key={p.id} className="bg-card border-border p-4 flex items-center gap-4">
              {p.thumbnail_url && (
                <img src={p.thumbnail_url} alt={p.title} className="w-14 h-14 rounded object-cover bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground truncate">{p.title}</span>
                  <Badge className={p.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20 text-xs' : 'bg-muted text-muted-foreground text-xs'}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => { setSelected(p); setDialog(true); }}><Pencil size={13} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={v => !v && setDialog(false)}>
        <DialogContent className="bg-secondary border-border max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected.id ? 'Edit Post' : 'New Blog Post'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input value={selected.title ?? ''} onChange={e => setField('title', e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Excerpt</label>
              <Input value={selected.excerpt ?? ''} onChange={e => setField('excerpt', e.target.value)} className="bg-muted border-border h-9 text-sm" />
            </div>
            <div>
              <ImageUpload
                bucket="blog"
                path="thumbnails"
                currentUrl={selected.thumbnail_url ?? ''}
                onUploaded={url => setField('thumbnail_url', url)}
                label="Thumbnail Image"
                aspectRatio="video"
              />
              <Input
                value={selected.thumbnail_url ?? ''}
                onChange={e => setField('thumbnail_url', e.target.value)}
                className="bg-muted border-border h-9 text-sm mt-2"
                placeholder="Or paste image URL directly…"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Content *</label>
              <textarea value={selected.content ?? ''} onChange={e => setField('content', e.target.value)}
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground resize-none h-48 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={selected.is_published ?? false} onChange={e => setField('is_published', e.target.checked)} className="accent-primary" />
                Published
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="border border-border" onClick={() => setDialog(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-accent" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
