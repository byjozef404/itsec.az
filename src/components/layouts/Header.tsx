import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Phone, MapPin, ChevronDown, Heart, LogOut, Settings, Package, LayoutDashboard, Globe, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage, type Lang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

const LangSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { lang, setLang } = useLanguage();
  return (
    <div className={cn('flex items-center rounded overflow-hidden border border-border', compact ? 'text-xs' : 'text-xs')}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={cn(
            'px-2 py-1 font-semibold transition-colors',
            lang === code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export const Header: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const navLinks = [
    { label: t('nav_products'), href: '/products' },
    { label: 'Hikvision', href: '/products?brand=hikvision' },
    { label: t('nav_tools'), href: '/tools' },
    { label: t('nav_blog'), href: '/blog' },
    { label: t('nav_contact'), href: '/contact' },
  ];

  const categoryLinks = [
    { label: t('cat_ip'), slug: 'ip-cameras' },
    { label: t('cat_analog'), slug: 'analog-cameras' },
    { label: t('cat_dvr'), slug: 'dvr-nvr' },
    { label: t('cat_switches'), slug: 'switches' },
    { label: t('cat_cables'), slug: 'cables-accessories' },
    { label: t('cat_access'), slug: 'access-control' },
    { label: t('cat_alarms'), slug: 'alarms' },
    { label: t('cat_ptz'), slug: 'ptz-cameras' },
  ];

  return (
    <>
      {/* Top info bar */}
      <div className="bg-secondary border-b border-border hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <a href="tel:+994776117780" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Phone size={11} className="text-primary" />+994 77 611 77 80
            </a>
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-primary" />Baku, Azadliq prospekti 143
            </div>
            <span>09:00–18:00 (Mon–Sat)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-medium">{t('free_consultation')}</span>
            <LangSwitcher />
          </div>
        </div>
      </div>

      {/* Main header — glassmorphism on scroll */}
      <header className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'glass-header border-border/60 shadow-lg shadow-black/40'
          : 'bg-secondary border-border'
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 group">
              <span className="text-xl font-black text-primary tracking-tight group-hover:brightness-110 transition-all">IT</span>
              <span className="text-xl font-black text-foreground tracking-tight">Security</span>
              <span className="text-base font-bold text-muted-foreground">.az</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    location.pathname === link.href
                      ? 'text-primary bg-primary/8'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors">
                  {t('nav_categories')} <ChevronDown size={13} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-secondary border-border w-52">
                  {categoryLinks.map(c => (
                    <DropdownMenuItem key={c.slug} asChild>
                      <Link to={`/products?category=${c.slug}`} className="cursor-pointer text-sm">{c.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex ml-2">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search cameras, NVR..."
                  className="pl-9 bg-background/60 border-border h-9 text-sm focus:bg-background transition-colors"
                />
              </div>
            </form>

            <div className="flex items-center gap-1.5 ml-auto">
              {/* WhatsApp */}
              <a
                href="https://wa.me/994776117780"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-green-800 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                {WA_ICON}
                <span className="hidden xl:inline">{t('whatsapp_order')}</span>
              </a>

              {/* Lang switcher — desktop only (also in top bar, so only show if no top bar) */}
              <div className="hidden md:flex lg:hidden">
                <LangSwitcher />
              </div>

              {/* Theme lamp toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle theme"
                  >
                    {isDark ? (
                      <Sun size={17} className="text-yellow-400" />
                    ) : (
                      <Moon size={17} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
                </TooltipContent>
              </Tooltip>

              {/* Wishlist */}
              {user && (
                <Link to="/user/wishlist">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                    <Heart size={17} />
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                  <ShoppingCart size={17} />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                      <User size={17} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-secondary border-border w-52">
                    <div className="px-3 py-2.5 text-xs border-b border-border">
                      <div className="font-semibold text-foreground truncate">{profile?.full_name || profile?.email}</div>
                      <div className="capitalize text-primary mt-0.5">{profile?.role}</div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/user" className="cursor-pointer"><Package size={13} className="mr-2" />{t('my_orders')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/user/profile" className="cursor-pointer"><Settings size={13} className="mr-2" />{t('profile')}</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer text-primary"><LayoutDashboard size={13} className="mr-2" />{t('admin_panel')}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {profile?.role === 'dealer' && profile.dealer_status === 'approved' && (
                      <DropdownMenuItem asChild>
                        <Link to="/dealer" className="cursor-pointer text-yellow-400"><LayoutDashboard size={13} className="mr-2" />{t('dealer_panel')}</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                      <LogOut size={13} className="mr-2" />{t('sign_out')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent text-xs h-8 px-3">{t('sign_in')}</Button>
                </Link>
              )}

              {/* Mobile menu trigger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground h-9 w-9">
                    <Menu size={19} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-secondary border-border w-72 p-0">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <Link to="/" onClick={() => setMobileOpen(false)}>
                      <span className="text-lg font-black text-primary">PRO</span>
                      <span className="text-lg font-black text-foreground">SECURITY.AZ</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe size={13} />Language
                    </div>
                    <LangSwitcher />
                  </div>
                  <form onSubmit={e => { handleSearch(e); setMobileOpen(false); }} className="p-4 border-b border-border">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 bg-background border-border text-sm h-9" />
                    </div>
                  </form>
                  <nav className="p-3 flex flex-col gap-0.5 overflow-y-auto">
                    {navLinks.map(link => (
                      <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                        className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        {link.label}
                      </Link>
                    ))}
                    <div className="section-divider my-2" />
                    {categoryLinks.map(c => (
                      <Link key={c.slug} to={`/products?category=${c.slug}`} onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        {c.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border">
                    <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-800 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition-colors">
                      {WA_ICON} WhatsApp: +994 77 611 77 80
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
