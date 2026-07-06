/**
 * WhatsApp Order Sheet
 * Professional order message builder for ITSecurity.az
 * Generates formatted AZ/EN/RU messages with product details,
 * quantity, pricing, warranty, and optional contract notes.
 */
import React, { useState } from 'react';
import { MessageCircle, Copy, CheckCheck, FileText, Package, Tag, Shield, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface WAProduct {
  id: string;
  name: string;
  sku?: string | null;
  brand?: string;
  price: number;
  dealer_price?: number | null;
  warranty_months?: number | null;
  category?: string;
  model_number?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  product?: WAProduct;
  /** Cart mode: pass array of items */
  cartItems?: { product: WAProduct; qty: number }[];
}

const WA_NUMBER = '994776117780';

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'Standard', labelAz: 'Standart', labelRu: 'Стандарт' },
  { value: 'premium', label: 'Premium', labelAz: 'Premium', labelRu: 'Премиум' },
  { value: 'bulk', label: 'Bulk / Wholesale', labelAz: 'Toplu / Topdancı', labelRu: 'Оптовый' },
];

const CONTRACT_PRESETS = [
  { key: 'installment', az: 'Hissə-hissə ödəniş (3-12 ay)', en: 'Installment payment (3-12 months)', ru: 'Рассрочка (3-12 месяцев)' },
  { key: 'delivery', az: 'Çatdırılma xidməti lazımdır', en: 'Delivery service required', ru: 'Требуется доставка' },
  { key: 'installation', az: 'Quraşdırma xidməti lazımdır', en: 'Installation service required', ru: 'Требуется монтаж' },
  { key: 'warranty_ext', az: 'Uzadılmış zəmanət istəyirəm', en: 'Extended warranty requested', ru: 'Расширенная гарантия' },
  { key: 'invoice', az: 'Rəsmi faktura lazımdır', en: 'Official invoice required', ru: 'Нужна официальная счет-фактура' },
];

