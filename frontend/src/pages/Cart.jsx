import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCart, updateCartItemQuantity, removeFromCart } from '../api/cart';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';

export default function Cart() {
  const { cartItems, fetchCart, loading } = useCart();
  const [updating, setUpdating] = useState({});
  const [editingQty, setEditingQty] = useState({});
  const { t } = useLanguage();
  const inputRef = useRef(null);

  const handleQuantity = async (itemId, newQty) => {
    const item = cartItems.find((i) => i.id === itemId);
    const isWeight = item?.product?.unit_ar === 'كجم' || item?.product?.unit_ar === 'لتر' || item?.product?.unit_ar === 'جرام';
    const min = isWeight ? 0.1 : 1;
    if (newQty < min) return;
    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateCartItemQuantity(itemId, newQty);
      await fetchCart();
    } catch { toast.error(t('cart.error')); } finally { setUpdating((prev) => ({ ...prev, [itemId]: false })); }
  };

  const handleRemove = async (item) => {
    const productId = item.product?.id;
    if (!productId) return;
    try {
      await removeFromCart(productId);
      await fetchCart();
      toast.success(t('cart.removed'));
    } catch { toast.error(t('cart.error')); }
  };

  if (loading) return <Loader />;

  const total = (cartItems || []).reduce((sum, item) => sum + parseFloat(item.product?.effective_price || item.product?.price || 0) * item.quantity, 0);
  const deliveryFee = 30;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('cart.title')}</h1>
        {(!cartItems || cartItems.length === 0) ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <FiShoppingCart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t('cart.empty')}</p>
            <Link to="/products" className="btn-primary inline-block mt-4">{t('cart.shop_now')}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => {
                const p = item.product;
                const isWeight = p?.unit_ar === 'كجم' || p?.unit_ar === 'لتر' || p?.unit_ar === 'جرام';
                const imgSrc = p?.product_image
                  ? p.product_image.startsWith('http') ? p.product_image : `http://localhost:5000/uploads/${p.product_image.replace(/^\/+/, '')}`
                  : null;
                return (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-green-50 dark:bg-green-900/30 overflow-hidden">
                      {imgSrc ? <img src={imgSrc} alt={p?.name_ar} className="w-full h-full object-cover" /> : <img src="/icon.svg" alt="" className="w-full h-full object-cover opacity-30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${p?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-[rgb(0,166,62)] truncate block">{p?.name_ar}</Link>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[rgb(0,166,62)]">{parseFloat(p?.effective_price || p?.price || 0).toFixed(2)} {t('cart.currency')}</span>
                        {p?.effective_price && p?.effective_price < parseFloat(p?.price) && <span className="text-xs text-gray-400 line-through">{parseFloat(p?.price).toFixed(2)} {t('cart.currency')}</span>}
                      </div>
                      {p?.unit_ar && <span className="text-xs text-gray-400 mr-1">/{p.unit_ar}</span>}
                    </div>
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl">
                      <button onClick={() => handleQuantity(item.id, Math.max(isWeight ? 0.1 : 1, item.quantity - (isWeight ? 0.1 : 1)))} disabled={item.quantity <= (isWeight ? 0.1 : 1) || updating[item.id]} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-xl"><FiMinus size={14} /></button>
                      {isWeight ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={editingQty[item.id] !== undefined ? editingQty[item.id] : item.quantity}
                          onChange={(e) => setEditingQty({ ...editingQty, [item.id]: e.target.value })}
                          onBlur={() => {
                            const val = parseFloat(editingQty[item.id]);
                            if (editingQty[item.id] !== undefined && val >= 0.1 && val !== item.quantity) {
                              handleQuantity(item.id, +val.toFixed(3));
                            }
                            setEditingQty((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          className="w-14 text-center font-bold text-gray-900 dark:text-white bg-transparent border-x border-gray-200 dark:border-gray-600 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className="px-3 font-bold text-gray-900 dark:text-white min-w-[40px] text-center">{item.quantity}</span>
                      )}
                      {isWeight && <span className="text-xs text-gray-400 ml-1">{p?.unit_ar}</span>}
                      <button onClick={() => handleQuantity(item.id, +(item.quantity + (isWeight ? 0.1 : 1)).toFixed(3))} disabled={updating[item.id]} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-xl"><FiPlus size={14} /></button>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white w-20 text-left">{(parseFloat(p?.effective_price || p?.price || 0) * item.quantity).toFixed(2)} {t('cart.currency')}</span>
                    <button onClick={() => handleRemove(item)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={18} /></button>
                  </div>
                );
              })}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 h-fit sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('cart.summary')}</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</span><span className="font-semibold text-gray-900 dark:text-white">{total.toFixed(2)} {t('cart.currency')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('cart.shipping')}</span><span className="font-semibold text-gray-900 dark:text-white">{deliveryFee.toFixed(2)} {t('cart.currency')}</span></div>
                <hr className="border-gray-100 dark:border-gray-700" />
                <div className="flex justify-between text-base"><span className="font-bold text-gray-900 dark:text-white">{t('cart.grand_total')}</span><span className="font-bold text-[rgb(0,166,62)]">{(total + deliveryFee).toFixed(2)} {t('cart.currency')}</span></div>
              </div>
              <Link to="/checkout" className="btn-primary w-full text-center block">{t('cart.checkout')}</Link>
              <Link to="/products" className="block text-center text-sm text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] mt-3 font-semibold">{t('cart.continue_shopping')}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
