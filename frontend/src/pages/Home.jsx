import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, getBanners } from '../api/products';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    Promise.all([getBanners(), getCategories({ limit: 8 }), getProducts({ limit: 8, sort: 'newest' })])
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

  if (loading) return <Loader />;

  const getBannerImg = (b) => {
    if (!b.image_url) return null;
    return b.image_url.startsWith('http') ? b.image_url : `http://localhost:5000/uploads/${b.image_url}`;
  };

  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      {banners.length > 0 && (
        <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[520px] overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          {banners.map((b, i) => {
            const bannerImg = getBannerImg(b);
            return (
              <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${i === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
                {bannerImg ? (
                  <>
                    <img src={bannerImg} alt={b.title_ar || ''} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-r md:from-white/90 md:via-white/40 md:to-transparent flex items-center">
                      <div className="max-w-7xl mx-auto px-4 w-full">
                        <div className="max-w-lg md:pr-12">
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white md:text-[#253D4E] mb-3">{b.title_ar}</h2>
                          {b.subtitle_ar && (
                            <span className="inline-block bg-[#3BB77E] text-white text-sm px-4 py-1.5 rounded-full font-medium mb-4">{b.subtitle_ar}</span>
                          )}
                        </div>
                      </div>
                      {b.button_text_ar && (
                        <Link
                          to={b.product_id ? `/products/${b.product_id}` : b.category_id ? `/products?category=${b.category_id}` : '/products'}
                          className="absolute bottom-6 right-6 bg-[#00a650] hover:bg-[#008f45] text-white font-bold px-8 py-3 rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-[rgba(0,166,62,0.3)] hover:shadow-xl hover:shadow-[rgba(0,166,62,0.4)] hover:-translate-y-0.5"
                        >
                          {b.button_text_ar || t('home.banner_fallback_button')}
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[rgb(0,166,62)] to-green-700 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <img src="/icon.svg" alt="" className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <h2 className="text-3xl sm:text-4xl font-bold mb-2">{b.title_ar || t('home.banner_fallback_title')}</h2>
                      {b.subtitle_ar && <p className="text-lg opacity-80 mb-6">{b.subtitle_ar}</p>}
                      {b.button_text_ar && (
                        <Link to="/products" className="inline-block bg-white text-[rgb(0,166,62)] font-bold px-8 py-3 rounded-full transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                          {b.button_text_ar}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={prevBanner} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-[#253D4E] hover:bg-[rgb(0,166,62)] hover:text-white transition-all duration-300 opacity-60 hover:opacity-100 active:scale-90 backdrop-blur-sm"><FiChevronRight size={22} /></button>
          <button onClick={nextBanner} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-[#253D4E] hover:bg-[rgb(0,166,62)] hover:text-white transition-all duration-300 opacity-60 hover:opacity-100 active:scale-90 backdrop-blur-sm"><FiChevronLeft size={22} /></button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`rounded-full transition-all duration-300 active:scale-90 ${
                  i === currentBanner
                    ? 'w-8 h-2.5 bg-[rgb(0,166,62)] shadow-sm shadow-[rgba(0,166,62,0.4)]'
                    : 'w-2.5 h-2.5 bg-white/70 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 -mt-8 relative z-10">
        <section className="mb-8 animate-fadein-up">
          {banners.length === 0 && (
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('home.categories')}</h2>
              <Link to="/products" className="text-sm text-[#00a650] hover:text-[#008f45] font-semibold">{t('home.view_all')}</Link>
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 sm:gap-3 stagger">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="card-hover p-3 sm:p-4 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={cat.image_url ? (cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000/uploads/${cat.image_url}`) : '/icon.svg'}
                    alt={cat.name_ar}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/icon.svg'; e.target.style.opacity = '0.4'; e.target.style.padding = '8px'; }}
                  />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm truncate">{cat.name_ar || cat.name_en}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="animate-fadein-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('home.latest_products')}</h2>
            <Link to="/products" className="text-sm text-[#00a650] hover:text-[#008f45] font-semibold">{t('home.view_all')}</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 stagger">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
