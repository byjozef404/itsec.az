import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, BarChart2, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface MonthlyStat {
  month: string;
  orders: number;
  revenue: number;
  products_sold: number;
}

interface ProductStat {
  name: string;
  sku: string | null;
  price: number;
  dealer_price: number | null;
  stock_qty: number;
  category: string;
}

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<MonthlyStat[]>([]);
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Monthly order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .gte('created_at', `${year}-01-01`)
        .lte('created_at', `${year}-12-31`);

      const monthMap: Record<number, MonthlyStat> = {};
      for (let m = 1; m <= 12; m++) {
        const label = new Date(parseInt(year), m - 1, 1).toLocaleString('az-AZ', { month: 'long' });
        monthMap[m] = { month: label, orders: 0, revenue: 0, products_sold: 0 };
      }
      (orders ?? []).forEach(o => {
        const m = new Date(o.created_at).getMonth() + 1;
        if (monthMap[m]) {
          monthMap[m].orders++;
          monthMap[m].revenue += o.total ?? 0;
        }
      });
      setStats(Object.values(monthMap));

      // Products list
      const { data: prods } = await supabase
        .from('products')
        .select('name, sku, price, dealer_price, stock_qty, categories(name)')
        .eq('is_active', true)
        .order('name');

      setProducts(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prods ?? []).map((p: any) => ({
          name: p.name,
          sku: p.sku,
          price: p.price,
          dealer_price: p.dealer_price,
          stock_qty: p.stock_qty,
          category: Array.isArray(p.categories) ? (p.categories[0]?.name ?? '—') : (p.categories?.name ?? '—'),
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Export to CSV (Excel-compatible) ─────────────────────────────
  const exportMonthlyCSV = () => {
    const rows = [
      ['Ay', 'Sifariş sayı', 'Gəlir (₼)'],
      ...stats.map(s => [s.month, s.orders, s.revenue.toFixed(2)]),
    ];
    downloadCSV(rows, `itsecurity-az-${year}-hesabat.csv`);
  };

  const exportProductsCSV = () => {
    const rows = [
      ['Məhsul adı', 'SKU', 'Kateqoriya', 'Pərakəndə qiymət (₼)', 'Topdancı qiyməti (₼)', 'Stok'],
      ...products.map(p => [p.name, p.sku ?? '', p.category, p.price.toFixed(2), p.dealer_price?.toFixed(2) ?? '', p.stock_qty]),
    ];
    downloadCSV(rows, `itsecurity-az-mehsullar-${year}.csv`);
  };

  const downloadCSV = (rows: (string | number)[][], filename: string) => {
    const bom = '\uFEFF'; // UTF-8 BOM for Excel
    const csv = bom + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV fayl yükləndi');
  };

  // ─── Colorful PDF export ──────────────────────────────────────────
  const exportPDF = async (type: 'monthly' | 'products') => {
    setExporting(true);
    try {
      // Build HTML for print-to-PDF with colors
      const brandColor = '#e63946';
      const now = new Date().toLocaleDateString('az-AZ');
      let tableRows = '';

      if (type === 'monthly') {
        tableRows = stats.map((s, i) => `
          <tr style="background:${i % 2 === 0 ? '#1a1a2e' : '#16213e'}">
            <td style="padding:10px 14px;color:#e2e8f0;font-weight:600">${s.month}</td>
            <td style="padding:10px 14px;text-align:center;color:#60d394">${s.orders}</td>
            <td style="padding:10px 14px;text-align:right;color:${brandColor};font-weight:700">₼${s.revenue.toFixed(2)}</td>
          </tr>`).join('');
      } else {
        tableRows = products.map((p, i) => `
          <tr style="background:${i % 2 === 0 ? '#1a1a2e' : '#16213e'}">
            <td style="padding:8px 12px;color:#e2e8f0">${p.name}</td>
            <td style="padding:8px 12px;color:#94a3b8;font-family:monospace">${p.sku ?? '—'}</td>
            <td style="padding:8px 12px;color:#94a3b8">${p.category}</td>
            <td style="padding:8px 12px;text-align:right;color:#fbbf24;font-weight:700">₼${p.price.toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;color:#a78bfa">${p.dealer_price ? '₼' + p.dealer_price.toFixed(2) : '—'}</td>
            <td style="padding:8px 12px;text-align:center;color:${p.stock_qty > 0 ? '#60d394' : '#f87171'}">${p.stock_qty}</td>
          </tr>`).join('');
      }

      const headers = type === 'monthly'
        ? '<tr><th style="padding:12px 14px;text-align:left">Ay</th><th style="padding:12px 14px;text-align:center">Sifarişlər</th><th style="padding:12px 14px;text-align:right">Gəlir</th></tr>'
        : '<tr><th>Məhsul</th><th>SKU</th><th>Kateqoriya</th><th style="text-align:right">Qiymət</th><th style="text-align:right">Topdancı</th><th style="text-align:center">Stok</th></tr>';

      const title = type === 'monthly' ? `${year} Aylıq Hesabat` : `Məhsul Qiymət Siyahısı — ${year}`;

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>${title}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#0d1117; color:#e2e8f0; font-family:'Segoe UI',Arial,sans-serif; padding:24px; }
          .header { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid ${brandColor}; padding-bottom:16px; margin-bottom:24px; }
          .logo { font-size:24px; font-weight:900; }
          .logo span { color:${brandColor}; }
          .title { font-size:18px; font-weight:700; color:#e2e8f0; }
          .meta { font-size:12px; color:#94a3b8; margin-top:4px; }
          table { width:100%; border-collapse:collapse; font-size:13px; }
          thead { background:${brandColor}; }
          thead th { padding:12px 14px; text-align:left; color:#fff; font-weight:700; }
          .total-row { background:#1e293b; font-weight:700; }
          .footer { margin-top:24px; text-align:center; font-size:11px; color:#475569; border-top:1px solid #1e293b; padding-top:12px; }
          .footer strong { color:${brandColor}; }
        </style></head><body>
        <div class="header">
          <div class="logo"><span>IT</span>Security.az</div>
          <div>
            <div class="title">${title}</div>
            <div class="meta">Hazırlanma tarixi: ${now} | Admin Panel</div>
          </div>
        </div>
        <table><thead>${headers}</thead><tbody>${tableRows}</tbody></table>
        <div class="footer">© ${year} ITSecurity.az · Bütün hüquqlar qorunur · Protected by <strong>Jozef</strong></div>
        </body></html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.print(); }, 600);
      }
      toast.success('PDF çap dialoquna yönləndirildiniz');
    } catch {
      toast.error('PDF ixrac xətası');
    } finally {
      setExporting(false);
    }
  };

  const totalRevenue = stats.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = stats.reduce((s, m) => s + m.orders, 0);
  const maxRevenue = Math.max(...stats.map(s => s.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Hesabatlar / Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">PDF, CSV/Excel ixrac — rəngli kamera qiymət siyahısı</p>
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32 h-9 bg-muted border-border text-sm"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            {['2023', '2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ümumi gəlir', value: `₼${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Sifariş sayı', value: totalOrders, icon: ShoppingCart, color: 'text-blue-400' },
          { label: 'Aktiv məhsul', value: products.length, icon: Package, color: 'text-yellow-400' },
          { label: 'Aylıq ortalama', value: `₼${(totalRevenue / 12).toFixed(2)}`, icon: BarChart2, color: 'text-primary' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <kpi.icon size={16} className={kpi.color} />
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart2 size={18} className="text-primary" />Aylıq Gəlir — {year}
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-xs border border-border" onClick={exportMonthlyCSV}>
              <Download size={13} className="mr-1" />Excel/CSV
            </Button>
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-accent" onClick={() => exportPDF('monthly')} disabled={exporting}>
              <FileText size={13} className="mr-1" />PDF
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="flex gap-1 h-40 items-end">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="flex-1 bg-muted rounded-t animate-pulse" style={{ height: `${Math.random() * 100 + 20}px` }} />)}</div>
        ) : (
          <div className="flex gap-1 items-end h-40">
            {stats.map(s => (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-primary/70 hover:bg-primary rounded-t transition-all"
                  style={{ height: `${Math.max((s.revenue / maxRevenue) * 136, 4)}px` }}
                  title={`${s.month}: ₼${s.revenue.toFixed(2)}`}
                />
                <span className="text-[8px] text-muted-foreground leading-none">{s.month.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead><tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-muted-foreground">Ay</th>
              <th className="text-right py-2 px-2 text-muted-foreground">Sifarişlər</th>
              <th className="text-right py-2 px-2 text-muted-foreground">Gəlir (₼)</th>
            </tr></thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.month} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-1.5 px-2 text-foreground">{s.month}</td>
                  <td className="py-1.5 px-2 text-right text-blue-400">{s.orders}</td>
                  <td className="py-1.5 px-2 text-right text-green-400 font-semibold">₼{s.revenue.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/40">
                <td className="py-2 px-2 font-bold text-foreground">Cəmi</td>
                <td className="py-2 px-2 text-right font-bold text-blue-400">{totalOrders}</td>
                <td className="py-2 px-2 text-right font-bold text-primary">₼{totalRevenue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Products price list */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Package size={18} className="text-primary" />Məhsul Qiymət Siyahısı
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-xs border border-border" onClick={exportProductsCSV}>
              <Download size={13} className="mr-1" />Excel/CSV
            </Button>
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-accent" onClick={() => exportPDF('products')} disabled={exporting}>
              <FileText size={13} className="mr-1" />Rəngli PDF
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-xs">
            <thead><tr className="border-b border-border">
              {['Məhsul adı', 'SKU', 'Kateqoriya', 'Qiymət (₼)', 'Topdancı (₼)', 'Stok'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-muted-foreground font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-3 py-2"><div className="h-3 bg-muted rounded animate-pulse" /></td>)}
                </tr>
              )) : products.map((p, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium text-foreground max-w-[200px] truncate">{p.name}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">{p.sku ?? '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.category}</td>
                  <td className="px-3 py-2 text-yellow-400 font-bold">₼{p.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-purple-400">{p.dealer_price ? `₼${p.dealer_price.toFixed(2)}` : '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`font-semibold ${p.stock_qty > 0 ? 'text-green-400' : 'text-destructive'}`}>{p.stock_qty}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;
