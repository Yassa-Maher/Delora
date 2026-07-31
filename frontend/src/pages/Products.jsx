import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { Search, SlidersHorizontal, LayoutGrid, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Products() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const fetchProducts = useCallback(async (cat, srch, srt) => {
    setLoading(true);
    const params = { limit: 20 };
    if (srch) params.search = srch;
    if (cat) params.category = cat;
    if (srt) params.sort = srt;
    const page = searchParams.get('page') || 1;
    params.page = page;
    try {
      const res = await getProducts(params);
      const data = res.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
      if (data.pagination) setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [searchParams]);

  useEffect(() => {
    getCategories().then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory, search, sort);
  }, [fetchProducts, selectedCategory, search, sort]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ ...(catId && { category: catId }), ...(search && { search }), page: '1' });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10 animate-fadein" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className={`w-full lg:w-56 shrink-0 ${showFilter ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><SlidersHorizontal size={16} /> {t('products.filter')}</h3>
                <button onClick={() => setShowFilter(false)} className="lg:hidden text-gray-400 text-sm">{t('products.hide')}</button>
              </div>
              <div className="relative mb-4">
                <input type="text" className="w-full h-10 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-xl outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-green-200 focus:ring-4 focus:ring-green-500/5"
                  value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('products.search')} />
                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-2.5' : 'left-2.5'} text-gray-400`} size={15} />
              </div>
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t('products.categories')}</h4>
                <div className="space-y-1">
                  <button onClick={() => handleCategoryClick('')}
                    className={`block w-full text-sm px-3 py-1.5 rounded-xl transition-colors text-right ${
                      !selectedCategory ? 'bg-green-50 dark:bg-green-900/30 text-[rgb(0,166,62)] font-semibold border border-green-100/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>{t('products.all')}</button>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => handleCategoryClick(String(cat.id))}
                      className={`block w-full text-sm px-3 py-1.5 rounded-xl transition-colors text-right ${
                        selectedCategory === String(cat.id) ? 'bg-green-50 dark:bg-green-900/30 text-[rgb(0,166,62)] font-semibold border border-green-100/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>{cat.name_ar || cat.name_en}</button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 flex items-center gap-1"><ArrowUpDown size={12} /> {t('products.sort')}</h4>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
                  value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">{t('products.newest')}</option>
                  <option value="price_asc">{t('products.price_low')}</option>
                  <option value="price_desc">{t('products.price_high')}</option>
                  <option value="name_asc">{t('products.name_az')}</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-3">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('products.title')}</h1>
                {pagination && <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">{pagination.total || products.length} {t('products.count')}</span>}
              </div>
              <button onClick={() => setShowFilter(true)} className="lg:hidden flex items-center gap-1 text-sm text-[rgb(0,166,62)] font-semibold"><SlidersHorizontal size={15} /> {t('products.filter_button')}</button>
            </div>

            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
                <LayoutGrid size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-400 dark:text-gray-500 text-lg">{t('products.empty')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setSearchParams({ page: p, ...(search && { search }), ...(selectedCategory && { category: selectedCategory }) })}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${(searchParams.get('page') || '1') === String(p) ? 'bg-[rgb(0,166,62)] text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-[rgb(0,166,62)]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
