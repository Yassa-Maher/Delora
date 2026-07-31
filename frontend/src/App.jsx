import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './pages/admin/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Branches from './pages/Branches';

import DashboardHome from './pages/admin/DashboardHome';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';
import AdminBranches from './pages/admin/AdminBranches';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSocialLinks from './pages/admin/AdminSocialLinks';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
      <SettingsProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Navbar />
        <main className="flex-1 animate-fadein">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminGuard><AdminLayout><DashboardHome /></AdminLayout></AdminGuard>} />
            <Route path="/admin/products" element={<AdminGuard><AdminLayout><AdminProducts /></AdminLayout></AdminGuard>} />
            <Route path="/admin/categories" element={<AdminGuard><AdminLayout><AdminCategories /></AdminLayout></AdminGuard>} />
            <Route path="/admin/orders" element={<AdminGuard><AdminLayout><AdminOrders /></AdminLayout></AdminGuard>} />
            <Route path="/admin/coupons" element={<AdminGuard><AdminLayout><AdminCoupons /></AdminLayout></AdminGuard>} />
            <Route path="/admin/banners" element={<AdminGuard><AdminLayout><AdminBanners /></AdminLayout></AdminGuard>} />
            <Route path="/admin/branches" element={<AdminGuard><AdminLayout><AdminBranches /></AdminLayout></AdminGuard>} />
            <Route path="/admin/contacts" element={<AdminGuard><AdminLayout><AdminContacts /></AdminLayout></AdminGuard>} />
            <Route path="/admin/social-links" element={<AdminGuard><AdminLayout><AdminSocialLinks /></AdminLayout></AdminGuard>} />
            <Route path="/admin/payment-methods" element={<AdminGuard><AdminLayout><AdminPaymentMethods /></AdminLayout></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminLayout><AdminSettings /></AdminLayout></AdminGuard>} />
          </Routes>
        </main>
        <Footer />
      </div>
        </SettingsProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