function buildMessage(
  lang: 'az' | 'en' | 'ru',
  customerName: string,
  phone: string,
  product: WAProduct | undefined,
  cartItems: { product: WAProduct; qty: number }[] | undefined,
  qty: number,
  quality: string,
  contractTerms: string[],
  notes: string,
  isDealer: boolean,
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === 'az' ? 'az-AZ' : lang === 'ru' ? 'ru-RU' : 'en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const header: Record<string, string> = {
    az: `🛒 *YENİ SİFARİŞ — ITSecurity.az*\n📅 Tarix: ${dateStr} ${timeStr}`,
    en: `🛒 *NEW ORDER — ITSecurity.az*\n📅 Date: ${dateStr} ${timeStr}`,
    ru: `🛒 *НОВЫЙ ЗАКАЗ — ITSecurity.az*\n📅 Дата: ${dateStr} ${timeStr}`,
  };

  const divider = '─────────────────────────';

  const customerLabel: Record<string, string> = { az: '👤 *MÜŞTƏRİ*', en: '👤 *CUSTOMER*', ru: '👤 *КЛИЕНТ*' };
  const nameLabel: Record<string, string> = { az: 'Ad', en: 'Name', ru: 'Имя' };
  const phoneLabel: Record<string, string> = { az: 'Telefon', en: 'Phone', ru: 'Телефон' };
  const typeLabel: Record<string, string> = {
    az: isDealer ? 'Topdancı müştəri' : 'Pərakəndə müştəri',
    en: isDealer ? 'Wholesale / Dealer' : 'Retail customer',
    ru: isDealer ? 'Оптовый / Дилер' : 'Розничный клиент',
  };

  const orderLabel: Record<string, string> = { az: '📦 *SİFARİŞ TƏFSİLATI*', en: '📦 *ORDER DETAILS*', ru: '📦 *ДЕТАЛИ ЗАКАЗА*' };
  const qtyLabel: Record<string, string> = { az: 'Ədəd', en: 'Quantity', ru: 'Количество' };
  const priceLabel: Record<string, string> = { az: 'Qiymət', en: 'Price', ru: 'Цена' };
  const totalLabel: Record<string, string> = { az: 'Cəmi', en: 'Total', ru: 'Итого' };
  const brandLabel: Record<string, string> = { az: 'Brend', en: 'Brand', ru: 'Бренд' };
  const warrantyLabel: Record<string, string> = { az: 'Zəmanət', en: 'Warranty', ru: 'Гарантия' };
  const qualityLabel: Record<string, string> = { az: 'Keyfiyyət növü', en: 'Quality type', ru: 'Тип качества' };
  const skuLabel: Record<string, string> = { az: 'Model/SKU', en: 'Model/SKU', ru: 'Модель/SKU' };

  const termsLabel: Record<string, string> = { az: '📋 *MÜQAVILƏ ŞƏRTLƏRİ*', en: '📋 *CONTRACT TERMS*', ru: '📋 *УСЛОВИЯ ДОГОВОРА*' };
  const notesLabel: Record<string, string> = { az: '📝 *QEYDLƏR*', en: '📝 *NOTES*', ru: '📝 *ПРИМЕЧАНИЯ*' };

  const footerLabel: Record<string, string> = {
    az: '✅ Əlaqə nömrəsi: +994 77 611 77 80\n🌐 itsecurity.az',
    en: '✅ Contact: +994 77 611 77 80\n🌐 itsecurity.az',
    ru: '✅ Контакт: +994 77 611 77 80\n🌐 itsecurity.az',
  };

  const qualityOpt = QUALITY_OPTIONS.find(o => o.value === quality);
  const qualityText = lang === 'az' ? qualityOpt?.labelAz : lang === 'ru' ? qualityOpt?.labelRu : qualityOpt?.label;

  let lines: string[] = [];
  lines.push(header[lang]);
  lines.push(divider);

  // Customer block
  lines.push(customerLabel[lang]);
  if (customerName) lines.push(`${nameLabel[lang]}: ${customerName}`);
  if (phone) lines.push(`${phoneLabel[lang]}: ${phone}`);
  lines.push(`🏷️ ${typeLabel[lang]}`);
  lines.push(divider);

  // Products block
  lines.push(orderLabel[lang]);
  lines.push('');

  if (cartItems && cartItems.length > 0) {
    let grandTotal = 0;
    cartItems.forEach((ci, idx) => {
      const p = ci.product;
      const unitPrice = isDealer && p.dealer_price ? p.dealer_price : p.price;
      const lineTotal = unitPrice * ci.qty;
      grandTotal += lineTotal;
      lines.push(`${idx + 1}. *${p.name}*`);
      if (p.brand) lines.push(`   ${brandLabel[lang]}: ${p.brand}`);
      if (p.sku || p.model_number) lines.push(`   ${skuLabel[lang]}: ${p.model_number ?? p.sku}`);
      lines.push(`   ${qtyLabel[lang]}: ${ci.qty} ${lang === 'az' ? 'ədəd' : lang === 'ru' ? 'шт' : 'pcs'}`);
      lines.push(`   ${priceLabel[lang]}: ₼${unitPrice.toFixed(2)} × ${ci.qty} = ₼${lineTotal.toFixed(2)}`);
      if (p.warranty_months) lines.push(`   ${warrantyLabel[lang]}: ${p.warranty_months} ${lang === 'az' ? 'ay' : lang === 'ru' ? 'мес' : 'months'}`);
      lines.push('');
    });
    lines.push(`💰 *${totalLabel[lang]}: ₼${grandTotal.toFixed(2)}*`);
  } else if (product) {
    const unitPrice = isDealer && product.dealer_price ? product.dealer_price : product.price;
    const lineTotal = unitPrice * qty;
    lines.push(`*${product.name}*`);
    if (product.brand) lines.push(`${brandLabel[lang]}: ${product.brand}`);
    if (product.sku || product.model_number) lines.push(`${skuLabel[lang]}: ${product.model_number ?? product.sku}`);
    if (product.category) lines.push(`${lang === 'az' ? 'Kateqoriya' : lang === 'ru' ? 'Категория' : 'Category'}: ${product.category}`);
    lines.push(`${qtyLabel[lang]}: ${qty} ${lang === 'az' ? 'ədəd' : lang === 'ru' ? 'шт' : 'pcs'}`);
    lines.push(`${priceLabel[lang]}: ₼${unitPrice.toFixed(2)} × ${qty} = *₼${lineTotal.toFixed(2)}*`);
    if (isDealer && product.dealer_price) {
      lines.push(`🎯 ${lang === 'az' ? 'Topdancı qiyməti tətbiq edildi' : lang === 'ru' ? 'Дилерская цена применена' : 'Dealer price applied'}`);
    }
    if (product.warranty_months) lines.push(`${warrantyLabel[lang]}: ${product.warranty_months} ${lang === 'az' ? 'ay' : lang === 'ru' ? 'мес' : 'months'}`);
  }

  lines.push(`${qualityLabel[lang]}: ${qualityText}`);
  lines.push(divider);

  // Contract terms
  if (contractTerms.length > 0) {
    lines.push(termsLabel[lang]);
    contractTerms.forEach(key => {
      const preset = CONTRACT_PRESETS.find(p => p.key === key);
      if (preset) lines.push(`• ${lang === 'az' ? preset.az : lang === 'ru' ? preset.ru : preset.en}`);
    });
    lines.push(divider);
  }

  // Notes
  if (notes.trim()) {
    lines.push(notesLabel[lang]);
    lines.push(notes.trim());
    lines.push(divider);
  }

  lines.push(footerLabel[lang]);

  return lines.join('\n');
}

