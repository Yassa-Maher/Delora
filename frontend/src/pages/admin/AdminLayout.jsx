import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Grid3X3, ShoppingBag, Percent, Image, MapPin, Mail, Settings, ExternalLink, Wallet, LogOut, Menu, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const linkDefs = [
  { to: '/admin', icon: LayoutDashboard, key: 'admin.dashboard', exact: true },
  { to: '/admin/products', icon: Package, key: 'admin.products' },
  { to: '/admin/categories', icon: Grid3X3, key: 'admin.categories' },
  { to: '/admin/orders', icon: ShoppingBag, key: 'admin.orders' },
  { to: '/admin/coupons', icon: Percent, key: 'admin.coupons' },
  { to: '/admin/banners', icon: Image, key: 'admin.banners' },
  { to: '/admin/branches', icon: MapPin, key: 'admin.branches' },
  { to: '/admin/contacts', icon: Mail, key: 'admin.contacts' },
  { to: '/admin/social-links', icon: ExternalLink, key: 'admin.social_links' },
  { to: '/admin/payment-methods', icon: Wallet, key: 'admin.payment_methods' },
  { to: '/admin/settings', icon: Settings, key: 'admin.settings' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, lang, toggleLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = linkDefs.map((l) => ({ ...l, label: t(l.key) }));

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden antialiased">
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity" />}

      <aside className={`fixed lg:static top-0 bottom-0 z-40 h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 ltr:border-r rtl:border-l border-gray-100 dark:border-gray-700 flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-64'}`}>
        <div className="w-full h-full flex flex-col">
          <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 shrink-0" />
          <div className="px-6 py-8 flex items-center justify-between shadow-sm">
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/icon.svg" alt="" className="w-7 h-7" />
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-[rgb(0,166,62)]">دل</span>
                <span className="text-gray-900 dark:text-white">ورة</span>
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition" aria-label="Close menu">
              <Menu size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 w-full text-right px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border-r-4 border-transparent ${
                  isActive(l.to, l.exact)
                    ? 'bg-[rgb(0,166,62)] text-white shadow-lg shadow-[rgba(0,166,62,0.3)] scale-[1.02] border-r-[rgb(0,166,62)]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-r-[rgb(0,166,62)]'
                }`}>
                <l.icon size={20} className="shrink-0" />
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-6 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2">
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 text-right px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              {isDark ? <Sun size={20} /> : <Moon size={20} />} {t('nav.theme')}
            </button>
            <button onClick={toggleLanguage} className="w-full flex items-center gap-3 text-right px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <Globe size={20} /> {lang === 'ar' ? 'English' : 'العربية'}
            </button>
            <Link to="/" className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              {t('nav.back_to_site')}
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 text-right px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200">
              <LogOut size={20} /> {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] transition-all duration-200 active:scale-95">
              <Menu size={22} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] transition-all duration-200" aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={toggleLanguage} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] transition-all duration-200" aria-label="Toggle language">
              <Globe size={18} />
              <span className="text-xs font-bold mr-1">{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{user?.role === 'super_admin' ? 'مدير عام' : user?.role === 'store_manager' ? 'مدير المتجر' : 'مستخدم'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[rgb(0,166,62)] flex items-center justify-center text-white font-bold text-sm">{(user?.name || 'U')[0]}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 animate-fadein">
          <div className="mx-auto max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
