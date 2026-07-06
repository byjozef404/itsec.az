import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock, Shield, QrCode, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';

const SITE_URL = 'https://itsecurity.az';

const QRWidget: React.FC = () => {
  const handleDownload = () => {
    const canvas = document.querySelector('.qr-code-container img') as HTMLImageElement | null;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.src;
    a.download = 'prosecurity-az-qr.png';
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-2.5 rounded-lg shadow-md inline-block">
        <QRCodeDataUrl
          text={SITE_URL}
          width={96}
          color="#CC0000"
          backgroundColor="#ffffff"
        />
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Download size={12} />
        Download QR
      </button>
    </div>
  );
};

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  const productLinks: [string, string][] = [
    [t('cat_ip'),       '/products?category=ip-cameras'],
    [t('cat_analog'),   '/products?category=analog-cameras'],
    [t('cat_dvr'),      '/products?category=dvr-nvr'],
    [t('cat_switches'), '/products?category=switches'],
    [t('cat_access'),   '/products?category=access-control'],
    [t('cat_ptz'),      '/products?category=ptz-cameras'],
    [t('cat_alarms'),   '/products?category=alarms'],
  ];

  const serviceLinks: [string, string][] = [
    ['Smart Tools',         '/tools'],
    [t('dealer_title'),      '/dealer'],
    ['Blog & News',         '/blog'],
    [t('nav_contact'),       '/contact'],
    [t('footer_about'),      '/about'],
    [t('footer_privacy'),    '/privacy'],
  ];

  return (
    <footer className="bg-secondary border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-black text-primary">PRO</span>
              <span className="text-xl font-black text-foreground">SECURITY</span>
              <span className="text-base font-bold text-muted-foreground">.AZ</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Professional security systems distributor. Official partner of Hikvision, Dahua, TP-Link, and other leading brands.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={13} className="text-primary shrink-0" />
              <span>Official Authorized Distributor</span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 red-stripe pl-3">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {productLinks.map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 red-stripe pl-3">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {serviceLinks.map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* QR Code */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 red-stripe pl-3">
              <span className="flex items-center gap-1.5"><QrCode size={13} className="text-primary" />Scan to Visit</span>
            </h4>
            <QRWidget />
            <p className="text-xs text-muted-foreground mt-3 text-center">{SITE_URL}</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 red-stripe pl-3">{t('nav_contact')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="tel:+994776117780" className="flex items-start gap-2 hover:text-primary transition-colors">
                  <Phone size={13} className="text-primary mt-0.5 shrink-0" />+994 77 611 77 80
                </a>
              </li>
              <li>
                <a href="mailto:info@itsecurity.az" className="flex items-start gap-2 hover:text-primary transition-colors">
                  <Mail size={13} className="text-primary mt-0.5 shrink-0" />info@itsecurity.az
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-primary mt-0.5 shrink-0" />
                  <span>Baku, Azadliq prospekti 143</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <Clock size={13} className="text-primary mt-0.5 shrink-0" />
                  <span>09:00–18:00 (Mon–Sat)</span>
                </div>
              </li>
            </ul>
            <a href="https://wa.me/994776117780" target="_blank" rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-green-800 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Order
            </a>
          </div>
        </div>

        {/* Brand logos */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-5">{t('official_distributor')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-black tracking-widest text-muted-foreground/50">
            {['HIKVISION', 'DAHUA', 'TP-LINK', 'CISCO', 'AVITEL', 'RVI'].map(b => (
              <span key={b} className="hover:text-foreground transition-colors cursor-pointer">{b}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2025 ITSecurity.az — {t('footer_rights')}</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">{t('footer_privacy')}</Link>
            <Link to="/about" className="hover:text-primary transition-colors">{t('footer_terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
