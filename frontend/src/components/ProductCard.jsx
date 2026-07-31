import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, ShoppingCart, Clock, Package } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { addToCart } from '../api/cart';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import fallbackImage from '/icon.svg';

export default function ProductCard({ product }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { fetchCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [weightInput, setWeightInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [modalError, setModalError] = useState('');

  const isFav = favoriteIds.has(product.id);
  const isRtl = lang === 'ar';

  const imgSrc = product.product_image && !imgError
    ? product.product_image.startsWith('http') ? product.product_image : `http://localhost:5000/uploads/${product.product_image.replace(/^\/+/, '')}`
    : null;

  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;

  const hasDateOffer = discountPrice && product.offer_end_at && new Date(product.offer_end_at) > new Date();
  const hasStockOffer = discountPrice && product.offer_until_stock_out;

  const hasOffer = hasDateOffer || hasStockOffer;
  const discountPercentage = hasOffer && price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const isWeightProduct = product.unit_ar === 'كجم' || product.unit_ar === 'Kg' || product.unit_ar === 'جرام' || product.unit_ar === 'لتر' || product.unit_ar === 'ملل';

  const availableQuantity = product.available_quantity != null ? parseFloat(product.available_quantity) : null;

  const isOutOfStock = availableQuantity !== null && availableQuantity <= 0;
  const addBtnClass = (isOutOfStock
    ? 'bg-gray-300 cursor-not-allowed opacity-60 shadow-none'
    : 'bg-[#00a650] hover:bg-green-600 hover:shadow-[0_5px_15px_rgba(0,166,80,0.3)] cursor-pointer active:scale-90')
    + ' text-white w-6 h-6 sm:w-9 sm:h-9 group-hover:sm:w-24 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_3px_10px_rgba(0,166,80,0.2)] overflow-hidden shrink-0';

  const formatExpiryDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) + ' | ' +
      d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(1);
    setWeightInput('');
    setPriceInput('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleAddToCart = async (amount, isWeight = false) => {
    if (!user) { toast.error(t('product_card.login_required')); return; }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: isWeight ? amount / 1000 : amount });
      await fetchCart();
      toast.success(t('product_card.added'));
      setIsModalOpen(false);
    } catch { toast.error(t('common.unexpected_error')); } finally { setAdding(false); }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error(t('product_card.login_required')); return; }
    if (isWeightProduct) {
      handleOpenModal(e);
      return;
    }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: 1 });
      await fetchCart();
      toast.success(t('product_card.added'));
    } catch { toast.error(t('common.unexpected_error')); } finally { setAdding(false); }
  };

  const handleToggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error(t('product_card.login_required')); return; }
    toggleFavorite(product.id);
  };

  const normalizeDigits = (val) => {
    const arabic = '٠١٢٣٤٥٦٧٨٩';
    return val.replace(/[٠-٩]/g, (d) => String(arabic.indexOf(d))).replace(',', '.');
  };

  const handleWeightChange = (val) => {
    const cleanVal = normalizeDigits(val).replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    setWeightInput(cleanVal);
    setPriceInput('');
    const grams = parseFloat(cleanVal);
    const maxGrams = product.available_quantity != null ? product.available_quantity * 1000 : 999999;
    if (grams > maxGrams) {
      setModalError(isRtl ? `⚠️ الوزن المطلوب أكبر من المخزون المتاح` : `⚠️ Weight exceeds available stock`);
    } else {
      setModalError('');
    }
  };

  const handlePriceChange = (val) => {
    const cleanVal = normalizeDigits(val).replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    setPriceInput(cleanVal);
    setWeightInput('');
    setModalError('');
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (isWeightProduct) {
      let grams = 0;
      if (weightInput) {
        grams = parseFloat(weightInput);
      } else if (priceInput) {
        const pricePerKg = parseFloat(product.price) || 0;
        if (pricePerKg > 0) grams = (parseFloat(priceInput) / pricePerKg) * 1000;
      }
      if (grams <= 0) { setModalError(isRtl ? '⚠️ من فضلك اختر وزناً' : '⚠️ Please select weight'); return; }
      handleAddToCart(grams, true);
    } else {
      if (quantity <= 0) { setModalError(isRtl ? '⚠️ يرجى تحديد كمية صحيحة' : '⚠️ Please select a valid quantity'); return; }
      handleAddToCart(quantity, false);
    }
  };

  const productName = lang === 'ar' ? product.name_ar : (product.name_en || product.name_ar);

  return (
    <div className="relative font-sans h-full group select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      <Link to={`/products/${product.id}`} className="block product-card">
        <div className={`w-full h-24 sm:h-36 mb-2 rounded-xl overflow-hidden bg-white border border-gray-50 shrink-0 relative shadow-inner flex items-center justify-center p-2 ${availableQuantity !== null && availableQuantity <= 0 ? 'opacity-50 grayscale' : ''}`}>
          {availableQuantity !== null && availableQuantity <= 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              {isRtl ? 'نفدت الكمية' : 'Out of stock'}
            </div>
          )}
          {hasOffer && discountPercentage > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full z-20 shadow-[0_2px_8px_rgba(239,68,68,0.3)] tracking-tight">
              {discountPercentage}%-
            </div>
          )}
          <button onClick={handleToggleFav}
            className={`absolute top-1.5 left-1.5 z-20 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 transition-all active:scale-75 shadow-sm hover:shadow-md ${
              isFav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}>
            <Heart size={14} className={`transition-all duration-300 ${isFav ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
          </button>
          {imgSrc ? (
            <img src={imgSrc} alt={productName} className="max-w-full max-h-full object-contain p-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-2"
              onError={() => setImgError(true)} />
          ) : (
            <img src={fallbackImage} alt="" className="max-w-full max-h-full object-contain p-1 opacity-40" />
          )}
        </div>

        <div className="text-right mb-2 grow flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-[#1e3a5f] dark:text-gray-200 group-hover:text-[#00a650] text-[11px] sm:text-sm leading-snug line-clamp-2 min-h-8 sm:min-h-10 transition-colors duration-300">
              {productName}
            </h3>
            {hasOffer && (
              <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-rose-600 bg-rose-50/80 dark:bg-rose-900/30 border border-rose-100/50 dark:border-rose-700/50 px-1.5 py-1 rounded-md w-fit">
                {hasDateOffer ? (
                  <>
                    <Clock size={10} className="shrink-0" />
                    <span className="whitespace-nowrap">{formatExpiryDate(product.offer_end_at)}</span>
                  </>
                ) : (
                  <>
                    <Package size={10} className="shrink-0" />
                    <span className="whitespace-nowrap">{isRtl ? 'عرض حتى نفاد الكمية' : 'Offer until stock lasts'}</span>
                  </>
                )}
              </div>
            )}
            {availableQuantity !== null && availableQuantity > 0 && isWeightProduct && (
              <span className="text-amber-700 dark:text-amber-400 text-[8px] font-bold">
                {isRtl
                  ? `متبقٍّ ${availableQuantity >= 1000 ? `${(availableQuantity / 1000).toFixed(2)} كجم` : `${availableQuantity.toFixed(2)} جرام`}`
                  : `Remaining: ${availableQuantity >= 1000 ? `${(availableQuantity / 1000).toFixed(2)}kg` : `${availableQuantity.toFixed(2)}g`}`}
              </span>
            )}
            {availableQuantity !== null && !isWeightProduct && availableQuantity > 0 && availableQuantity <= 5 && (
              <span className="text-red-600 dark:text-red-400 text-[8px] font-bold">
                {isRtl ? `باقي ${availableQuantity} فقط!` : `Only ${availableQuantity} left!`}
              </span>
            )}
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-gray-400 font-medium text-[9px] sm:text-xs">{product.category_name || ''}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100/70 dark:border-gray-700/70 gap-2">
          <button onClick={handleQuickAdd} disabled={isOutOfStock}
            className={addBtnClass}>
            <Plus size={14} className="shrink-0" />
            <span className="hidden group-hover:sm:inline text-[11px] whitespace-nowrap transition-all duration-300 opacity-0 group-hover:opacity-100">{isRtl ? 'أضف' : 'Add'}</span>
          </button>
          <div className="flex flex-col items-end justify-center leading-tight">
            {hasOffer ? (
              <>
                <span className="text-gray-400 line-through text-[9px] sm:text-xs mb-0.5 decoration-red-400/80 font-medium">
                  {price.toFixed(2)} {t('product_card.currency')}
                </span>
                <div className="text-[#00a650] font-black text-xs sm:text-lg whitespace-nowrap flex items-baseline gap-0.5">
                  <span>{discountPrice.toFixed(2)}</span>
                  <span className="text-[8px] sm:text-xs font-bold text-gray-500">{t('product_card.currency')}</span>
                </div>
              </>
            ) : (
              <div className="text-[#00a650] font-black text-xs sm:text-lg whitespace-nowrap flex items-baseline gap-0.5">
                <span>{price.toFixed(2)}</span>
                <span className="text-[8px] sm:text-xs font-bold text-gray-500">{t('product_card.currency')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-gray-800 w-full max-w-85 rounded-3xl overflow-hidden shadow-2xl animate-modal-pop">
            <div className="h-3 bg-[#00a650] w-full"></div>
            <form onSubmit={handleModalSubmit} className="p-5 sm:p-6">
              <h2 className="text-center text-[#00a650] text-xl sm:text-2xl font-extrabold mb-5 sm:mb-6">
                {isRtl ? 'تحديد الكمية' : 'Select Quantity'}
              </h2>
              {isWeightProduct ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { name: isRtl ? 'ثمن كيلو' : '1/8 kg', val: 125 },
                      { name: isRtl ? 'ربع كيلو' : '1/4 kg', val: 250 },
                      { name: isRtl ? 'نص كيلو' : '1/2 kg', val: 500 },
                      { name: isRtl ? 'واحد كيلو' : '1 kg', val: 1000 },
                    ].map((weight) => (
                      <button key={weight.name} type="button"
                        onClick={() => {
                          handleAddToCart(weight.val, true);
                        }}
                        className="py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer border bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-200">
                        {weight.name}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder={isRtl ? 'اكتب الوزن بالجرام (مثلاً 500 لنصف كجم)' : 'Weight in grams (e.g. 500 for 0.5 kg)'}
                    value={weightInput} onChange={(e) => handleWeightChange(e.target.value)}
                    className="w-full border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold outline-none focus:border-[#00a650]" />
                  <input type="text" placeholder={isRtl ? 'اطلب بمبلغ (مثلاً 50 جنيه)' : 'Order by amount (e.g. 50 EGP)'}
                    value={priceInput} onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold outline-none focus:border-[#00a650]" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 my-6 sm:my-8">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                    {isRtl ? 'الكمية المطلوبة (بالعدد)' : 'Requested Quantity'}
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full bg-[#f3f4f6] dark:bg-gray-600 text-[#374151] dark:text-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-500 active:scale-95 transition-all cursor-pointer">-</button>
                    <input type="number" min="1" value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-12 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 rounded-xl text-center text-xl font-black text-gray-900 dark:text-gray-100 outline-none focus:border-[#00a650] shadow-inner" />
                    <button type="button" onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-full bg-[#f0fdf4] dark:bg-green-900/30 text-[#00a650] flex items-center justify-center text-xl font-bold hover:bg-green-100 dark:hover:bg-green-800/30 active:scale-95 transition-all cursor-pointer">+</button>
                  </div>
                </div>
              )}
              {modalError && (
                <div className="mb-4 animate-shake">
                  <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/30 py-2 rounded-lg border border-red-100 dark:border-red-700">{modalError}</p>
                </div>
              )}
              <button type="submit" disabled={!!modalError || adding}
                className="w-full mt-5 sm:mt-6 text-white py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md bg-[#00a650] hover:bg-[#008f45] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70">
                <ShoppingCart size={18} /> {adding ? '...' : isRtl ? 'إضافة للسلة' : 'Add to Cart'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="w-full mt-2 text-gray-600 dark:text-gray-400 font-bold py-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
