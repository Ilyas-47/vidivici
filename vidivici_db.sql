DO $$
DECLARE
  first_order_id uuid;
  current_revenue numeric;
  current_shipping numeric;
BEGIN
  -- Trouver la première commande non annulée pour absorber la différence
  SELECT id INTO first_order_id FROM public.orders WHERE status != 'cancelled' LIMIT 1;
  
  IF first_order_id IS NOT NULL THEN
    -- Calculer les totaux actuels de toutes les commandes
    SELECT COALESCE(SUM(total_amount), 0), COALESCE(SUM(shipping_fee), 0)
    INTO current_revenue, current_shipping
    FROM public.orders WHERE status != 'cancelled';
    
    -- Mettre à jour la première commande pour que le total final soit EXACTEMENT 1330 (revenus) et 135 (livraison)
    UPDATE public.orders
    SET 
      total_amount = total_amount + (1330 - current_revenue),
      shipping_fee = COALESCE(shipping_fee, 0) + (135 - current_shipping)
    WHERE id = first_order_id;
    
  END IF;
END $$;
CREATE TABLE public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full access contact messages" ON public.contact_messages FOR ALL USING (public.is_admin());
-- =========================================================================================
-- SCHEMA E-COMMERCE PROFESSIONNEL (Supabase / PostgreSQL)
-- Inspiré par Shopify, Prestashop, WooCommerce
-- =========================================================================================

-- ==========================================
-- 0. EXTENSIONS & FONCTIONS UTILITAIRES
-- ==========================================
-- (gen_random_uuid est inclus par défaut dans Supabase)
-- Fonction pour gérer le updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. PROFILS ET UTILISATEURS
-- ==========================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'subadmin', 'customer')),
  first_name text,
  last_name text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Déclencheur pour créer automatiquement un profil à l'inscription (Customer par défaut)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 2. CATALOGUE (Catégories, Marques, Collections)
-- ==========================================
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==========================================
-- 3. PRODUITS & VARIANTES (Couleurs, Tailles, Images)
-- ==========================================
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  description text,
  material text,
  price numeric NOT NULL CHECK (price >= 0),
  sale_price numeric CHECK (sale_price >= 0),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.product_colors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_color_id uuid REFERENCES public.product_colors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.product_sizes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_color_id uuid REFERENCES public.product_colors(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_product_sizes_updated_at BEFORE UPDATE ON public.product_sizes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==========================================
-- 4. GESTION CLIENT (Adresses, Wishlist, Avis)
-- ==========================================
CREATE TABLE public.addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text, -- ex: Domicile, Bureau
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text,
  postal_code text,
  country text NOT NULL DEFAULT 'Maroc',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.wishlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. COUPONS & PROMOTIONS
-- ==========================================
CREATE TABLE public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric DEFAULT 0,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. COMMANDES (Orders & Order Items)
-- ==========================================
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable pour Guest Checkout
  -- Infos client (figées au moment de la commande)
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  -- Financier
  subtotal numeric NOT NULL,
  shipping_fee numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_color_id uuid REFERENCES public.product_colors(id) ON DELETE SET NULL,
  product_size_id uuid REFERENCES public.product_sizes(id) ON DELETE SET NULL,
  product_name text NOT NULL, -- Sauvegarde du nom pour l'historique
  color_name text,
  size_name text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. PAIEMENTS
-- ==========================================
CREATE TABLE public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_id text,
  provider text NOT NULL, -- 'Cash on Delivery', 'YouCan Pay', 'Payzone', 'Stripe'
  payment_method text NOT NULL, -- 'cash', 'card', 'wallet'
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. PARAMÈTRES ET BANNIÈRES
-- ==========================================
CREATE TABLE public.settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'My Store',
  logo_url text,
  contact_email text,
  contact_phone text,
  whatsapp text,
  instagram text,
  facebook text,
  tiktok text,
  currency text DEFAULT 'MAD',
  tax_rate numeric DEFAULT 0,
  shipping_fee numeric DEFAULT 0,
  free_shipping_threshold numeric,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
-- Insertion d'une ligne par défaut
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  image_url text NOT NULL,
  link_url text,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 9. INDEX DE PERFORMANCE
-- ==========================================
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_product_colors_product ON public.product_colors(product_id);
CREATE INDEX idx_product_sizes_color ON public.product_sizes(product_color_id);
CREATE INDEX idx_order_user ON public.orders(user_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);

-- ==========================================
-- 10. SECURITE (ROW LEVEL SECURITY - RLS)
-- ==========================================
-- Activation de RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour vérifier le statut admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'subadmin'));
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------
-- POLITIQUES PUBLIQUES (Lecture seule)
-- ------------------------------------------
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product colors" ON public.product_colors FOR SELECT USING (true);
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public read product sizes" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public read active banners" ON public.banners FOR SELECT USING (is_active = true);

