import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MessageSquare, FileText, Star, ShoppingCart, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyOrders } from '@/services/api';
import type { Order } from '@/types/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const UserDashboard: React.FC = () => {
  const { profile, isDealer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders(1, 5).then(({ data }) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const QUICK_LINKS = [
    { icon: Package, label: 'My Orders', href: '/user/orders', color: 'text-blue-400' },
    { icon: Heart, label: 'Wishlist', href: '/user/wishlist', color: 'text-pink-400' },
    { icon: FileText, label: 'Quote Requests', href: '/user/quotes', color: 'text-yellow-400' },
    { icon: MessageSquare, label: 'Messages', href: '/user/messages', color: 'text-green-400' },
    { icon: Star, label: 'Dealer Program', href: '/user/dealer', color: 'text-purple-400' },
    { icon: ShoppingCart, label: 'Browse Products', href: '/products', color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Customer'}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your orders, wishlist and account settings.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={profile?.role === 'dealer' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-primary/10 text-primary border border-primary/20'}>
              {profile?.role === 'dealer' ? 'Dealer Account' : 'Customer Account'}
            </Badge>
            {isDealer && <span className="text-xs text-green-400">15% dealer discount active</span>}
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {QUICK_LINKS.map(q => (
          <Link key={q.href} to={q.href}>
            <Card className="bg-card border-border hover:border-primary/40 transition-all p-4 flex items-center gap-3 group">
              <q.icon size={20} className={q.color} />
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{q.label}</span>
              <ChevronRight size={14} className="ml-auto text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground red-stripe pl-3">Recent Orders</h2>
          <Link to="/user/orders" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <Card className="bg-card border-border p-8 text-center text-muted-foreground">
            <Package size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No orders yet. <Link to="/products" className="text-primary hover:underline">Start shopping</Link></p>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <Link key={order.id} to={`/user/orders/${order.id}`}>
                <Card className="bg-card border-border hover:border-primary/40 transition-all p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{order.order_number}</span>
                      <Badge className={`text-xs border ${STATUS_COLORS[order.status] ?? ''}`}>{order.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="price-tag text-base">₼{order.total.toFixed(2)}</div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
