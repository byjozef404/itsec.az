import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminFetchAllQuotes } from '@/services/api';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import type { QuoteRequest } from '@/types/types';
import { FileText } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const AdminQuotes: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [quoteAmounts, setQuoteAmounts] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    adminFetchAllQuotes().then(setQuotes).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: string, status: string) => {
    const { error } = await supabase.from('quote_requests').update({
      status,
      quoted_amount: quoteAmounts[id] ? +quoteAmounts[id] : null,
      admin_notes: adminNotes[id] || null,
    }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success('Quote updated!');
    load();
    setExpanded(null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Quote Requests</h1>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}</div>
      ) : quotes.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <FileText size={32} className="mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No quote requests yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => {
            const profile = (q as unknown as { profiles?: { full_name?: string; email?: string } }).profiles;
            return (
              <Card key={q.id} className="bg-card border-border p-4">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div>
                    <span className="text-sm font-semibold text-foreground">{profile?.full_name ?? profile?.email ?? 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground ml-2">{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  <Badge className={`text-xs border ${STATUS_COLORS[q.status] ?? ''}`}>{q.status}</Badge>
                </div>
                <p className="text-sm text-foreground mb-2">{q.message}</p>
                {q.quoted_amount && <p className="text-sm text-primary font-semibold">Quoted: ₼{q.quoted_amount.toFixed(2)}</p>}
                {q.admin_notes && <p className="text-xs text-muted-foreground italic mt-1">{q.admin_notes}</p>}

                <div className="mt-3">
                  {expanded === q.id ? (
                    <div className="space-y-2 border-t border-border pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Quote Amount (₼)</label>
                          <Input type="number" value={quoteAmounts[q.id] ?? ''} onChange={e => setQuoteAmounts(p => ({ ...p, [q.id]: e.target.value }))} className="bg-muted border-border h-8 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Admin Notes</label>
                        <Input value={adminNotes[q.id] ?? ''} onChange={e => setAdminNotes(p => ({ ...p, [q.id]: e.target.value }))} className="bg-muted border-border h-8 text-sm" placeholder="Notes for customer..." />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {['reviewed', 'quoted', 'accepted', 'rejected'].map(s => (
                          <Button key={s} size="sm" variant="ghost" className={`h-7 text-xs border capitalize ${STATUS_COLORS[s] ?? ''}`} onClick={() => handleUpdate(q.id, s)}>
                            Mark {s}
                          </Button>
                        ))}
                        <Button size="sm" variant="ghost" className="h-7 text-xs border border-border text-muted-foreground" onClick={() => setExpanded(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-xs border border-border text-muted-foreground" onClick={() => setExpanded(q.id)}>
                      Respond
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
