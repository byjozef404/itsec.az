import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchMyQuotes, createQuoteRequest } from '@/services/api';
import { toast } from 'sonner';
import type { QuoteRequest } from '@/types/types';
import { FileText, Plus } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetchMyQuotes().then(setQuotes).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await createQuoteRequest(message);
      toast.success('Quote request submitted!');
      setMessage('');
      setShowForm(false);
      load();
    } catch { toast.error('Failed to submit quote request'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground red-stripe pl-3">Quote Requests</h2>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent text-xs" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} className="mr-1" />{showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">New Quote Request</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea required placeholder="Describe what you need (products, quantities, specifications)..."
              value={message} onChange={e => setMessage(e.target.value)}
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none h-32 focus:outline-none focus:ring-1 focus:ring-primary" />
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-accent text-sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}</div>
      ) : quotes.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <FileText size={32} className="mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No quote requests yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => (
            <Card key={q.id} className="bg-card border-border p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                <Badge className={`text-xs border ${STATUS_COLORS[q.status] ?? ''}`}>{q.status}</Badge>
              </div>
              <p className="text-sm text-foreground line-clamp-2">{q.message}</p>
              {q.quoted_amount && (
                <div className="mt-2 text-sm"><span className="text-muted-foreground">Quoted: </span><span className="price-tag">₼{q.quoted_amount.toFixed(2)}</span></div>
              )}
              {q.admin_notes && (
                <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">{q.admin_notes}</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
