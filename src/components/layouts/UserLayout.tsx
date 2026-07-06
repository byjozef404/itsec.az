import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, User, Heart, MessageSquare, FileText, LayoutDashboard, LogOut, Star, Menu, X, Globe, ShieldCheck } from 'lucide-react';
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

// Role badge config
const ROLE_BADGE: Record<string, { label: Record<string, string>; color: string }> = {
  admin:    { label: { az: 'Admin',     en: 'Admin',    ru: 'Админ'    }, color: 'bg-primary text-primary-foreground' },
  dealer:   { label: { az: 'Topdancı', en: 'Dealer',   ru: 'Дилер'    }, color: 'bg-yellow-500 text-black' },
  customer: { label: { az: 'Müştəri', en: 'Customer', ru: 'Клиент'   }, color: 'bg-blue-600 text-white' },
};

// Dealer status badge
const DEALER_STATUS_BADGE: Record<string, { label: Record<string, string>; color: string }> = {
  approved: { label: { az: 'Təsdiqlənib', en: 'Approved', ru: 'Одобрен'   }, color: 'text-green-400' },
  pending:  { label: { az: 'Gözləyir',    en: 'Pending',  ru: 'На рассмотрении' }, color: 'text-yellow-400' },
  rejected: { label: { az: 'Rədd edildi', en: 'Rejected', ru: 'Отклонён'  }, color: 'text-destructive' },
  none:     { label: { az: 'Adi İstifadəçi', en: 'Regular User', ru: 'Обычный пользователь' }, color: 'text-muted-foreground' },
};

export const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const USER_NAV = [
    { label: t('nav_dashboard') || 'Dashboard',      icon: LayoutDashboard, href: '/user' },
    { label: t('my_orders'),                          icon: Package,         href: '/user/orders' },
    { label: t('nav_wishlist') || 'Wishlist',         icon: Heart,           href: '/user/wishlist' },
    { label: t('profile'),                            icon: User,            href: '/user/profile' },
    { label: t('nav_messages') || 'Messages',         icon: MessageSquare,   href: '/user/messages' },
    { label: t('nav_quotes') || 'Quote Requests',     icon: FileText,        href: '/user/quotes' },
    { label: t('dealer_title'),                       icon: Star,            href: '/user/dealer' },
  ];

  const role = profile?.role ?? 'customer';
  const dealerStatus = profile?.dealer_status ?? 'none';
  const roleBadge = ROLE_BADGE[role] ?? ROLE_BADGE.customer;
  const statusBadge = DEALER_STATUS_BADGE[dealerStatus] ?? DEALER_STATUS_BADGE.none;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const LangSwitcher = () => (
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
  );

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User size={18} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground truncate">{profile?.full_name || 'User'}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
            {/* Role + Status badges */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide', roleBadge.color)}>
                {roleBadge.label[lang] ?? roleBadge.label.en}
              </span>
              {role === 'dealer' && (
                <span className={cn('text-[9px] font-semibold flex items-center gap-0.5', statusBadge.color)}>
                  <ShieldCheck size={9} />
                  {statusBadge.label[lang] ?? statusBadge.label.en}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <LangSwitcher />
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}><X size={16} /></Button>
            )}
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {USER_NAV.map(item => (
          <Link key={item.href} to={item.href} onClick={onClose}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors',
              location.pathname === item.href
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}>
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded mb-1">
          ← {t('nav_products') ? 'Store' : 'Store'}
        </Link>
        <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted rounded transition-colors w-full">
          <LogOut size={16} />{t('sign_out')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-card border border-border rounded sticky top-20 overflow-hidden">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden w-full mb-4">
          <div className="bg-card border border-border rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{t('profile')}</span>
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide', roleBadge.color)}>
                {roleBadge.label[lang] ?? roleBadge.label.en}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <LangSwitcher />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu size={18} /></Button>
            </div>
          </div>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="relative w-64 bg-card border-r border-border h-full">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          )}
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