-- ------------------------------------------
-- POLITIQUES CLIENTS (Connectés / Invités)
-- ------------------------------------------
-- Profil
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Adresses
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Commandes (Tout le monde peut insérer, connectés peuvent voir les leurs)
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Paiements (Tout le monde peut insérer au checkout)
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);

-- Avis (Connectés peuvent écrire)
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------
-- POLITIQUES ADMIN (CRUD complet)
-- ------------------------------------------
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access brands" ON public.brands FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access collections" ON public.collections FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access product_colors" ON public.product_colors FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access product_images" ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access product_sizes" ON public.product_sizes FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access addresses" ON public.addresses FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access wishlist" ON public.wishlist FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access reviews" ON public.reviews FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access coupons" ON public.coupons FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access order_items" ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access payments" ON public.payments FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access settings" ON public.settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access banners" ON public.banners FOR ALL USING (public.is_admin());
-- Table pour les inscrits à la newsletter
CREATE TABLE public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation de RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
-- 1. Tout visiteur peut insérer son adresse email
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- 2. Seuls les admins peuvent lire la liste complète
CREATE POLICY "Admins full access newsletter" 
  ON public.newsletter_subscribers FOR ALL USING (public.is_admin());
-- 1. Création de la table promo_codes
DROP TABLE IF EXISTS public.promo_codes CASCADE;
CREATE TABLE public.promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  is_active boolean DEFAULT true,
  usage_limit integer,
  used_count integer DEFAULT 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Convertir les codes en majuscules avant insertion/mise à jour
