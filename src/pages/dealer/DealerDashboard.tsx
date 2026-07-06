import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, TrendingUp, Package, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyOrders } from '@/services/api';
import type { Order } from '@/types/types';

const DealerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders(1, 20).then(({ data }) => {
      const dealerOrders = data.filter(o => o.is_dealer_order);
      setOrders(dealerOrders.slice(0, 5));
      setTotalSpent(dealerOrders.reduce((s, o) => s + o.total, 0));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const creditLimit = profile?.credit_limit ?? 0;
  const creditUsed = profile?.credit_used ?? 0;
  const creditAvail = creditLimit - creditUsed;
  const creditPct = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-blue-500/10 text-blue-400',
    shipped: 'bg-purple-500/10 text-purple-400',
    delivered: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dealer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome, {profile?.full_name}. Your 15% dealer discount is active.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, label: 'Total Orders', value: orders.length.toString(), color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Total Spent', value: `₼${totalSpent.toFixed(0)}`, color: 'text-green-400' },
          { icon: CreditCard, label: 'Credit Available', value: `₼${creditAvail.toFixed(0)}`, color: 'text-yellow-400' },
          { icon: Package, label: 'Dealer Discount', value: '15%', color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border p-4">
            <s.icon size={20} className={`${s.color} mb-2`} />
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Credit Bar */}
      {creditLimit > 0 && (
        <Card className="bg-card border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground red-stripe pl-3">Credit Usage</h3>
            <span className="text-xs text-muted-foreground">{creditPct.toFixed(0)}% used</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div className={`h-2 rounded-full transition-all ${creditPct > 80 ? 'bg-destructive' : creditPct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(creditPct, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Used: ₼{creditUsed.toFixed(2)}</span>
            <span>Available: ₼{creditAvail.toFixed(2)}</span>
            <span>Limit: ₼{creditLimit.toFixed(2)}</span>
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground red-stripe pl-3">Recent Dealer Orders</h3>
          <Link to="/dealer/orders" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <Card className="bg-card border-border p-8 text-center text-muted-foreground text-sm">
            No dealer orders yet. <Link to="/products" className="text-primary hover:underline">Start shopping</Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map(o => (
              <Link key={o.id} to={`/user/orders/${o.id}`}>
                <Card className="bg-card border-border hover:border-primary/40 transition-all p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{o.order_number}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[o.status] ?? ''}`}>{o.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="price-tag">₼{o.total.toFixed(2)}</div>
                    {o.discount_amount > 0 && <div className="text-xs text-green-400">-₼{o.discount_amount.toFixed(2)}</div>}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Place Bulk Order</h3>
          <p className="text-xs text-muted-foreground mb-3">Browse products and order with your 15% dealer discount.</p>
          <Link to="/products"><span className="text-xs text-primary hover:underline">Browse Products →</span></Link>
        </Card>
        <Card className="bg-card border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Need More Credit?</h3>
          <p className="text-xs text-muted-foreground mb-3">Contact us to increase your credit limit for larger orders.</p>
          <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-400 hover:underline">Contact via WhatsApp →</a>
        </Card>
      </div>
    </div>
  );
};

export default DealerDashboard;
