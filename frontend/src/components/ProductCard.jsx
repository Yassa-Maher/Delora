import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { addToCart } from '../api/cart';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { fetchCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFav = favoriteIds.has(product.id);

  const imgSrc = product.product_image && !imgError
    ? product.product_image.startsWith('http') ? product.product_image : `http://localhost:5000/uploads/${product.product_image.replace(/^\/+/, '')}`
    : null;

  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;

  const hasDateOffer = discountPrice && product.offer_end_at && new Date(product.offer_end_at) > new Date();
  const hasStockOffer = discountPrice && product.offer_until_stock_out;

  const hasOffer = hasDateOffer || hasStockOffer;
  const isWeightProduct = product.unit_ar === 'كجم' || product.unit_ar === 'Kg' || product.unit_ar === 'جرام' || product.unit_ar === 'لتر' || product.unit_ar === 'ملل';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error(t('product_card.login_required')); return; }
    if (isWeightProduct) {
      navigate(`/products/${product.id}`);
      return;
    }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: 1 });
      await fetchCart();
      toast.success(t('product_card.added'));
    } finally { setAdding(false); }
  };

  const handleToggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error(t('product_card.login_required')); return; }
    toggleFavorite(product.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square bg-green-50 dark:bg-green-900/30 overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src="/icon.svg" alt="" className="w-16 h-16 opacity-30" />
            </div>
          )}
        </div>
        <button onClick={handleToggleFav} className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 active:scale-90 z-10 ${isFav ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100'}`}>
          <FiHeart size={16} className={isFav ? 'fill-red-500 text-red-500' : ''} />
        </button>
        {hasOffer && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{t('product_card.offer')}</span>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1 group-hover:text-[rgb(0,166,62)] transition-colors">{product.name_ar}</h3>
        </Link>
        {hasOffer ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[rgb(0,166,62)]">{discountPrice.toFixed(2)} {t('product_card.currency')}</span>
            <span className="text-xs text-gray-400 line-through">{price.toFixed(2)} {t('product_card.currency')}</span>
          </div>
        ) : (
          <span className="text-sm font-bold text-[rgb(0,166,62)]">{price.toFixed(2)} {t('product_card.currency')}</span>
        )}
        <button onClick={handleAddToCart} disabled={adding} className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl bg-[rgb(0,166,62)] text-white hover:bg-[rgb(0,145,55)] transition-all active:scale-95 disabled:opacity-50">
          <FiShoppingCart size={14} /> {adding ? '...' : t('product_card.add')}
        </button>
      </div>
    </div>
  );
}