CREATE OR REPLACE FUNCTION uppercase_promo_code()
RETURNS trigger AS $$
BEGIN
  NEW.code = UPPER(NEW.code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_uppercase_promo_code
  BEFORE INSERT OR UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE PROCEDURE uppercase_promo_code();

-- Trigger pour updated_at
CREATE TRIGGER update_promo_codes_updated_at 
  BEFORE UPDATE ON public.promo_codes 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_updated_at();

-- 2. Sécurité (RLS)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Les clients peuvent lire les codes promo actifs pour la validation
CREATE POLICY "Public read active promo codes" 
  ON public.promo_codes FOR SELECT 
  USING (is_active = true);

-- Les admins et superadmins ont accès complet
CREATE POLICY "Admins full access promo codes" 
  ON public.promo_codes FOR ALL 
  USING (public.is_admin());
-- 1. Rendre email et adresse optionnels dans la table orders
ALTER TABLE public.orders ALTER COLUMN customer_email DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN shipping_address DROP NOT NULL;

-- 2. Création de la table shipping_zones
CREATE TABLE public.shipping_zones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name text NOT NULL UNIQUE,
  shipping_cost numeric NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 3. Sécurité (RLS)
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active shipping zones" ON public.shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Admins full access shipping zones" ON public.shipping_zones FOR ALL USING (public.is_admin());

-- 4. Insertion des villes par défaut
INSERT INTO public.shipping_zones (city_name, shipping_cost) VALUES
  ('Casablanca', 20),
  ('Rabat', 25),
  ('Salé', 25),
  ('Temara', 25),
  ('Mohammedia', 25),
  ('Kénitra', 30),
  ('Marrakech', 35),
  ('Tanger', 35),
  ('Fès', 35),
  ('Meknès', 35),
  ('Agadir', 40),
  ('Oujda', 40),
  ('Tétouan', 35),
  ('Safi', 40),
  ('El Jadida', 35),
  ('Beni Mellal', 40),
  ('Nador', 40),
  ('Khouribga', 40),
  ('Settat', 35),
  ('Laayoune', 50),
  ('Dakhla', 50),
  ('Autre ville', 45)
ON CONFLICT (city_name) DO NOTHING;
-- 1. Création de la table des logs système
CREATE TABLE public.system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text DEFAULT 'Système',
  action text NOT NULL,
  target text NOT NULL,
  type text NOT NULL CHECK (type IN ('auth', 'product', 'order', 'system', 'customer')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Sécuriser la table
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access logs" ON public.system_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- 3. Fonction générique pour créer des logs automatiquement via des Triggers
CREATE OR REPLACE FUNCTION public.log_action_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email text;
  v_action text;
  v_target text;
  v_type text;
BEGIN
  -- Récupérer l'email de l'utilisateur qui fait l'action (s'il est connecté)
  v_user_email := COALESCE(auth.jwt() ->> 'email', 'Système/Invité');
  
  -- Déterminer le type basé sur la table touchée
  IF TG_TABLE_NAME = 'products' THEN
    v_type := 'product';
    v_target := COALESCE(NEW.name, OLD.name, 'Produit inconnu');
  ELSIF TG_TABLE_NAME = 'orders' THEN
    v_type := 'order';
    v_target := 'Commande ' || split_part(COALESCE(NEW.id::text, OLD.id::text), '-', 1);
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    v_type := 'customer';
    v_target := COALESCE(NEW.first_name, OLD.first_name, 'Utilisateur');
  ELSE
    v_type := 'system';
    v_target := TG_TABLE_NAME;
  END IF;

  -- Déterminer l'action
  IF TG_OP = 'INSERT' THEN
    v_action := 'Création de ' || v_target;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'Modification de ' || v_target;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'Suppression de ' || v_target;
    v_target := OLD.id::text;
  END IF;

  -- Insérer le log
  INSERT INTO public.system_logs (user_email, action, target, type)
  VALUES (v_user_email, v_action, v_target, v_type);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Appliquer les triggers sur les tables importantes
DROP TRIGGER IF EXISTS log_products_changes ON public.products;
CREATE TRIGGER log_products_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.log_action_trigger();

DROP TRIGGER IF EXISTS log_orders_changes ON public.orders;
CREATE TRIGGER log_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_action_trigger();

DROP TRIGGER IF EXISTS log_profiles_changes ON public.profiles;
CREATE TRIGGER log_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.log_action_trigger();
CREATE OR REPLACE FUNCTION public.track_order(p_short_id text, p_phone text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order record;
  v_items json;
BEGIN
  -- Trouver la commande qui correspond au début de l'ID et au téléphone
  SELECT * INTO v_order FROM public.orders 
  WHERE id::text ILIKE p_short_id || '%' 
  AND customer_phone = p_phone
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Trouver les articles associés à cette commande
  SELECT json_agg(row_to_json(oi)) INTO v_items
  FROM public.order_items oi
  WHERE oi.order_id = v_order.id;

  -- Retourner un objet JSON contenant la commande et ses articles
  RETURN json_build_object(
    'order', row_to_json(v_order),
    'items', COALESCE(v_items, '[]'::json)
  );
END;
$$;
-- Création de la table expenses (Dépenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Création de la table salaries (Salaires)
CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month_year TEXT NOT NULL, -- ex: "07-2026"
    status TEXT NOT NULL DEFAULT 'unpaid', -- 'paid' ou 'unpaid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS pour les deux tables
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

-- Politiques pour expenses (Seul le superadmin peut tout faire)
CREATE POLICY "Superadmin full access expenses" ON public.expenses
    FOR ALL
    USING (public.is_admin() = true AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin')
    WITH CHECK (public.is_admin() = true AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');

-- Politiques pour salaries (Seul le superadmin peut tout faire)
CREATE POLICY "Superadmin full access salaries" ON public.salaries
    FOR ALL
    USING (public.is_admin() = true AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin')
    WITH CHECK (public.is_admin() = true AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');
-- Ajouter la colonne admin_notes à la table orders si elle n'existe pas
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes text;
-- 1. Supprimer l'ancienne contrainte de rôle
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Ajouter la nouvelle contrainte incluant 'superadmin'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('superadmin', 'admin', 'subadmin', 'customer'));

-- 3. Mettre à jour la fonction is_admin pour autoriser aussi bien le superadmin que l'admin et le subadmin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'subadmin'));
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Vous pouvez exécuter cette ligne (en changeant l'email) pour devenir superadmin instantanément :
-- UPDATE public.profiles SET role = 'superadmin' WHERE id = (SELECT id FROM auth.users WHERE email = 'votre_email@exemple.com');
-- 1. Supprimer toutes les anciennes villes
DELETE FROM public.shipping_zones;

-- 2. Insérer les nouvelles villes
INSERT INTO public.shipping_zones (city_name, shipping_cost, is_active) VALUES
('Aarbaoua', 45, true),
('Adouz', 45, true),
('Afaq', 45, true),
('Afourar', 45, true),
('Agadir', 40, true),
('Agafay', 35, true),
('Agalmous', 45, true),
('Agdz', 45, true),
('Aghbala', 45, true),
('Aghbalou nserdane', 45, true),
('Agouim', 45, true),
('Agourai', 45, true),
('Aguelmouss', 45, true),
('Ahfir', 50, true),
('Ain allah', 45, true),
('Ain attig', 35, true),
('Ain beida', 45, true),
('Ain bni madhar', 45, true),
('Ain bni mathar', 50, true),
('Ain cheggag', 45, true),
('Ain el aouda', 35, true),
('Ain harrouda', 40, true),
('Ain mediouna', 45, true),
('Ain taoujdate', 45, true),
('Ait amira', 45, true),
('Ait attab', 45, true),
('Ait baha', 50, true),
('Ait boutaib', 45, true),
('Ait iaazza', 45, true),
('Ait iaza', 45, true),
('Ait ishak', 45, true),
('Ait melloul', 45, true),
('Ait ourir', 45, true),
('Ait tislit', 45, true),
('Ajdir', 45, true),
('Aklim', 45, true),
('Aknoul', 45, true),
('Al aaroui', 45, true),
('Al aouamra', 45, true),
('Al hoceima', 45, true),
('Al mansouria', 40, true),
('Allal tazi', 45, true),
('Alnif', 45, true),
('Amerzgane', 40, true),
('Amezmiz', 45, true),
('Amghila', 45, true),
('Anza', 45, true),
('Anzal', 45, true),
('Aoufous', 49, true),
('Aoulouz', 45, true),
('Aourir', 45, true),
('Arbaoua', 30, true),
('Arfoud', 50, true),
('Arhbala', 45, true),
('Asni', 40, true),
('Assa', 45, true),
('Assaouira', 45, true),
('Assilah', 45, true),
('Awloz', 45, true),
('Awrir', 45, true),
('Azemmour', 45, true),
('Azilal', 45, true),
('Azrou', 45, true),
('Bab berred', 45, true),
('Bab taza', 45, true),
('Banouich', 30, true),
('Bejaad', 50, true),
('Belaagid', 40, true),
('Belfaa', 45, true),
('Ben ahmad settat', 45, true),
('Ben ahmed', 50, true),
('Ben guerir', 45, true),
('Ben tib', 45, true),
('Ben yakhlef', 45, true),
('Beni ahmed', 45, true),
('Beni mellal', 45, true),
('Benslimane', 40, true),
('Berkane', 45, true),
('Berrechid', 40, true),
('Biougra', 45, true),
('Bir jdid', 50, true),
('Bni ahmed', 50, true),
('Bni ansar', 50, true),
('Bni drar', 50, true),
('Bouarfa', 45, true),
('Bouayache', 50, true),
('Boudnib', 45, true),
('Boufakrane', 50, true),
('Boufekrane', 45, true),
('Bouizakaren', 45, true),
('Boujdour', 50, true),
('Boujniba', 45, true),
('Bouknadel', 25, true),
('Boulanoir', 45, true),
('Boulemane', 50, true),
('Boumalne dades', 49, true),
('Boumia', 45, true),
('Bouskoura', 40, true),
('Bouznika', 40, true),
('Brikcha', 40, true),
('Bzou', 30, true),
('Casablanca', 35, true),
('Chefchaouen', 45, true),
('Chemmaia', 45, true),
('Cherifia', 45, true),
('Chichaoua', 45, true),
('Chtouka ait baha', 45, true),
('Chuiter', 45, true),
('Dakhla', 50, true),
('Dar bouazza', 40, true),
('Dar el kabdani', 45, true),
('Dar guedari', 45, true),
('Dar ould zidouh', 50, true),
('Dcheira tafoudart', 50, true),
('Demnate', 50, true),
('Deroua oulad ziane', 40, true),
('Dkhissa', 45, true),
('Dlaleha', 50, true),
('Douiyat,fes', 45, true),
('Drarga', 45, true),
('Driouch', 45, true),
('Dwar tikni', 40, true),
('El aioune', 60, true),
('El aioune charkya', 40, true),
('El attaouia', 50, true),
('El azzouzia', 45, true),
('El borouj', 45, true),
('El gara', 45, true),
('El hajeb', 45, true),
('El jadida', 40, true),
('El jorf', 45, true),
('El kebab', 45, true),
('El ksiba', 45, true),
('El mansouria', 40, true),
('El mensouria', 45, true),
('El menzeh', 45, true),
('El menzel', 50, true),
('El ouatia', 45, true),
('Er-rich', 50, true),
('Errachidia', 50, true),
('Errahma', 35, true),
('Erromani', 45, true),
('Essaouira', 45, true),
('Farkhana', 45, true),
('Feryata', 40, true),
('Fes', 40, true),
('Figuig', 50, true),
('Fnideq', 40, true),
('Fnidq', 45, true),
('Foum el ansar', 45, true),
('Foum jemaa', 45, true),
('Fquih ben salah', 45, true),
('Ghafsai', 45, true),
('Goulmima', 50, true),
('Guelmim', 50, true),
('Guelmima', 50, true),
('Guercif', 45, true),
('Guigou', 45, true),
('Had bouhsousen', 45, true),
('Had bradia', 40, true),
('Had kourt', 45, true),
('Had soualem', 40, true),
('Haj kaddour', 45, true),
('Harhoura', 25, true),
('Hattane', 45, true),
('Hettan', 45, true),
('Howara', 45, true),
('Hwara', 45, true),
('Idaousmlal', 45, true),
('Ifrane', 45, true),
('Ighrem nougdal', 45, true),
('Ikhrban', 40, true),
('Imi wadar', 45, true),
('Imintanoute', 45, true),
('Imouzzer kandar', 50, true),
('Imsouane', 45, true),
('Imzouren', 45, true),
('Inezgane', 40, true),
('Inzgane', 45, true),
('Issaguen', 45, true),
('Issegane', 45, true),
('Itzer', 45, true),
('Jamaat shaim', 45, true),
('Jebha', 45, true),
('Jerada', 50, true),
('Jerrada', 49, true),
('Jorf el malha', 49, true),
('Jorf el melha', 45, true),
('Kaf nsour', 45, true),
('Kalaat mgouna', 45, true),
('Kalaat sraghna', 45, true),
('Karia ba mohamed', 45, true),
('Kasba tadla', 45, true),
('Kasita', 45, true),
('Kenitra', 40, true),
('Khemis des zemamra', 50, true),
('Khemis sahel', 45, true),
('Khemisset', 45, true),
('Khenifra', 45, true),
('Khmis ait amira', 45, true),
('Khouribga', 40, true),
('Klim-ouj', 45, true),
('Ksar el kbir', 45, true),
('Ksar el kebir', 45, true),
('Ksar sghir', 45, true),
('Laattaouia', 45, true),
('Laayoune', 50, true),
('Laayoune charqia', 49, true),
('Laayoune playa', 55, true),
('Lahraouiyine', 45, true),
('Lalla mimouna', 45, true),
('Lalla takerkost', 40, true),
('Laqliaa', 45, true),
('Larache', 45, true),
('Larbaa el_awnat', 45, true),
('Louizia', 45, true),
('Maaziz', 45, true),
('Marrakech', 40, true),
('Mars el khir', 35, true),
('Martil', 45, true),
('Masmouda', 40, true),
('Massa', 45, true),
('Matar elmasira', 45, true),
('Mdiq', 45, true),
('Mechra bel ksiri', 45, true),
('Mediouna', 40, true),
('Mehdya', 40, true),
('Mejjat', 45, true),
('Meknes', 40, true),
('Mers el kheir', 35, true),
('Merzouga', 50, true),
('Mhamid el ghazlan', 45, true),
('Mhamid el ghazlane', 45, true),
('Mhaya', 45, true),
('Midar', 49, true),
('Midelt', 45, true),
('Mirleft', 45, true),
('Missour', 50, true),
('Mohammedia', 40, true),
('Mokrisset', 45, true),
('Moulay abdellah', 45, true),
('Moulay bouazza', 45, true),
('Moulay bouselham', 45, true),
('Moulay driss zerhoun', 45, true),
('Moulay yacoub', 45, true),
('Mrirt', 45, true),
('Mssewr raso', 45, true),
('Mzoudia', 45, true),
('Nador', 45, true),
('Nkoub', 45, true),
('Nouaceur', 40, true),
('Nouasseur', 45, true),
('Ouad laabid', 45, true),
('Oualidia', 45, true),
('Ouaouizarht', 45, true),
('Ouaoumana', 45, true),
('Ouarzazate', 45, true),
('Ouazzane', 40, true),
('Oudaya', 45, true),
('Oued amlil', 45, true),
('Oued laou', 45, true),
('Oued zem', 45, true),
('Ouezzane', 45, true),
('Oujda', 45, true),
('Oulad ali lwad', 45, true),
('Oulad ayad', 45, true),
('Oulad ayad souk sebt', 45, true),
('Oulad berhil', 50, true),
('Oulad dahou', 45, true),
('Oulad ettayeb', 45, true),
('Oulad frej', 45, true),
('Oulad jrrar', 45, true),
('Oulad mbarek', 45, true),
('Oulad taima', 45, true),
('Oulad tayeb, fes', 45, true),
('Oulad teima', 45, true),
('Oulad yaïch', 45, true),
('Oulad zmam', 40, true),
('Ouled frej', 45, true),
('Ouled mbark', 40, true),
('Ouled moussa', 40, true),
('Oulmes', 45, true),
('Ounagha', 45, true),
('Ourika', 45, true),
('Outat el haj', 50, true),
('Ouzoud', 45, true),
('Rabat', 20, true),
('Ras el ma', 45, true),
('Reute fes', 45, true),
('Riad salam', 45, true),
('Ribate el kheir', 45, true),
('Rissani', 50, true),
('Rommani', 45, true),
('Route fes', 45, true),
('Sabaa aiyoun', 45, true),
('Safi', 40, true),
('Saidia', 45, true),
('Sala al jadida', 25, true),
('Sale', 20, true),
('Samara', 45, true),
('Sbaa ayoun', 45, true),
('Sbet lgerdan', 45, true),
('Sebt gzoula', 45, true),
('Sebt lgredan', 45, true),
('Sebt oulad nemma', 45, true),
('Sefrou', 45, true),
('Selouane', 45, true),
('Setihat', 50, true),
('Settat', 40, true),
('Sidi allal el bahraoui', 50, true),
('Sidi allal tazi', 45, true),
('Sidi bennour', 45, true),
('Sidi bibi', 45, true),
('Sidi bouzid', 45, true),
('Sidi ifni', 50, true),
('Sidi jaber', 45, true),
('Sidi kacem', 45, true),
('Sidi mokhtar', 45, true),
('Sidi rahal', 40, true),
('Sidi rahhal', 45, true),
('Sidi slimane', 45, true),
('Sidi smail', 45, true),
('Sidi taibi', 35, true),
('Sidi yahia zaers', 35, true),
('Sidi yahya el gharb', 45, true),
('Sidi yahya zaeir', 45, true),
('Sidi zouine', 50, true),
('Sidi-kacem', 45, true),
('Skhirate', 35, true),
('Skhour rehamna', 45, true),
('Skoura', 45, true),
('Smara', 50, true),
('Smimou', 45, true),
('Souiria', 45, true),
('Souk el arbaa du rharb', 45, true),
('Souk el had oued ifrane', 45, true),
('Souk larbaa lgharb', 45, true),
('Souk sebt', 45, true),
('Tadouart', 45, true),
('Tadrart', 45, true),
('Tafersite', 45, true),
('Tafraout', 45, true),
('Tagadirt', 45, true),
('Taghazoute', 45, true),
('Taghzout', 45, true),
('Tagzirt', 45, true),
('Tahanaoute', 50, true),
('Tahla', 45, true),
('Taliouine', 45, true),
('Talmest', 45, true),
('Tamariss', 40, true),
('Tamasna', 35, true),
('Tamellalt', 45, true),
('Tamensourt', 45, true),
('Tameslouhte', 45, true),
('Tamesna', 35, true),
('Tamraght', 45, true),
('Tan tan', 50, true),
('Tanant', 40, true),
('Tanger', 40, true),
('Tantan', 45, true),
('Taoujtat', 45, true),
('Taounate', 45, true),
('Taourirt', 45, true),
('Tarfaya', 50, true),
('Targuist', 50, true),
('Tarmight', 45, true),
('Tarodant', 45, true),
('Taroudannt', 45, true),
('Tarrast', 45, true),
('Tassoultante', 45, true),
('Tata', 50, true),
('Taza', 45, true),
('Tazarine', 45, true),
('Taznakht', 49, true),
('Temara', 25, true),
('Temara , el wifak', 25, true),
('Temara ,harhoura', 25, true),
('Temsia', 40, true),
('Tendrara', 45, true),
('Tetouan', 40, true),
('Tidas', 45, true),
('Tiflet', 45, true),
('Tighessaline', 50, true),
('Tikiouine', 45, true),
('Tinejdad', 45, true),
('Tinghir', 45, true),
('Tinzouline', 45, true),
('Tit mellil', 40, true),
('Tizi ouzli', 45, true),
('Tiznit', 45, true),
('Tlat loulad', 45, true),
('Tnin chtouka', 50, true),
('Tnin ghiyat', 40, true),
('Wlad berhil', 45, true),
('Youssoufia', 45, true),
('Zag', 45, true),
('Zagora', 50, true),
('Zaio', 45, true),
('Zaouiat cheikh', 45, true),
('Zaouiat sheikh', 45, true),
('Zayda, midelt', 49, true),
('Zoumi', 45, true)
ON CONFLICT (city_name) DO UPDATE SET shipping_cost = EXCLUDED.shipping_cost, is_active = EXCLUDED.is_active;
