import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Products() {
  const { t } = useLanguage();
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className={`md:w-56 shrink-0 ${showFilter ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">{t('products.filter')}</h3>
                <button onClick={() => setShowFilter(false)} className="md:hidden text-gray-400 text-sm">{t('products.hide')}</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); }} className="relative mb-4">
                <input type="text" className="input-field text-sm pl-8" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('products.search')} />
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              </form>
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t('products.categories')}</h4>
                <div className="space-y-1">
                  <button onClick={() => handleCategoryClick('')} className={`block w-full text-right text-sm px-3 py-1.5 rounded-xl transition-colors ${!selectedCategory ? 'bg-green-50 dark:bg-green-900/30 text-[rgb(0,166,62)] font-semibold border border-green-100/30 dark:border-green-700/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{t('products.all')}</button>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => handleCategoryClick(String(cat.id))} className={`block w-full text-right text-sm px-3 py-1.5 rounded-xl transition-colors ${selectedCategory === String(cat.id) ? 'bg-green-50 dark:bg-green-900/30 text-[rgb(0,166,62)] font-semibold border border-green-100/30 dark:border-green-700/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      {cat.name_ar || cat.name_en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">{t('products.sort')}</h4>
                <select className="input-field text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">{t('products.newest')}</option>
                  <option value="price_asc">{t('products.price_low')}</option>
                  <option value="price_desc">{t('products.price_high')}</option>
                  <option value="name_asc">{t('products.name_az')}</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-3">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('products.title')}</h1>
                {pagination && <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">{pagination.total || products.length} {t('products.count')}</span>}
              </div>
              <button onClick={() => setShowFilter(true)} className="md:hidden flex items-center gap-1 text-sm text-[rgb(0,166,62)] font-semibold"><FiFilter size={15} /> {t('products.filter_button')}</button>
            </div>

            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
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