const WhatsAppOrderSheet: React.FC<Props> = ({ open, onClose, product, cartItems }) => {
  const { lang, t } = useLanguage();
  const { profile, isDealer } = useAuth();

  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [quality, setQuality] = useState('standard');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCartMode = !!cartItems && cartItems.length > 0;
  const unitPrice = isDealer && product?.dealer_price ? product.dealer_price : (product?.price ?? 0);
  const totalPrice = isCartMode
    ? cartItems.reduce((sum, ci) => {
        const p = isDealer && ci.product.dealer_price ? ci.product.dealer_price : ci.product.price;
        return sum + p * ci.qty;
      }, 0)
    : unitPrice * qty;

  const toggleTerm = (key: string) =>
    setSelectedTerms(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const message = buildMessage(lang, customerName, phone, product, cartItems, qty, quality, selectedTerms, notes, isDealer);

  const handleSendWA = () => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(lang === 'az' ? 'WhatsApp açılır...' : lang === 'ru' ? 'Открываем WhatsApp...' : 'Opening WhatsApp...');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success(lang === 'az' ? 'Mətn kopyalandı' : lang === 'ru' ? 'Текст скопирован' : 'Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const labelMap = {
    title: { az: 'WhatsApp ilə Sifariş', en: 'Order via WhatsApp', ru: 'Заказ через WhatsApp' },
    customer: { az: 'Müştəri Məlumatları', en: 'Customer Info', ru: 'Данные клиента' },
    name: { az: 'Ad Soyad', en: 'Full Name', ru: 'ФИО' },
    phone: { az: 'Telefon', en: 'Phone', ru: 'Телефон' },
    qty: { az: 'Ədəd', en: 'Quantity', ru: 'Количество' },
    quality: { az: 'Keyfiyyət növü', en: 'Quality / Order Type', ru: 'Тип заказа' },
    terms: { az: 'Müqavilə Şərtləri', en: 'Contract Terms', ru: 'Условия договора' },
    notes: { az: 'Əlavə qeydlər', en: 'Additional notes', ru: 'Дополнительные заметки' },
    preview: { az: 'Mesaja bax', en: 'Preview message', ru: 'Предпросмотр' },
    send: { az: 'WhatsApp ilə Göndər', en: 'Send via WhatsApp', ru: 'Отправить в WhatsApp' },
    copy: { az: 'Kopyala', en: 'Copy', ru: 'Копировать' },
    total: { az: 'Cəmi', en: 'Total', ru: 'Итого' },
    notesPlaceholder: { az: 'Buraya əlavə məlumat, sorğu və ya şərtlərinizi yazın...', en: 'Enter any additional info, requests or special conditions...', ru: 'Введите дополнительную информацию, запросы или особые условия...' },
  };
  const L = (key: keyof typeof labelMap) => labelMap[key][lang] ?? labelMap[key]['en'];

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="right" className="bg-secondary border-border w-full max-w-[calc(100%-2rem)] md:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </span>
            {L('title')}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-6">

          {/* Product summary */}
          {!isCartMode && product && (
            <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
              <Package size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-primary font-semibold uppercase mb-0.5">{product.brand}</div>
                <div className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</div>
                {(product.sku || product.model_number) && (
                  <div className="text-xs text-muted-foreground mt-0.5">SKU: {product.model_number ?? product.sku}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="price-tag text-base">₼{unitPrice.toFixed(2)}</span>
                  {isDealer && product.dealer_price && (
                    <Badge className="badge-red text-[10px]">Dealer Price</Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cart summary */}
          {isCartMode && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Package size={15} className="text-primary" />
                {cartItems.length} {lang === 'az' ? 'məhsul' : lang === 'ru' ? 'товара' : 'items'}
              </div>
              {cartItems.map(ci => (
                <div key={ci.product.id} className="flex justify-between text-xs text-muted-foreground">
                  <span className="line-clamp-1 flex-1 min-w-0 mr-2">{ci.product.name}</span>
                  <span className="shrink-0">×{ci.qty}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-foreground">
                <span>{L('total')}</span>
                <span className="price-tag">₼{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Customer info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{L('customer')}</p>
            <Input value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder={L('name')} className="bg-background border-border text-sm h-9" />
            <Input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={L('phone') + ' (+994...)'} className="bg-background border-border text-sm h-9" />
          </div>

          {/* Quantity (single product only) */}
          {!isCartMode && product && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{L('qty')}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-foreground hover:bg-muted transition-colors font-bold">−</button>
                  <span className="px-5 py-2 text-sm font-bold text-foreground bg-muted min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-foreground hover:bg-muted transition-colors font-bold">+</button>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{L('total')}</div>
                  <div className="price-tag text-xl font-black">₼{(unitPrice * qty).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Quality type */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              <span className="flex items-center gap-1"><Star size={12} className="text-primary" />{L('quality')}</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUALITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setQuality(opt.value)}
                  className={cn(
                    'px-2 py-2 text-xs font-semibold rounded-md border transition-colors text-center',
                    quality === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}>
                  {lang === 'az' ? opt.labelAz : lang === 'ru' ? opt.labelRu : opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contract terms */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              <span className="flex items-center gap-1"><FileText size={12} className="text-primary" />{L('terms')}</span>
            </p>
            <div className="space-y-1.5">
              {CONTRACT_PRESETS.map(preset => {
                const label = lang === 'az' ? preset.az : lang === 'ru' ? preset.ru : preset.en;
                const active = selectedTerms.includes(preset.key);
                return (
                  <button key={preset.key} onClick={() => toggleTerm(preset.key)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/8 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    )}>
                    <div className={cn('w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors',
                      active ? 'bg-primary border-primary' : 'border-border')}>
                      {active && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              <span className="flex items-center gap-1"><Tag size={12} className="text-primary" />{L('notes')}</span>
            </p>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={L('notesPlaceholder')}
              className="bg-background border-border text-sm min-h-[80px] resize-none"
            />
          </div>

          {/* Message preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowPreview(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
            >
              <span className="flex items-center gap-1.5"><MessageCircle size={14} className="text-green-400" />{L('preview')}</span>
              {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showPreview && (
              <pre className="p-4 text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background leading-relaxed max-h-64 overflow-y-auto">
                {message}
              </pre>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={handleSendWA}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-bold h-11 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current mr-2 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {L('send')}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCopy}
              className="w-full border border-border text-muted-foreground hover:text-foreground h-9 text-sm"
            >
              {copied ? <CheckCheck size={14} className="mr-2 text-green-400" /> : <Copy size={14} className="mr-2" />}
              {copied ? (lang === 'az' ? 'Kopyalandı!' : lang === 'ru' ? 'Скопировано!' : 'Copied!') : L('copy')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WhatsAppOrderSheet;
