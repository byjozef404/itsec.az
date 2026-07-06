import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminFetchAllOrders, adminUpdateOrderStatus } from '@/services/api';
import { toast } from 'sonner';
import type { Order } from '@/types/types';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminFetchAllOrders(page, LIMIT)
      .then(({ data, count }) => { setOrders(data); setCount(count); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: string) => {
    await adminUpdateOrderStatus(id, status);
    toast.success(`Order updated to ${status}`);
    load();
  };

  const totalPages = Math.ceil(count / LIMIT);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Orders ({count})</h1>

      <Card className="bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Type', 'Status', 'Total', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : orders.map(o => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[140px] truncate">{(o as unknown as { profiles?: { full_name?: string; email?: string } }).profiles?.full_name ?? (o as unknown as { profiles?: { email?: string } }).profiles?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    {o.is_dealer_order
                      ? <Badge className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Dealer</Badge>
                      : <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">Retail</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={o.status} onValueChange={v => handleStatusChange(o.id, v)}>
                      <SelectTrigger className={`h-7 w-32 text-xs border ${STATUS_COLORS[o.status] ?? ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-border">
                        {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sm price-tag">₼{o.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setDetail(o)}>
                      <Eye size={13} />
                    </Button>
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

      <Dialog open={!!detail} onOpenChange={v => !v && setDetail(null)}>
        <DialogContent className="bg-secondary border-border max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order: {detail?.order_number}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Status: </span><span className="capitalize text-foreground">{detail.status}</span></div>
                <div><span className="text-muted-foreground">Type: </span><span className="text-foreground">{detail.is_dealer_order ? 'Dealer' : 'Retail'}</span></div>
                <div><span className="text-muted-foreground">Subtotal: </span><span className="text-foreground">₼{detail.subtotal.toFixed(2)}</span></div>
                <div><span className="text-muted-foreground">Discount: </span><span className="text-green-400">-₼{detail.discount_amount.toFixed(2)}</span></div>
                <div><span className="text-muted-foreground">Total: </span><span className="price-tag">₼{detail.total.toFixed(2)}</span></div>
                <div><span className="text-muted-foreground">Date: </span><span className="text-foreground">{new Date(detail.created_at).toLocaleString()}</span></div>
              </div>
              <div className="border-t border-border pt-3">
                <h4 className="font-semibold text-foreground mb-2">Shipping</h4>
                <div className="text-muted-foreground space-y-0.5">
                  <p>{detail.shipping_name} · {detail.shipping_phone}</p>
                  <p>{detail.shipping_address}, {detail.shipping_city}, {detail.shipping_country}</p>
                  {detail.notes && <p className="text-foreground italic">"{detail.notes}"</p>}
                </div>
              </div>
              {detail.order_items && detail.order_items.length > 0 && (
                <div className="border-t border-border pt-3">
                  <h4 className="font-semibold text-foreground mb-2">Items</h4>
                  <div className="space-y-2">
                    {detail.order_items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                        <span className="price-tag">₼{item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
