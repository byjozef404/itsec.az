import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Settings, Image, Star, LogOut, Globe, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LANGS = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const;

const ADMIN_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Customers', icon: Users, href: '/admin/customers' },
  { label: 'Reports', icon: BarChart2, href: '/admin/reports' },
  { label: 'Banners', icon: Image, href: '/admin/banners' },
  { label: 'Blog', icon: FileText, href: '/admin/blog' },
  { label: 'Quotes', icon: Star, href: '/admin/quotes' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-secondary border-r border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-lg font-black text-primary">IT</span>
              <span className="text-lg font-black text-foreground">Security.az</span>
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-primary font-semibold">Admin Panel</p>
              {/* Admin status badge */}
              <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-wide">Admin</span>
            </div>
          </div>
          {/* Lang switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                <Globe size={12} />{lang.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {LANGS.map(l => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}
                  className={cn('text-xs cursor-pointer', lang === l.code && 'text-primary font-semibold')}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Admin identity row */}
        <div className="px-4 py-3 border-b border-border bg-primary/5">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || profile?.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            <span className="text-xs text-green-400 font-medium">Administrator</span>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {ADMIN_NAV.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors',
                (location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href)))
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground mb-1 truncate">{profile?.email}</div>
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:text-destructive/80 hover:bg-muted rounded transition-colors w-full">
            <LogOut size={16} />Sign Out
          </button>
          <div className="mt-3 pt-3 border-t border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground/60">Protected by <span className="text-primary font-semibold">Jozef</span></p>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
};
