import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Search, Sun, Moon, Globe, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUnreadCount } from '../api/notifications';

const navItems = [
  { path: '/', key: 'nav.home', exact: true },
  { path: '/products', key: 'nav.products' },
  { path: '/branches', key: 'nav.branches' },
  { path: '/contact', key: 'nav.contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) { setNotifCount(0); return; }
    getUnreadCount().then((res) => setNotifCount(res.data.count || 0)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then((res) => setNotifCount(res.data.count || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isAdmin = user && (user.role === 'super_admin' || user.role === 'store_manager');

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isEn = lang === 'en';
  const displayedNavItems = isEn ? [...navItems].reverse() : navItems;

  return (
    <header className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
      scrolled ? 'shadow-sm' : ''
    } border-b border-gray-200 dark:border-gray-800`}>
      <div className="container mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[rgb(0,166,62)]/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
              <img src="/icon.svg" alt="" className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl md:text-2xl lg:text-[26px] font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[rgb(0,166,62)] transition-colors duration-300">{t('nav.brand')}</span>
              <span className="text-[11px] md:text-sm font-medium text-gray-400 dark:text-gray-500 -mt-0.5">{t('nav.brand_sub')}</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:hidden">
            <button onClick={toggleLanguage} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] transition-all">
              <Globe size={18} />
            </button>
            <Link to="/cart" className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] transition-all">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-sm">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>
            {user && (
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] transition-all">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
            {!user && (
              <Link to="/login" className="text-sm font-bold text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)]">{t('nav.login')}</Link>
            )}
          </div>
        </div>

        <div className="w-full sm:grow sm:max-w-xl sm:mx-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="w-full h-11 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-green-300 dark:focus:border-green-700 focus:ring-4 focus:ring-green-500/5 transition-all"
            />
            <button type="submit" className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] transition-colors ${isEn ? 'left-1' : 'right-1'}`}>
              <Search size={15} />
            </button>
          </form>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button onClick={toggleTheme} className="icon-btn" aria-label={t('nav.theme')}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button onClick={toggleLanguage} className="icon-btn flex items-center gap-1" aria-label={t('nav.language')}>
            <Globe size={17} />
            <span className="text-[11px] font-bold">{isEn ? 'AR' : 'EN'}</span>
          </button>

          <Link to="/cart" className="relative icon-btn">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-sm animate-bounce-in">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/notifications" className="relative icon-btn">
                <Bell size={20} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm">{notifCount > 9 ? '9+' : notifCount}</span>
                )}
              </Link>
              <Link to="/favorites" className="icon-btn hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                <Heart size={20} />
              </Link>
              <div className="relative group">
                <button className="icon-btn">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[rgb(0,166,62)] to-green-400 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
                    {user.photo_url || user.photo ? (
                      <img src={((user.photo_url || user.photo)).startsWith('http') ? (user.photo_url || user.photo) : `http://localhost:5000/uploads/${(user.photo_url || user.photo).replace(/^\/+/, '')}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || 'U')[0].toUpperCase()
                    )}
                  </div>
                </button>
                <div className={`absolute ${isEn ? 'right-0' : 'left-0'} top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 origin-top scale-95 group-hover:scale-100`}>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-colors">{t('nav.profile')}</Link>
                  <Link to="/addresses" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-colors">{t('nav.addresses')}</Link>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-colors">{t('nav.orders')}</Link>
                  {isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 text-sm transition-colors font-semibold">{t('nav.admin')}</Link>}
                  <hr className="border-gray-100 dark:border-gray-700 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"><LogOut size={15} /> {t('nav.logout')}</button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_3px_10px_rgba(0,166,80,0.2)]">{t('nav.login')}</Link>
          )}
        </div>
      </div>

      <div className={`hidden md:flex items-center justify-center gap-1 px-4 pb-2.5 ${scrolled ? 'hidden' : ''}`}>
        <nav className="flex items-center gap-1 px-2 py-1 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          {displayedNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? 'text-[rgb(0,166,62)] bg-green-50/80 dark:bg-green-900/30 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[rgb(0,166,62)] hover:bg-gray-50/80 dark:hover:bg-gray-800/80'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/admin')
                  ? 'text-white bg-[rgb(0,166,62)] shadow-sm shadow-[rgba(0,166,62,0.3)]'
                  : 'text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30'
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
        </nav>
      </div>

      <div className={`sm:hidden fixed inset-x-0 top-[72px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300 overflow-hidden z-40 ${
        menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 py-3 space-y-1">
          {displayedNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? 'text-[rgb(0,166,62)] bg-green-50 dark:bg-green-900/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[rgb(0,166,62)]'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive('/admin') ? 'text-white bg-[rgb(0,166,62)]' : 'text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30'
            }`}>{t('nav.admin')}</Link>
          )}
          <hr className="border-gray-100 dark:border-gray-800 my-2" />
          <button onClick={() => { toggleTheme(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all duration-200">
            {isDark ? <Sun size={16} /> : <Moon size={16} />} {t('nav.theme')}
          </button>
          <button onClick={() => { toggleLanguage(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all duration-200">
            <Globe size={16} /> {isEn ? t('nav.arabic') : 'English'}
          </button>
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary w-full text-center text-sm py-3 mt-2">{t('nav.login')}</Link>
          )}
          {user && (
            <>
              <hr className="border-gray-100 dark:border-gray-800 my-2" />
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.notifications')}</Link>
              <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.favorites')}</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.profile')}</Link>
              <Link to="/addresses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.addresses')}</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.orders')}</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-all duration-200"><LogOut size={16} /> {t('nav.logout')}</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
