import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../api/products';
import { getProductReviews, createReview } from '../api/reviews';
import { addToCart } from '../api/cart';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { ShoppingCart, Star, Minus, Plus, ChevronRight, Clock, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProductDetail() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const { id } = useParams();
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProductById(id), getProductReviews(id)])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data.product || pRes.data);
        setReviews(Array.isArray(rRes.data) ? rRes.data : rRes.data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error(t('product.login_required')); return; }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity });
      await fetchCart();
      toast.success(t('product.added_to_cart'));
    } catch {} finally { setAdding(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error(t('product.login_required')); return; }
    setSubmittingReview(true);
    try {
      await createReview({ product_id: product.id, ...reviewForm });
      toast.success(t('product.review_added'));
      setReviewForm({ rating: 5, review_text: '' });
      const res = await getProductReviews(id);
      setReviews(Array.isArray(res.data) ? res.data : res.data.reviews || []);
    } catch {} finally { setSubmittingReview(false); }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-gray-400 bg-gray-50 dark:bg-gray-900 min-h-screen">{t('product.not_found')}</div>;

  const imgSrc = product.product_image && !imgError
    ? product.product_image.startsWith('http') ? product.product_image : `http://localhost:5000/uploads/${product.product_image.replace(/^\/+/, '')}`
    : null;

  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const hasDateOffer = discountPrice && product.offer_end_at && new Date(product.offer_end_at) > new Date();
  const hasStockOffer = discountPrice && product.offer_until_stock_out;
  const hasOffer = hasDateOffer || hasStockOffer;
  const isWeightProduct = product.unit_ar === 'كجم' || product.unit_ar === 'Kg' || product.unit_ar === 'جرام' || product.unit_ar === 'لتر' || product.unit_ar === 'ملل';

  const formatExpiryDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) + ' | ' +
      d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10 animate-fadein" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link to="/" className="hover:text-[rgb(0,166,62)]">{t('product.breadcrumb_home')}</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-[rgb(0,166,62)]">{t('product.breadcrumb_products')}</Link>
          <ChevronRight size={12} />
          <span className="text-[rgb(0,166,62)] font-semibold">{product.name_ar}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-4">
            {imgSrc ? (
              <img src={imgSrc} alt={product.name_ar} className="w-full h-auto object-cover rounded-xl" onError={() => setImgError(true)} />
            ) : (
              <div className="w-full aspect-square bg-green-50 dark:bg-green-900/30 flex items-center justify-center rounded-xl"><img src="/icon.svg" alt="" className="w-24 h-24 opacity-30" /></div>
            )}
            {product.product_images?.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {product.product_images.map((img, i) => (
                  <img key={i} src={img.image_url?.startsWith('http') ? img.image_url : `http://localhost:5000/uploads/${img.image_url}`} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-600 shrink-0" />
                ))}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{product.name_ar}</h1>
            {product.brand_ar && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('product.brand')} <span className="text-gray-700 dark:text-gray-200 font-medium">{product.brand_ar}</span></p>}
            {product.avg_rating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className={s <= Math.round(product.avg_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                ))}
                <span className="text-sm text-gray-400 mr-2">({product.avg_rating})</span>
              </div>
            )}
            <div className="mb-4">
              {hasOffer ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-black text-[rgb(0,166,62)]">{discountPrice.toFixed(2)} {t('cart.currency')}</span>
                  <span className="text-lg text-gray-400 line-through">{price.toFixed(2)} {t('cart.currency')}</span>
                  {hasStockOffer && (
                    <span className="flex items-center gap-1 text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold px-2 py-0.5 rounded-full">
                      <Package size={10} /> {t('product.offer_until_stock')}
                    </span>
                  )}
                  {hasDateOffer && (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
                      <Clock size={10} /> {formatExpiryDate(product.offer_end_at)}
                    </span>
                  )}
                  {product.offer_max_quantity && <span className="badge-green text-[10px]">{t('product.max_quantity')} {product.offer_max_quantity}</span>}
                </div>
              ) : (
                <span className="text-3xl font-black text-[rgb(0,166,62)]">{price.toFixed(2)} {t('cart.currency')}</span>
              )}
            </div>
            {product.description_ar && <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">{product.description_ar}</p>}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl">
                {isWeightProduct ? (
                  <>
                    <button onClick={() => setQuantity(Math.max(0.1, +(quantity - 0.1).toFixed(3)))} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-xl"><Minus size={14} /></button>
                    <input type="number" step="0.1" min="0.1" value={quantity} onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-16 text-center font-bold text-gray-900 dark:text-white bg-transparent border-x border-gray-200 dark:border-gray-600 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <button onClick={() => setQuantity(+(quantity + 0.1).toFixed(3))} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-xl"><Plus size={14} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-xl"><Minus size={14} /></button>
                    <span className="px-4 font-bold text-gray-900 dark:text-white">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-xl"><Plus size={14} /></button>
                  </>
                )}
              </div>
              <span className="text-sm text-gray-500">{isWeightProduct ? product.unit_ar : ''}</span>
              <button onClick={handleAddToCart} disabled={adding}
                className="bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-[0_3px_10px_rgba(0,166,80,0.2)] flex items-center gap-2 flex-1 sm:flex-none">
                <ShoppingCart size={18} /> {adding ? t('product.adding') : t('product.add_to_cart')}
              </button>
            </div>
            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('product.reviews')}</h2>
          {user && (
            <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('product.add_review')}</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                    <Star size={22} className={s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                  </button>
                ))}
              </div>
              <textarea className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[rgba(0,166,62,0.3)] focus:border-[rgb(0,166,62)] outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-3" rows={3}
                value={reviewForm.review_text} onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })} placeholder={t('product.review_placeholder')} />
              <button type="submit" disabled={submittingReview}
                className="bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-[0_3px_10px_rgba(0,166,80,0.2)] text-sm">
                {submittingReview ? t('product.submitting') : t('product.submit_review')}
              </button>
            </form>
          )}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-6">{t('product.no_reviews')}</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{r.user?.name || t('product.user_fallback')}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </div>
                  </div>
                  {r.review_text && <p className="text-gray-500 dark:text-gray-400 text-sm">{r.review_text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
