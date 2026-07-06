import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, CheckCircle, Package, Users, Award, Wrench, ArrowRight, BadgeCheck, CreditCard, Headphones, FileSpreadsheet, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { fetchBanners, fetchFeaturedProducts, fetchCategories, fetchBrands, subscribeToTable } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Banner, Product, Category, Brand } from '@/types/types';
import WhatsAppOrderSheet from '@/components/common/WhatsAppOrderSheet';

const DEALER_BENEFITS = [
  { icon: BadgeCheck, key: 'dealer_benefit_1' },
  { icon: CreditCard, key: 'dealer_benefit_2' },
  { icon: Headphones, key: 'dealer_benefit_3' },
  { icon: FileSpreadsheet, key: 'dealer_benefit_4' },
];

export const HeroSlider: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);
  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners.length) return (
    <div className="relative w-full h-[480px] overflow-hidden grid-pattern bg-background flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="max-w-2xl">
          <span className="badge-red inline-block mb-4">Professional Security Systems</span>
          <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-4">
            Azerbaijan's #1<br /><span className="gradient-text">Security Platform</span>
          </h1>
          <p className="text-muted-foreground text-base mb-8 max-w-xl">
            Official distributor of Hikvision, Dahua and leading security brands. Smart tools, dealer program & technical support.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products">
              <Button className="bg-primary text-primary-foreground hover:bg-accent">Browse Products <ArrowRight size={15} className="ml-1" /></Button>
            </Link>
            <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="border border-primary/50 text-primary hover:bg-primary/10">{t('whatsapp_order')}</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const b = banners[current];
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '480px' }}>
      {/* Background image with transition */}
      <div className="absolute inset-0">
        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl opacity-0 intersect:opacity-100 intersect:translate-y-0 translate-y-4 transition duration-700">
            <span className="badge-red inline-block mb-4">AI Powered Security Platform</span>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">{b.title}</h1>
            {b.subtitle && <p className="text-muted-foreground text-base mb-8 max-w-xl">{b.subtitle}</p>}
            <div className="flex flex-wrap gap-3">
              {b.button_text && b.link_url && (
                <Link to={b.link_url}>
                  <Button className="bg-primary text-primary-foreground hover:bg-accent">
                    {b.button_text} <ArrowRight size={15} className="ml-1" />
                  </Button>
                </Link>
              )}
              <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="border border-primary/50 text-primary hover:bg-primary/10">
                  {t('whatsapp_order')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-secondary/70 hover:bg-secondary text-foreground flex items-center justify-center border border-border/60 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-secondary/70 hover:bg-secondary text-foreground flex items-center justify-center border border-border/60 transition-colors">
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-foreground/25 hover:bg-foreground/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [waOpen, setWaOpen] = useState(false);
  return (
    <>
      <Card className="bg-card border-border card-hover group overflow-hidden flex flex-col h-full">
        <Link to={`/products/${product.slug}`}>
          <div className="aspect-square overflow-hidden bg-muted relative">
            <img src={product.thumbnail_url ?? ''} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
            {product.is_featured && (
              <span className="absolute top-2 left-2 badge-red">Featured</span>
            )}
          </div>
        </Link>
        <div className="p-4 flex flex-col flex-1">
          {product.brands && (
            <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">{product.brands.name}</div>
          )}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-foreground leading-snug mb-3 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center justify-between mt-auto gap-2">
            <span className="price-tag text-lg shrink-0">₼{product.price.toFixed(2)}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-accent text-xs h-8 px-2"
                onClick={() => addToCart(product.id)}>
                <ShoppingCart size={13} className="mr-1" />{t('add_to_cart')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Order via WhatsApp"
                className="h-8 w-8 p-0 border border-green-700/60 text-green-500 hover:bg-green-900/20 shrink-0"
                onClick={() => setWaOpen(true)}
              >
                <MessageCircle size={14} />
              </Button>
            </div>
          </div>
          {product.stock_qty < 5 && product.stock_qty > 0 && (
            <p className="text-xs text-yellow-400 mt-2">{t('only_left')} {product.stock_qty} {t('items_left')}</p>
          )}
          {product.stock_qty === 0 && (
            <p className="text-xs text-destructive mt-2">{t('out_of_stock')}</p>
          )}
        </div>
      </Card>

      <WhatsAppOrderSheet
        open={waOpen}
        onClose={() => setWaOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          brand: product.brands?.name,
          price: product.price,
          dealer_price: product.dealer_price,
          warranty_months: product.warranty_months,
          category: product.categories?.name,
          model_number: product.model_number,
        }}
      />
    </>
  );
};

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const loadBanners = useCallback(() => { fetchBanners().then(setBanners).catch(console.error); }, []);
  const loadFeatured = useCallback(() => { fetchFeaturedProducts(8).then(setProducts).catch(console.error); }, []);

  useEffect(() => {
    loadBanners();
    loadFeatured();
    fetchCategories().then(setCategories).catch(console.error);
    fetchBrands().then(setBrands).catch(console.error);
  }, [loadBanners, loadFeatured]);

  // Live sync: homepage banners and featured products update for every
  // visitor the moment the admin changes them — no reload required.
  useEffect(() => {
    const unsubProducts = subscribeToTable('products', loadFeatured);
    const unsubBanners = subscribeToTable('banners', loadBanners);
    return () => { unsubProducts(); unsubBanners(); };
  }, [loadFeatured, loadBanners]);

  const stats = [
    { icon: Package,  value: '2500+', key: 'stat_products' },
    { icon: Wrench,   value: '3500+', key: 'stat_projects' },
    { icon: Users,    value: '5000+', key: 'stat_customers' },
    { icon: Award,    value: '100%',  key: 'stat_warranty' },
  ];

  const features = [
    { icon: Star,        title: 'Smart Cart System',   desc: 'Add products, compare, send quote — all from your account.' },
    { icon: CheckCircle, title: 'Comparison System',   desc: 'Compare products by specifications, resolution, and price.' },
    { icon: Users,       title: t('dealer_title'),      desc: 'Apply for dealer status and get exclusive wholesale pricing.' },
    { icon: Package,     title: 'Multi-Language',      desc: 'Full support in Azerbaijani, English, and Russian.' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <HeroSlider banners={banners} />

      {/* ── Stats bar ── */}
      <div className="border-y border-border bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <s.icon size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-xl font-black text-foreground leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t(s.key)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 space-y-16">

        {/* ── Brands bar ── */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-6">{t('official_distributor')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Avitel always first, highlighted */}
            <Link
              to="/products?brand=avitel"
              className="flex items-center gap-2 group"
            >
              <span className="text-base font-black text-primary tracking-widest group-hover:opacity-80 transition-opacity">
                AVITEL
              </span>
              <span className="badge-red text-[9px] py-0.5 px-1.5">PARTNER</span>
            </Link>
            {brands.filter(b => b.slug !== 'avitel').map(b => (
              <Link key={b.id} to={`/products?brand=${b.slug}`}
                className="text-base font-black text-muted-foreground/60 hover:text-primary transition-colors tracking-widest">
                {b.name.toUpperCase()}
              </Link>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ── Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-foreground red-stripe pl-3">{t('browse_category')}</h2>
            <Link to="/products" className="flex items-center gap-1 text-sm text-primary hover:underline">
              {t('view_all')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`}>
                <Card className="bg-card border-border card-hover overflow-hidden group">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img src={cat.image_url ?? ''} alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Products ── */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground red-stripe pl-3">{t('featured_products')}</h2>
              <Link to="/products" className="flex items-center gap-1 text-sm text-primary hover:underline">
                {t('view_all')} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* ── AVITEL Full Poster Showcase ── */}
        <section className="rounded-2xl overflow-hidden border border-primary/25 relative" style={{ background: 'linear-gradient(135deg, hsl(222 35% 7%) 0%, hsl(222 30% 10%) 60%, hsl(0 60% 10%) 100%)' }}>
          {/* Background glow blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6 md:p-10">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge-red">Rəsmi Tərəfdaş / Official Partner</span>
                  <span className="text-xs border border-primary/30 text-primary rounded px-2 py-0.5 font-semibold">Az Premium Brand</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'hsl(0 0% 96%)' }}>
                  AVITEL
                </h2>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">Smart Security Cameras — Azerbaijan</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link to="/products?brand=avitel">
                  <Button className="bg-primary text-primary-foreground hover:bg-accent font-bold px-6">
                    Bütün Modellər <ArrowRight size={15} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3-camera product grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Product 1 — Bullet */}
              <Link to="/products/avitel-smart-ai-bullet-4mp" className="group">
                <div className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-white/5 relative">
                    <img src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_99215760-6580-4f0b-83c6-b6eea3f674ac.jpg"
                      alt="Avitel AI Bullet 4MP" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 badge-red text-[9px]">AI DETECT</span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-xs leading-snug">Avitel AI Bullet 4MP</p>
                      <p className="text-white/60 text-xs">Outdoor · IP67 · H.265+</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="price-tag text-lg font-black">₼129</span>
                    <span className="text-xs text-white/50 line-through">₼152</span>
                  </div>
                </div>
              </Link>

              {/* Product 2 — Dome (center, larger) */}
              <Link to="/products/avitel-smart-dome-8mp-4k" className="group md:scale-105 md:-mt-2">
                <div className="rounded-xl border border-primary/40 bg-primary/8 hover:bg-primary/12 hover:border-primary/60 transition-all overflow-hidden shadow-lg shadow-primary/10">
                  <div className="aspect-square overflow-hidden bg-white/5 relative">
                    <img src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71dbc2e1-f7b4-4eb8-8267-946336d359c5.jpg"
                      alt="Avitel Smart Dome 8MP" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 badge-red text-[9px]">⭐ BESTSELLER</span>
                    <span className="absolute top-3 right-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">4K</span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-xs leading-snug">Avitel Smart Dome 8MP</p>
                      <p className="text-white/60 text-xs">Indoor · 360° · AI Motion</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="price-tag text-lg font-black">₼189</span>
                    <span className="text-xs text-white/50 line-through">₼222</span>
                  </div>
                </div>
              </Link>

              {/* Product 3 — PTZ */}
              <Link to="/products/avitel-colorvu-ptz-5mp" className="group">
                <div className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-white/5 relative">
                    <img src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_982b93e1-b588-47b8-89fe-fcc3320be8ef.jpg"
                      alt="Avitel ColorVu PTZ 5MP" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">PTZ 30×</span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-xs leading-snug">Avitel ColorVu PTZ 5MP</p>
                      <p className="text-white/60 text-xs">Auto-Track · 30× Zoom</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="price-tag text-lg font-black">₼249</span>
                    <span className="text-xs text-white/50 line-through">₼293</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Bottom: feature pills + trust row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['4K Ultra HD', 'AI Human/Vehicle Detect', 'ColorNight Vision', 'IP67 Waterproof', 'Cloud App', '24mo Warranty'].map(f => (
                  <span key={f} className="text-xs bg-white/8 text-white/70 border border-white/10 px-2.5 py-1 rounded-md">{f}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50 shrink-0">
                <CheckCircle size={12} className="text-primary" />
                <span>ITSecurity.az — Avitel rəsmi distribütoru</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hikvision Showcase ── */}
        <section className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 flex flex-col justify-center">
              <span className="badge-red inline-block mb-4 w-fit">Hikvision Smart Technology Center</span>
              <h2 className="text-2xl font-black text-foreground mb-3">AcuSense &amp; ColorVu Technology</h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-sm">
                Experience Hikvision's latest AI-powered cameras. AcuSense reduces false alarms by 90%. ColorVu delivers full-color images in near-zero light.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['AcuSense AI', 'ColorVu Night', 'H.265+', 'IP67'].map(f => (
                  <span key={f} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-border">{f}</span>
                ))}
              </div>
              <Link to="/products?brand=hikvision" className="w-fit">
                <Button className="bg-primary text-primary-foreground hover:bg-accent">
                  Explore Hikvision <ArrowRight size={15} className="ml-1" />
                </Button>
              </Link>
            </div>
            <div className="overflow-hidden min-h-56">
              <img src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f06aa236-b5fc-4d42-8af8-7425ce2f747f.jpg"
                alt="Hikvision ColorVu Camera" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* ── Dealer CTA ── */}
        <section className="rounded-lg overflow-hidden relative" style={{ background: 'var(--gradient-dealer)' }}>
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative z-10 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="badge-red inline-block mb-4">{t('become_dealer')}</span>
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">{t('dealer_title')}</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{t('dealer_desc')}</p>
                <Link to="/dealer">
                  <Button className="bg-primary text-primary-foreground hover:bg-accent">
                    {t('dealer_apply')} <ArrowRight size={15} className="ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DEALER_BENEFITS.map(({ icon: Icon, key }) => (
                  <div key={key} className="bg-background/10 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                    <Icon size={20} className="text-primary" />
                    <span className="text-xs font-medium text-foreground leading-snug">{t(key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Platform Features ── */}
        <section>
          <h2 className="text-xl font-black text-foreground red-stripe pl-3 mb-6">{t('platform_features')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <Card key={f.title} className="bg-card border-border p-5 card-hover">
                <f.icon size={22} className="text-primary mb-3" />
                <h3 className="text-sm font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Custom Quote CTA ── */}
        <section className="border border-border rounded-lg p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-foreground mb-2">{t('custom_quote')}</h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">{t('custom_quote_desc')}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-800 hover:bg-green-700 text-white">WhatsApp: +994 77 611 77 80</Button>
              </a>
              <Link to="/tools">
                <Button variant="ghost" className="border border-border text-foreground hover:bg-muted">{t('use_smart_tools')}</Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
