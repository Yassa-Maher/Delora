import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, getBanners } from '../api/products';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t, lang } = useLanguage();
  const isArabic = lang === 'ar';
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    Promise.all([getBanners(), getCategories({ limit: 8 }), getProducts({ limit: 20, sort: 'newest' })])
      .then(([bRes, cRes, pRes]) => {
        setBanners(Array.isArray(bRes.data) ? bRes.data : bRes.data.banners || []);
        setCategories(Array.isArray(cRes.data) ? cRes.data : cRes.data.categories || []);
        setProducts(Array.isArray(pRes.data) ? pRes.data : pRes.data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const interval = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const onSaleProducts = useMemo(
    () => products.filter((p) => p.discount_price && parseFloat(p.discount_price) > 0 && parseFloat(p.discount_price) < parseFloat(p.price)).slice(0, 12),
    [products]
  );

  const randomizedProducts = useMemo(() => {
    const arr = [...products];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [products]);

  if (loading) return <Loader />;

  const getBannerImg = (b) => {
    if (!b.image_url) return null;
    return b.image_url.startsWith('http') ? b.image_url : `http://localhost:5000/uploads/${b.image_url}`;
  };

  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10" dir={isArabic ? 'rtl' : 'ltr'}>
      {banners.length > 0 && (
        <div className="relative w-full h-[430px] sm:h-[520px] md:h-[640px] rounded-2xl sm:rounded-[2rem] overflow-hidden group shadow-lg shadow-black/5 dark:shadow-black/40">
          {banners.map((b, i) => {
            const bannerImg = getBannerImg(b);
            return (
              <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${i === currentBanner ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {bannerImg ? (
                  <>
                    <img src={bannerImg} alt={b.title_ar || ''} className="w-full h-full object-cover scale-105" />
                    <div className="absolute inset-0 flex items-center">
                      <div className="max-w-7xl mx-auto px-4 w-full">
                        <div className="max-w-lg md:pr-12">
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white md:text-[#253D4E] mb-3 [text-shadow:0_2px_10px_rgba(0,0,0,0.85)] md:[text-shadow:0_2px_14px_rgba(255,255,255,0.95)]">{b.title_ar || b.title_en}</h2>
                          {b.subtitle_ar && (
                            <span className="inline-block bg-[#3BB77E] text-white text-sm px-4 py-1.5 rounded-full font-medium mb-4">{b.subtitle_ar}</span>
                          )}
                          {b.button_text_ar && (
                            <Link to={b.product_id ? `/products/${b.product_id}` : b.category_id ? `/products?category=${b.category_id}` : '/products'}
                              className="block w-fit mt-4 bg-[#00a650] hover:bg-[#008f45] text-white font-bold px-8 py-3 rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-[rgba(0,166,62,0.3)] hover:shadow-xl hover:shadow-[rgba(0,166,62,0.4)] hover:-translate-y-0.5">
                              {b.button_text_ar || t('home.banner_fallback_button')}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[rgb(0,166,62)] to-green-700 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <img src="/icon.svg" alt="" className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <h2 className="text-3xl sm:text-4xl font-bold mb-2">{b.title_ar || t('home.banner_fallback_title')}</h2>
                      {b.subtitle_ar && <p className="text-lg opacity-80 mb-6">{b.subtitle_ar}</p>}
                      {b.button_text_ar && (
                        <Link to="/products" className="inline-block bg-white text-[rgb(0,166,62)] font-bold px-8 py-3 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5">{b.button_text_ar}</Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={prevBanner} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-[#253D4E] hover:bg-[rgb(0,166,62)] hover:text-white transition-all duration-300 opacity-60 hover:opacity-100 active:scale-90 backdrop-blur-sm"><ChevronRight size={22} /></button>
          <button onClick={nextBanner} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-[#253D4E] hover:bg-[rgb(0,166,62)] hover:text-white transition-all duration-300 opacity-60 hover:opacity-100 active:scale-90 backdrop-blur-sm"><ChevronLeft size={22} /></button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentBanner(i)}
                className={`rounded-full transition-all duration-300 active:scale-90 ${
                  i === currentBanner ? 'w-8 h-2.5 bg-[rgb(0,166,62)] shadow-sm shadow-[rgba(0,166,62,0.4)]' : 'w-2.5 h-2.5 bg-white/70 hover:bg-white/90'
                }`} />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 pt-4 sm:pt-6">
        {categories.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('home.categories')}</h2>
              <Link to="/products" className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors">{t('home.view_all')} →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 sm:gap-3 stagger">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}
                  className="block relative w-full group duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none">
                  <div className="relative bg-gradient-to-br from-[#f3faf6] via-[#f9fdfb] to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-[#00a650]/15 dark:border-gray-700 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center h-full z-10 transition-all duration-500 shadow-[0_4px_14px_-4px_rgba(0,166,80,0.06)] group-hover:scale-[1.03] group-hover:shadow-[0_20px_40px_-12px_rgba(0,166,80,0.25)] group-hover:border-[#00a650]/50 overflow-hidden">
                    <div className="absolute -inset-10 opacity-40 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 pointer-events-none z-0"
                      style={{ background: 'radial-gradient(circle, rgba(0,166,80,0.12) 0%, rgba(0,166,80,0.02) 50%, transparent 100%)' }} />
                    <div className="relative mb-2 sm:mb-4 flex items-center justify-center w-11 h-11 sm:w-16 sm:h-16 bg-white dark:bg-gray-700 border border-[#00a650]/10 dark:border-gray-600 rounded-lg sm:rounded-2xl transition-all duration-500 shadow-sm group-hover:scale-110 z-10">
                      <img src={cat.image_url ? (cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000/uploads/${cat.image_url}`) : '/icon.svg'}
                        alt={cat.name_ar} className="w-full h-full object-contain p-1"
                        onError={(e) => { e.target.src = '/icon.svg'; e.target.style.opacity = '0.4'; e.target.style.padding = '8px'; }} />
                    </div>
                    <h3 className="font-extrabold text-[#1a382b] dark:text-gray-200 group-hover:text-[#00a650] text-[10px] sm:text-sm text-center mb-1 sm:mb-2 line-clamp-1 w-full transition-all duration-300 z-10">
                      {cat.name_ar || cat.name_en}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {onSaleProducts.length > 0 && (
          <section className="py-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Flame className="text-red-500" size={22} />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{isArabic ? 'عروض وخصومات' : 'Deals & Offers'}</h2>
              </div>
              <Link to="/products?sort=offers" className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors">{t('home.view_all')} →</Link>
            </div>
            <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
              <div className="flex gap-2 sm:gap-3" style={{ minWidth: 'min-content' }}>
                {onSaleProducts.map((product) => (
                  <div key={product.id} className="relative min-w-[140px] sm:min-w-[160px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{isArabic ? 'اقتراحات تهمك' : 'Recommended for You'}</h2>
          </div>
          {randomizedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-3 stagger">
              {randomizedProducts.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-red-500">{isArabic ? 'نأسف لعدم توافر المنتج' : 'Sorry, product not found'}</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
