import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, CreditCard, BarChart2, Download, LogOut, X, Menu, Globe } from 'lucide-react';
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

export const DealerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const DEALER_NAV = [
    { label: t('dealer_nav_dashboard'), icon: LayoutDashboard, href: '/dealer' },
    { label: t('dealer_nav_orders'),    icon: ShoppingCart,   href: '/dealer/orders' },
    { label: t('dealer_nav_credit'),    icon: CreditCard,     href: '/dealer/credit' },
    { label: t('dealer_nav_stats'),     icon: BarChart2,      href: '/dealer/stats' },
    { label: t('dealer_nav_export'),    icon: Download,       href: '/dealer/export' },
  ];

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const LangSwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
          <Globe size={13} />
          {lang.toUpperCase()}
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
  );

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <span className="text-lg font-black text-primary">PRO</span>
            <span className="text-lg font-black text-foreground">SECURITY</span>
          </div>
          <p className="text-xs text-yellow-400 font-semibold">{t('dealer_panel')}</p>
        </div>
        <div className="flex items-center gap-1">
          <LangSwitcher />
          {onClose && <Button variant="ghost" size="icon" onClick={onClose}><X size={16} /></Button>}
        </div>
      </div>
      <div className="px-4 py-3 border-b border-border bg-yellow-500/5">
        <p className="text-xs text-muted-foreground">{t('dealer_logged_as')}</p>
        <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || profile?.email}</p>
        <p className="text-xs text-yellow-400 font-medium">{t('dealer_discount_label')}</p>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {DEALER_NAV.map(item => (
          <Link key={item.href} to={item.href} onClick={onClose}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors',
              location.pathname === item.href
                ? 'bg-yellow-500/10 text-yellow-400 border-l-2 border-yellow-500'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}>
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link to="/" onClick={onClose} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded">
          {t('dealer_back_store')}
        </Link>
        <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted rounded w-full">
          <LogOut size={16} />{t('sign_out')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-secondary border-r border-border">
        <SidebarContent />
      </aside>

      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-secondary border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-black text-primary">PRO</span>
            <span className="font-black text-foreground">SECURITY</span>
            <span className="text-xs text-yellow-400 font-semibold ml-1">{t('dealer_panel')}</span>
          </div>
          <div className="flex items-center gap-1">
            <LangSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}><Menu size={18} /></Button>
          </div>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <div className="relative w-60 bg-secondary border-r border-border h-full">
              <SidebarContent onClose={() => setOpen(false)} />
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
