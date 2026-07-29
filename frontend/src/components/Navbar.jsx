import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiSearch, FiSun, FiMoon, FiGlobe, FiBell } from 'react-icons/fi';
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
  const [searchOpen, setSearchOpen] = useState(false);
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
    setSearchOpen(false);
    setSearchQuery('');
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path, exact = false) => {
    const active = isActive(path, exact);
    return `relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? 'text-[rgb(0,166,62)] bg-green-50/80 dark:bg-green-900/30 shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:text-[rgb(0,166,62)] hover:bg-gray-50/80 dark:hover:bg-gray-800/80'
    }`;
  };

  const isEn = lang === 'en';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm'
          : 'bg-white dark:bg-gray-900'
      } border-b border-gray-100/80 dark:border-gray-800/80`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0 order-1"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[rgb(0,166,62)]/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
              <img src="/icon.svg" alt="" className="relative w-8 h-8 md:w-9 md:h-9 group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[rgb(0,166,62)] transition-colors duration-300">{t('nav.brand')}</span>
              <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 -mt-0.5">{t('nav.brand_sub')}</span>
            </div>
          </Link>

          <nav className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm ${isEn ? 'order-2' : 'order-2'}`}>
            {(isEn ? [...navItems].reverse() : navItems).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={navLinkClass(item.path, item.exact)}
              >
                {t(item.key)}
                {isActive(item.path, item.exact) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-[rgb(0,166,62)] rounded-full" />
                )}
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

          <div className="flex items-center gap-0.5 md:gap-1 order-3">
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90"
              aria-label={t('nav.theme')}
            >
              {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 md:p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90 flex items-center gap-1"
              aria-label={t('nav.language')}
            >
              <FiGlobe size={17} />
              <span className="text-[11px] font-bold hidden sm:inline">{isEn ? 'AR' : 'EN'}</span>
            </button>

            <div className="hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search')}
                    className={`w-32 lg:w-40 pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[rgba(0,166,62,0.25)] focus:border-[rgb(0,166,62)] outline-none bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 transition-all duration-200 ${
                      searchOpen ? 'w-48' : ''
                    }`}
                  />
                  <button
                    type="submit"
                    className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] transition-colors ${isEn ? 'left-1' : 'right-1'}`}
                  >
                    <FiSearch size={15} />
                  </button>
                </div>
              </form>
            </div>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <FiSearch size={20} />
            </button>

            <Link
              to="/cart"
              className="relative p-2 md:p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[rgb(0,166,62)] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm shadow-[rgba(0,166,62,0.3)] animate-bounce-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 md:p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90"
                >
                  <FiBell size={20} />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/favorites"
                  className="p-2 md:p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 active:scale-90"
                >
                  <FiHeart size={20} />
                </Link>
                <div className="relative group hidden sm:block">
                  <button className="flex items-center gap-1.5 p-2 md:p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
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
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"><FiLogOut size={15} /> {t('nav.logout')}</button>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="sm:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex btn-primary text-sm py-2 px-4">{t('nav.login')}</Link>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="sm:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-x-0 top-16 md:top-18 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300 overflow-hidden z-40 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => (
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
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/admin')
                  ? 'text-white bg-[rgb(0,166,62)]'
                  : 'text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30'
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
          <hr className="border-gray-100 dark:border-gray-800 my-2" />
          <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="mb-2">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('nav.search')} className={`w-full pl-${isEn ? '8' : '3'} pr-${isEn ? '3' : '8'} py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[rgba(0,166,62,0.25)] focus:border-[rgb(0,166,62)] outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100`} />
              <button type="submit" className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-gray-400 ${isEn ? 'left-1' : 'right-1'}`}><FiSearch size={16} /></button>
            </div>
          </form>
          <button onClick={() => { toggleTheme(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all duration-200">
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />} {t('nav.theme')}
          </button>
          <button onClick={() => { toggleLanguage(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all duration-200">
            <FiGlobe size={16} /> {isEn ? t('nav.arabic') : 'English'}
          </button>
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary w-full text-center text-sm py-3 mt-2">{t('nav.login')}</Link>
          )}
          {user && (
            <>
              <hr className="border-gray-100 dark:border-gray-800 my-2" />
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.notifications')}</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.profile')}</Link>
              <Link to="/addresses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.addresses')}</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] text-sm transition-all duration-200">{t('nav.orders')}</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-all duration-200"><FiLogOut size={16} /> {t('nav.logout')}</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
