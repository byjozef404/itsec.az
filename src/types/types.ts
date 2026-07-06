export type UserRole = 'customer' | 'dealer' | 'distributor' | 'admin';
export type DealerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type Language = 'en' | 'az' | 'ru';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  dealer_status: DealerStatus;
  credit_limit: number;
  credit_used: number;
  address: string | null;
  city: string | null;
  country: string;
  avatar_url: string | null;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_az: string | null;
  name_ru: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  name_az: string | null;
  name_ru: string | null;
  slug: string;
  sku: string | null;
  description: string | null;
  description_az: string | null;
  description_ru: string | null;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  dealer_price: number | null;
  distributor_price: number | null;
  cost_price: number | null;
  stock_qty: number;
  is_active: boolean;
  is_featured: boolean;
  thumbnail_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  specifications: Record<string, string>;
  tags: string[] | null;
  weight_kg: number | null;
  warranty_months: number;
  model_number: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  categories?: Category;
  brands?: Brand;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  title_az: string | null;
  title_ru: string | null;
  slug: string;
  content: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  is_dealer_order: boolean;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string;
  notes: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface QuoteRequest {
  id: string;
  user_id: string;
  status: string;
  message: string;
  quoted_amount: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  user_id: string;
  admin_id: string | null;
  subject: string;
  content: string;
  is_from_admin: boolean;
  is_read: boolean;
  parent_id: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface SiteSetting {
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
}

export interface CheckoutForm {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
}
