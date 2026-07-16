export type Role = 'superadmin' | 'admin' | 'subadmin' | 'customer';

export interface Profile {
  id: string;
  role: Role;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  short_description?: string;
  description?: string;
  material?: string;
  price: number;
  sale_price?: number;
  category_id?: string;
  brand_id?: string;
  collection_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Champs temporaires / legacy pour la compatibilité avec le frontend actuel
  imagePrimary?: string;
  imageHover?: string;
  sizes?: string[]; // Redéfini temporairement
  colors?: any[];   // Any temporaire pour éviter l'incompatibilité avec src/data/products.ts
  category?: any;   // Any temporaire pour compatibilité
  
  // Relations (quand on fetch avec Supabase)
  brand?: Brand;
  collection?: Collection;
}

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_hex?: string;
  created_at: string;

  // Relations
  images?: ProductImage[];
  sizes?: ProductSize[];
}

export interface ProductImage {
  id: string;
  product_color_id: string;
  image_url: string;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_color_id: string;
  size: string;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  title?: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  notes?: string;
  admin_notes?: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_id?: string;
  created_at: string;
  updated_at: string;

  // Relations
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_color_id?: string;
  product_size_id?: string;
  product_name: string;
  color_name?: string;
  size_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  order_id: string;
  transaction_id?: string;
  provider: string;
  payment_method: string;
  amount: number;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

export interface Settings {
  id: number;
  site_name: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  currency: string;
  tax_rate: number;
  shipping_fee: number;
  free_shipping_threshold?: number;
  updated_at: string;
}

// ------------------------------------------
// TYPES FRONT-END (Local State)
// ------------------------------------------

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export type FilterCategory = string | 'all';

export interface ProductFilters {
  category: FilterCategory;
  collections?: string[];
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  searchQuery: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
  created_at: string;
}

export interface Salary {
  id: string;
  employee_name: string;
  amount: number;
  month_year: string;
  status: 'paid' | 'unpaid';
  created_at: string;
}
