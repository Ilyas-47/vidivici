import { Routes, Route, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/hooks/useCart';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { ShippingPage } from '@/pages/ShippingPage';
import { ReturnsPage } from '@/pages/ReturnsPage';
import { ContactPage } from '@/pages/ContactPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { AccountPage } from '@/pages/account/AccountPage';

// Admin imports
import { LoginPage } from '@/pages/admin/LoginPage';
import { AdminLayout } from '@/layouts/admin/AdminLayout';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { DeliveriesPage } from '@/pages/admin/DeliveriesPage';
import { ExpensesPage } from '@/pages/admin/ExpensesPage';
import { SalariesPage } from '@/pages/admin/SalariesPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { BrandsPage } from '@/pages/admin/BrandsPage';
import { CollectionsPage } from '@/pages/admin/CollectionsPage';
import { ProductsPage } from '@/pages/admin/ProductsPage';
import { OrdersPage } from '@/pages/admin/OrdersPage';
import { CustomersPage } from '@/pages/admin/CustomersPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';
import { NewsletterPage } from '@/pages/admin/NewsletterPage';
import { ShippingZonesPage } from '@/pages/admin/ShippingZonesPage';
import { ReviewsPage } from '@/pages/admin/ReviewsPage';
import { LogsPage } from '@/pages/admin/LogsPage';
import { ContactMessagesPage } from '@/pages/admin/ContactMessagesPage';
import { PromoCodesPage } from '@/pages/admin/PromoCodesPage';

const PublicLayout = () => (
  <>
    <Header />
    <CartDrawer />
    <Outlet />
    <Footer />
  </>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'subadmin']} />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="deliveries" element={<DeliveriesPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="salaries" element={<SalariesPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="brands" element={<BrandsPage />} />
                  <Route path="collections" element={<CollectionsPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="newsletter" element={<NewsletterPage />} />
                  <Route path="shipping" element={<ShippingZonesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="logs" element={<LogsPage />} />
                  <Route path="contact-messages" element={<ContactMessagesPage />} />
                  <Route path="promo-codes" element={<PromoCodesPage />} />
                  {/* Other admin routes will go here */}
                </Route>
              </Route>

              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>
            </Routes>
          </ErrorBoundary>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
