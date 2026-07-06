import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchMyOrders, fetchOrderById } from '@/services/api';
import type { Order } from '@/types/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const OrdersListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    setLoading(true);
    fetchMyOrders(page, LIMIT).then(({ data, count }) => { setOrders(data); setCount(count); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(count / LIMIT);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground red-stripe pl-3">My Orders</h2>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No orders yet.</p>
          <Link to="/products"><Button className="mt-4 bg-primary text-primary-foreground hover:bg-accent">Browse Products</Button></Link>
        </Card>
      ) : (
        <>
          {orders.map(order => (
            <Link key={order.id} to={`/user/orders/${order.id}`}>
              <Card className="bg-card border-border hover:border-primary/40 transition-all p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{order.order_number}</span>
                      <Badge className={`text-xs border ${STATUS_COLORS[order.status] ?? ''}`}>{order.status}</Badge>
                      {order.is_dealer_order && <Badge className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Dealer</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    {order.order_items && <p className="text-xs text-muted-foreground mt-0.5">{order.order_items.length} item(s)</p>}
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <div className="price-tag text-lg">₼{order.total.toFixed(2)}</div>
                      {order.discount_amount > 0 && <div className="text-xs text-green-400">-₼{order.discount_amount.toFixed(2)} saved</div>}
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border border-border">
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border border-border">
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Default export: shows list or detail based on URL param
const OrdersPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return id ? <OrderDetailPage /> : <OrdersListPage />;
};

export default OrdersPage;

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchOrderById(id).then(setOrder).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;
  if (!order) return <div className="text-center text-muted-foreground py-8">Order not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/user/orders" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
          <ChevronLeft size={14} />Orders
        </Link>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">{order.order_number}</h2>
        <Badge className={`border ${STATUS_COLORS[order.status] ?? ''}`}>{order.status}</Badge>
        {order.is_dealer_order && <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Dealer Order</Badge>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 red-stripe pl-3">Order Items</h3>
          <div className="space-y-3">
            {(order.order_items ?? []).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{item.product_name}</p>
                  {item.product_sku && <p className="text-xs text-muted-foreground">SKU: {item.product_sku}</p>}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₼{item.unit_price.toFixed(2)}</p>
                </div>
                <span className="price-tag shrink-0 ml-2">₼{item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₼{order.subtotal.toFixed(2)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₼{order.discount_amount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-foreground"><span>Total</span><span className="price-tag">₼{order.total.toFixed(2)}</span></div>
          </div>
        </Card>

        <Card className="bg-card border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 red-stripe pl-3">Shipping Info</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {order.shipping_name && <div><span className="text-foreground font-medium">Name: </span>{order.shipping_name}</div>}
            {order.shipping_phone && <div><span className="text-foreground font-medium">Phone: </span>{order.shipping_phone}</div>}
            {order.shipping_address && <div><span className="text-foreground font-medium">Address: </span>{order.shipping_address}</div>}
            {order.shipping_city && <div><span className="text-foreground font-medium">City: </span>{order.shipping_city}, {order.shipping_country}</div>}
            {order.notes && <div className="mt-2 p-2 bg-muted rounded"><span className="text-foreground font-medium">Notes: </span>{order.notes}</div>}
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <div>Placed: {new Date(order.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(order.updated_at).toLocaleString()}</div>
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border p-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">Questions about your order?</p>
        <a href={`https://wa.me/994776117780?text=Hello! I have a question about order ${order.order_number}`}
          target="_blank" rel="noopener noreferrer">
          <Button className="bg-green-700 hover:bg-green-600 text-white text-sm">Contact via WhatsApp</Button>
        </a>
      </Card>
    </div>
  );
};
