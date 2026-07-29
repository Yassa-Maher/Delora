import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../api/favorites';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FiHeart } from 'react-icons/fi';

export default function Favorites() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    getFavorites()
      .then((res) => setFavorites(Array.isArray(res.data) ? res.data : res.data.favorites || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (productId) => {
    try {
      await removeFavorite(productId);
      setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
      toast.success(t('favorites.removed'));
    } catch { toast.error(t('favorites.error')); }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="text-center py-20 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 min-h-screen">{t('favorites.login_required')}</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('favorites.title')}</h1>
        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <FiHeart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t('favorites.empty')}</p>
            <Link to="/products" className="btn-primary inline-block mt-4">{t('favorites.browse')}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {favorites.map((fav) => {
              const hasImg = fav.product_image && fav.product_image.trim() && !imgErrors[fav.product_id];
              const imgSrc = hasImg
                ? fav.product_image.startsWith('http') ? fav.product_image : `http://localhost:5000/uploads/${fav.product_image.replace(/^\/+/, '')}`
                : null;
              return (
                <div key={fav.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden group">
                  <Link to={`/products/${fav.product_id}`} className="block aspect-square bg-green-50 dark:bg-green-900/30 relative overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={fav.name_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgErrors((p) => ({ ...p, [fav.product_id]: true }))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-6">
                        <img src="/icon.svg" alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </Link>
                  <div className="p-3">
                    <Link to={`/products/${fav.product_id}`} className="font-semibold text-gray-900 dark:text-white text-sm block truncate">{fav.name_ar}</Link>
                    <span className="text-sm font-bold text-[rgb(0,166,62)]">{parseFloat(fav.price || 0).toFixed(2)} {t('product_card.currency')}</span>
                    <button onClick={() => handleRemove(fav.product_id)} className="block w-full mt-2 text-center text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">{t('common.delete')}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
