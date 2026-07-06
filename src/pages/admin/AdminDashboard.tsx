import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { adminFetchDashboardStats, adminFetchAllOrders } from '@/services/api';
import type { Order } from '@/types/types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetchDashboardStats(),
      adminFetchAllOrders(1, 8),
    ]).then(([s, { data }]) => {
      setStats(s);
      setRecentOrders(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Mock chart data
  const chartData = [
    { name: 'Jan', revenue: 4200, orders: 32 },
    { name: 'Feb', revenue: 5800, orders: 45 },
    { name: 'Mar', revenue: 4900, orders: 38 },
    { name: 'Apr', revenue: 7200, orders: 56 },
    { name: 'May', revenue: 6500, orders: 50 },
    { name: 'Jun', revenue: 8100, orders: 63 },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400',
    confirmed: 'text-blue-400',
    shipped: 'text-purple-400',
    delivered: 'text-green-400',
    cancelled: 'text-destructive',
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, label: 'Total Orders', value: stats.totalOrders.toLocaleString(), color: 'text-blue-400' },
          { icon: DollarSign, label: 'Total Revenue', value: `₼${stats.totalRevenue.toFixed(0)}`, color: 'text-green-400' },
          { icon: Users, label: 'Customers', value: stats.totalCustomers.toLocaleString(), color: 'text-purple-400' },
          { icon: Package, label: 'Products', value: stats.totalProducts.toLocaleString(), color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border p-4">
            <s.icon size={20} className={`${s.color} mb-2`} />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 red-stripe pl-3">Monthly Revenue (₼)</h3>
          <div className="w-full min-w-0 overflow-hidden" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid #1e2a3a', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="bg-card border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 red-stripe pl-3">Orders Trend</h3>
          <div className="w-full min-w-0 overflow-hidden" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid #1e2a3a', fontSize: 12 }} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-card border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground red-stripe pl-3">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Status', 'Total', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.profiles?.full_name ?? o.profiles?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium capitalize ${STATUS_COLORS[o.status] ?? 'text-foreground'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm price-tag">₼{o.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
