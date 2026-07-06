/**
 * LanguageContext — AZ / EN / RU multi-language support
 * Persists selection to localStorage. Provides t() translation helper.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'az' | 'en' | 'ru';

const STORAGE_KEY = 'prosecurity_lang';

// ─── Translation strings ───────────────────────────────────────────────────
const translations: Record<Lang, Record<string, string>> = {
  az: {
    // Nav
    nav_products: 'Məhsullar',
    nav_hikvision: 'Hikvision',
    nav_tools: 'Alətlər',
    nav_blog: 'Blog',
    nav_contact: 'Əlaqə',
    nav_categories: 'Kateqoriyalar',
    // Auth
    sign_in: 'Daxil ol',
    sign_out: 'Çıxış',
    my_orders: 'Sifarişlərim',
    profile: 'Profil',
    admin_panel: 'Admin Panel',
    dealer_panel: 'Topdancı Panel',
    // Cart
    cart: 'Səbət',
    add_to_cart: 'Səbətə əlavə et',
    view_all: 'Hamısına bax',
    // Hero
    whatsapp_order: 'WhatsApp ilə sifariş',
    // Sections
    official_distributor: 'Rəsmi Distribyutor',
    browse_category: 'Kateqoriyaya görə bax',
    featured_products: 'Seçilmiş Məhsullar',
    platform_features: 'Platforma Xüsusiyyətləri',
    custom_quote: 'Fərdi Smetaya ehtiyacınız var?',
    custom_quote_desc: 'Texniki komandamız sizin üçün ideal təhlükəsizlik sistemi layihələndirməyə kömək edəcək.',
    use_smart_tools: 'Ağıllı Alətlərdən istifadə et',
    // Dealer
    become_dealer: 'Topdancı ol',
    dealer_title: 'Topdancı Proqramı',
    dealer_desc: 'Topdancı statusu alın və bütün sifarişlərə xüsusi qiymətlər əldə edin.',
    dealer_benefit_1: 'Bütün məhsullara xüsusi qiymətlər',
    dealer_benefit_2: 'Kredit limiti & gecikmə imkanı',
    dealer_benefit_3: 'Şəxsi texniki dəstək',
    dealer_benefit_4: 'Excel idxal/ixrac',
    dealer_apply: 'İndi müraciət et',
    // Stats
    stat_products: 'Məhsul',
    stat_projects: 'Layihə',
    stat_customers: 'Müştəri',
    stat_warranty: 'Rəsmi Zəmanət',
    // Categories
    cat_ip: 'IP Kameralar',
    cat_analog: 'Analog Kameralar',
    cat_dvr: 'DVR / NVR',
    cat_switches: 'PoE Açarlar',
    cat_cables: 'Kabel & Aksesuarlar',
    cat_access: 'Giriş Nəzarəti',
    cat_alarms: 'Həyəcan Sistemləri',
    cat_ptz: 'PTZ Kameralar',
    // Footer
    footer_about: 'Haqqımızda',
    footer_contact: 'Əlaqə',
    footer_terms: 'Şərtlər',
    footer_privacy: 'Gizlilik',
    footer_warranty: 'Zəmanət',
    footer_rights: 'Bütün hüquqlar qorunur.',
    out_of_stock: 'Stokda yoxdur',
    only_left: 'Yalnız',
    items_left: 'ədəd qaldı',
    free_consultation: 'Pulsuz Konsultasiya mövcuddur',
    dealer_nav_dashboard: 'İdarə Paneli',
    dealer_nav_orders: 'Toplu Sifarişlər',
    dealer_nav_credit: 'Kredit',
    dealer_nav_stats: 'Statistika',
    dealer_nav_export: 'İxrac',
    dealer_logged_as: 'Daxil olunub',
    dealer_discount_label: 'Topdancı · 15% endirim',
    dealer_back_store: '← Mağazaya qayıt',
    distributor_panel: 'Diler Panel',
    distributor_discount_label: 'Diler · 10% endirim',
    price_retail: 'Pərakəndə qiymət',
    price_your: 'Sizin qiymətiniz',
    price_dealer: 'Topdancı qiyməti',
    price_distributor: 'Diler qiyməti',
    price_cost: 'Maya dəyəri',
    discount_badge_dealer: '−15% Topdancı',
    discount_badge_distributor: '−10% Diler',
    volume_discount: 'Həcm endirimi',
    volume_discount_info: 'Çox alanlara xüsusi qiymət verilir',
    // Camera type filter bar
    cat_indoor: 'Daxili kamera',
    cat_outdoor: 'Xarici kamera',
    cat_all_cameras: 'Bütün kameralar',
    // Tools page
    tools_title: 'Texniki Alətlər',
    tools_subtitle: 'DVR/NVR proqramları, mobil tətbiqlər və peşəkar kalkulyatorlar',
    tools_tab_downloads: 'Proqramlar',
    tools_software_title: 'DVR/NVR Proqram & Mobil Tətbiqlər',
    tools_software_subtitle: 'Kamera sistemlərini PC və ya smartfonunuzdan idarə edin',
    tools_consult: 'WhatsApp ilə əlaqə',
    // Reports
    reports_title: 'Hesabatlar',
    reports_subtitle: 'PDF, CSV/Excel ixrac — rəngli kamera qiymət siyahısı',
    reports_monthly: 'Aylıq Gəlir',
    reports_products: 'Məhsul Qiymət Siyahısı',
    reports_export_csv: 'Excel/CSV',
    reports_export_pdf: 'Rəngli PDF',
    // Social
    social_whatsapp: 'WhatsApp',
    social_tiktok: 'TikTok',
    social_instagram: 'Instagram',
    // Admin nav
    admin_nav_reports: 'Hesabatlar',
    // Protected by Jozef
    protected_by: 'Protected by',
  },
  en: {
    nav_products: 'Products',
    nav_hikvision: 'Hikvision',
    nav_tools: 'Tools',
    nav_blog: 'Blog',
    nav_contact: 'Contact',
    nav_categories: 'Categories',
    sign_in: 'Sign In',
    sign_out: 'Sign Out',
    my_orders: 'My Orders',
    profile: 'Profile',
    admin_panel: 'Admin Panel',
    dealer_panel: 'Dealer Panel',
    cart: 'Cart',
    add_to_cart: 'Add to Cart',
    view_all: 'View all',
    whatsapp_order: 'Order via WhatsApp',
    official_distributor: 'Official Distributor',
    browse_category: 'Browse by Category',
    featured_products: 'Featured Products',
    platform_features: 'Platform Features',
    custom_quote: 'Need a Custom Quote?',
    custom_quote_desc: 'Our technical team will help you design the perfect security system for your needs.',
    use_smart_tools: 'Use Smart Tools',
    become_dealer: 'Become a Dealer',
    dealer_title: 'Dealer Program',
    dealer_desc: 'Apply for dealer status and get exclusive wholesale pricing on all orders.',
    dealer_benefit_1: 'Exclusive wholesale pricing',
    dealer_benefit_2: 'Credit limit & deferred payment',
    dealer_benefit_3: 'Dedicated technical support',
    dealer_benefit_4: 'Excel import / export',
    dealer_apply: 'Apply Now',
    stat_products: 'Products',
    stat_projects: 'Projects',
    stat_customers: 'Happy Customers',
    stat_warranty: 'Official Warranty',
    cat_ip: 'IP Cameras',
    cat_analog: 'Analog Cameras',
    cat_dvr: 'DVR / NVR',
    cat_switches: 'PoE Switches',
    cat_cables: 'Cables & Accessories',
    cat_access: 'Access Control',
    cat_alarms: 'Alarms',
    cat_ptz: 'PTZ Cameras',
    footer_about: 'About',
    footer_contact: 'Contact',
    footer_terms: 'Terms',
    footer_privacy: 'Privacy',
    footer_warranty: 'Warranty',
    footer_rights: 'All rights reserved.',
    out_of_stock: 'Out of stock',
    only_left: 'Only',
    items_left: 'left',
    free_consultation: 'Free Consultation Available',
    dealer_nav_dashboard: 'Dashboard',
    dealer_nav_orders: 'Bulk Orders',
    dealer_nav_credit: 'Credit',
    dealer_nav_stats: 'Statistics',
    dealer_nav_export: 'Export',
    dealer_logged_as: 'Logged in as',
    dealer_discount_label: 'Dealer · 15% discount',
    dealer_back_store: '← Back to Store',
    distributor_panel: 'Distributor Panel',
    distributor_discount_label: 'Distributor · 10% discount',
    price_retail: 'Retail price',
    price_your: 'Your price',
    price_dealer: 'Dealer price',
    price_distributor: 'Distributor price',
    price_cost: 'Cost price',
    discount_badge_dealer: '−15% Dealer',
    discount_badge_distributor: '−10% Distributor',
    volume_discount: 'Volume discount',
    volume_discount_info: 'Special price for high-volume buyers',
    // Camera type filter bar
    cat_indoor: 'Indoor Camera',
    cat_outdoor: 'Outdoor Camera',
    cat_all_cameras: 'All Cameras',
    // Tools page
    tools_title: 'Technical Tools',
    tools_subtitle: 'DVR/NVR software, mobile apps and professional calculators',
    tools_tab_downloads: 'Software',
    tools_software_title: 'DVR/NVR Software & Mobile Apps',
    tools_software_subtitle: 'Monitor your camera system from PC or smartphone',
    tools_consult: 'Contact via WhatsApp',
    // Reports
    reports_title: 'Reports',
    reports_subtitle: 'PDF, CSV/Excel export — colorful camera price list',
    reports_monthly: 'Monthly Revenue',
    reports_products: 'Product Price List',
    reports_export_csv: 'Excel/CSV',
    reports_export_pdf: 'Colorful PDF',
    // Social
    social_whatsapp: 'WhatsApp',
    social_tiktok: 'TikTok',
    social_instagram: 'Instagram',
    // Admin nav
    admin_nav_reports: 'Reports',
    // Protected by Jozef
    protected_by: 'Protected by',
  },
  ru: {
    nav_products: 'Продукты',
    nav_hikvision: 'Hikvision',
    nav_tools: 'Инструменты',
    nav_blog: 'Блог',
    nav_contact: 'Контакты',
    nav_categories: 'Категории',
    sign_in: 'Войти',
    sign_out: 'Выйти',
    my_orders: 'Мои заказы',
    profile: 'Профиль',
    admin_panel: 'Панель админа',
    dealer_panel: 'Панель дилера',
    cart: 'Корзина',
    add_to_cart: 'В корзину',
    view_all: 'Смотреть все',
    whatsapp_order: 'Заказ через WhatsApp',
    official_distributor: 'Официальный Дистрибьютор',
    browse_category: 'По категориям',
    featured_products: 'Рекомендуемые товары',
    platform_features: 'Возможности платформы',
    custom_quote: 'Нужна индивидуальная смета?',
    custom_quote_desc: 'Наша техническая команда поможет вам разработать идеальную систему безопасности.',
    use_smart_tools: 'Умные инструменты',
    become_dealer: 'Стать дилером',
    dealer_title: 'Дилерская программа',
    dealer_desc: 'Получите статус дилера и эксклюзивные оптовые цены на все заказы.',
    dealer_benefit_1: 'Эксклюзивные оптовые цены',
    dealer_benefit_2: 'Кредитный лимит и отсрочка платежа',
    dealer_benefit_3: 'Персональная техническая поддержка',
    dealer_benefit_4: 'Импорт/экспорт Excel',
    dealer_apply: 'Подать заявку',
    stat_products: 'Продуктов',
    stat_projects: 'Проектов',
    stat_customers: 'Довольных клиентов',
    stat_warranty: 'Официальная гарантия',
    cat_ip: 'IP камеры',
    cat_analog: 'Аналоговые камеры',
    cat_dvr: 'DVR / NVR',
    cat_switches: 'PoE коммутаторы',
    cat_cables: 'Кабели и аксессуары',
    cat_access: 'Контроль доступа',
    cat_alarms: 'Охранная сигнализация',
    cat_ptz: 'PTZ камеры',
    footer_about: 'О нас',
    footer_contact: 'Контакты',
    footer_terms: 'Условия',
    footer_privacy: 'Конфиденциальность',
    footer_warranty: 'Гарантия',
    footer_rights: 'Все права защищены.',
    out_of_stock: 'Нет в наличии',
    only_left: 'Осталось',
    items_left: 'шт',
    free_consultation: 'Бесплатная консультация',
    dealer_nav_dashboard: 'Панель',
    dealer_nav_orders: 'Оптовые заказы',
    dealer_nav_credit: 'Кредит',
    dealer_nav_stats: 'Статистика',
    dealer_nav_export: 'Экспорт',
    dealer_logged_as: 'Вы вошли как',
    dealer_discount_label: 'Дилер · скидка 15%',
    dealer_back_store: '← В магазин',
    distributor_panel: 'Панель дистрибьютора',
    distributor_discount_label: 'Дистрибьютор · скидка 10%',
    price_retail: 'Розничная цена',
    price_your: 'Ваша цена',
    price_dealer: 'Цена дилера',
    price_distributor: 'Цена дистрибьютора',
    price_cost: 'Себестоимость',
    discount_badge_dealer: '−15% Дилер',
    discount_badge_distributor: '−10% Дистрибьютор',
    volume_discount: 'Оптовая скидка',
    volume_discount_info: 'Специальная цена для крупных покупателей',
    // Camera type filter bar
    cat_indoor: 'Внутренняя камера',
    cat_outdoor: 'Наружная камера',
    cat_all_cameras: 'Все камеры',
    // Tools page
    tools_title: 'Технические инструменты',
    tools_subtitle: 'ПО для DVR/NVR, мобильные приложения и профессиональные калькуляторы',
    tools_tab_downloads: 'Программы',
    tools_software_title: 'ПО DVR/NVR и мобильные приложения',
    tools_software_subtitle: 'Управляйте системой видеонаблюдения с ПК или смартфона',
    tools_consult: 'Связаться через WhatsApp',
    // Reports
    reports_title: 'Отчёты',
    reports_subtitle: 'Экспорт PDF, CSV/Excel — цветной прайс-лист камер',
    reports_monthly: 'Ежемесячный доход',
    reports_products: 'Прайс-лист товаров',
    reports_export_csv: 'Excel/CSV',
    reports_export_pdf: 'Цветной PDF',
    // Social
    social_whatsapp: 'WhatsApp',
    social_tiktok: 'TikTok',
    social_instagram: 'Instagram',
    // Admin nav
    admin_nav_reports: 'Отчёты',
    // Protected by Jozef
    protected_by: 'Protected by',
  },
};

// ─── Context ───────────────────────────────────────────────────────────────
interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'az',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return stored && ['az', 'en', 'ru'].includes(stored) ? stored : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[lang][key] ?? translations['en'][key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
