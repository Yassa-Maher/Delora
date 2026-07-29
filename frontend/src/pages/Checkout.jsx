import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getAddresses } from '../api/addresses';
import { checkout as checkoutOrder, uploadPaymentProof } from '../api/orders';
import { validateCoupon } from '../api/coupons';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FiPlus, FiTag, FiCheck, FiX, FiUpload } from 'react-icons/fi';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, fetchCart } = useCart();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [processNumber, setProcessNumber] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([getAddresses(), fetchCart()])
      .then(([aRes]) => {
        const addrs = Array.isArray(aRes.data) ? aRes.data : aRes.data.addresses || [];
        setAddresses(addrs);
        if (addrs.length > 0 && !selectedAddressId) setSelectedAddressId(addrs[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const subtotal = (cartItems || []).reduce((sum, item) => sum + parseFloat(item.product?.effective_price || item.product?.price || 0) * item.quantity, 0);
  const shipping = 30;
  const discount = appliedCoupon ? (appliedCoupon.discount_amount || (appliedCoupon.discount_type === 'percentage'
    ? Math.min(subtotal * appliedCoupon.discount_value / 100, appliedCoupon.max_discount_amount || Infinity)
    : appliedCoupon.discount_value)) : 0;
  const totalAmount = subtotal + shipping - discount;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await validateCoupon({ code: couponCode.trim(), order_total: subtotal });
      setAppliedCoupon(res.data.coupon);
      setCouponCode('');
      toast.success(t('checkout.coupon_applied_success'));
    } catch (e) {
      setCouponError(e.response?.data?.message || t('checkout.coupon_invalid'));
      setAppliedCoupon(null);
    } finally { setValidatingCoupon(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error(t('checkout.select_address')); return; }
    if (!selectedAddress) { toast.error(t('checkout.address_not_found')); return; }
    if (!phone.trim()) { toast.error(t('checkout.enter_phone')); return; }
    if (paymentMethod === 'wallet' && !processNumber.trim()) { toast.error(t('checkout.enter_process_number')); return; }
    if (paymentMethod === 'wallet' && !proofImage) { toast.error(t('checkout.upload_proof')); return; }
    setPendingAction(true);
    try {
      const fullAddress = `العنوان: ${selectedAddress.title}, ${selectedAddress.city}, ${selectedAddress.area}, ${selectedAddress.street_details}`;
      const res = await checkoutOrder({
        address: fullAddress,
        phone_number: phone,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || undefined,
      });
      const orderId = res.data.orderId;
      if (paymentMethod === 'wallet' && orderId) {
        const fd = new FormData();
        fd.append('order_id', orderId);
        fd.append('process_number', processNumber.trim());
        fd.append('sender_name', user?.name || '');
        fd.append('transfer_date', new Date().toISOString().slice(0, 10));
        fd.append('proof_image', proofImage);
        await uploadPaymentProof(fd);
      }
      toast.success(res.data.message || t('checkout.order_created'));
      await fetchCart();
      navigate('/orders');
    } catch (e) {
      toast.error(e.response?.data?.message || t('checkout.order_failed'));
    } finally { setPendingAction(false); }
  };

  const toggleAddress = (id) => {
    setSelectedAddressId((prev) => (prev === id ? null : id));
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('checkout.title')}</h1>

        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('checkout.address')}</h2>
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 dark:text-gray-500 mb-3">{t('checkout.no_addresses')}</p>
                <Link to="/addresses" className="btn-primary inline-flex items-center gap-2 text-sm"><FiPlus size={16} /> {t('checkout.add_address')}</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <button key={addr.id} onClick={() => toggleAddress(addr.id)} className={`w-full text-right p-4 rounded-xl border-2 transition-all ${selectedAddressId === addr.id ? 'border-[rgb(0,166,62)] bg-green-50 dark:bg-green-900/30' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{addr.title || t('checkout.address_title_fallback')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{addr.street_details}, {addr.area}, {addr.city}{addr.building_number ? `, ${t('checkout.building')} ${addr.building_number}` : ''}{addr.floor_number ? `, ${t('checkout.floor')} ${addr.floor_number}` : ''}</p>
                      </div>
                      {addr.is_default && <span className="badge-green text-[10px]">{t('checkout.default')}</span>}
                    </div>
                  </button>
                ))}
                {addresses.length > 0 && <Link to="/addresses" className="flex items-center gap-2 text-sm text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] font-semibold mt-2"><FiPlus size={16} /> {t('checkout.add_address')}</Link>}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('checkout.your_phone')}</h2>
            <input type="tel" dir="ltr" className="input-field w-full text-left" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('checkout.phone_placeholder')} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('checkout.coupon')}</h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[rgb(0,166,62)]" size={18} />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{appliedCoupon.code}</span>
                  <span className="text-sm text-[rgb(0,166,62)]">
                    {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `${parseFloat(appliedCoupon.discount_value).toFixed(2)} ${t('cart.currency')}`} {t('checkout.coupon_label')}
                  </span>
                </div>
                <button onClick={handleRemoveCoupon} className="p-1 text-gray-400 hover:text-red-500"><FiX size={18} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" className="input-field flex-1" value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }} placeholder={t('checkout.enter_coupon')} />
                <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || validatingCoupon} className="btn-primary shrink-0">
                  {validatingCoupon ? '...' : t('checkout.apply')}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('checkout.payment')}</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-[rgb(0,166,62)] bg-green-50 dark:bg-green-900/30' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'}`}>
                <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={() => { setPaymentMethod('cash_on_delivery'); setProcessNumber(''); setProofImage(null); setProofPreview(null); }} className="accent-[rgb(0,166,62)] w-4 h-4" />
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('checkout.cash_on_delivery')}</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t('checkout.cash_desc')}</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-[rgb(0,166,62)] bg-green-50 dark:bg-green-900/30' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'}`}>
                <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="accent-[rgb(0,166,62)] w-4 h-4" />
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('checkout.wallet')}</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t('checkout.wallet_desc')}</p>
                </div>
              </label>
            </div>
            {paymentMethod === 'wallet' && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('checkout.process_number')}</label>
                  <input type="text" className="input-field" value={processNumber} onChange={(e) => setProcessNumber(e.target.value)} placeholder={t('checkout.process_number_placeholder')} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('checkout.proof_image')}</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-500 cursor-pointer hover:border-[rgb(0,166,62)] transition-colors text-sm text-gray-500 dark:text-gray-400">
                      <FiUpload size={16} />
                      {proofImage ? t('checkout.change_image') : t('checkout.choose_image')}
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setProofImage(f); setProofPreview(URL.createObjectURL(f)); } }} className="hidden" />
                    </label>
                    {proofPreview && (
                      <div className="relative">
                        <img src={proofPreview} alt="proof" className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-600" />
                        <button onClick={() => { setProofImage(null); setProofPreview(null); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow-sm">x</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('checkout.products')}</h2>
            <div className="space-y-3">
              {(cartItems || []).map((item) => {
                const p = item.product;
                const imgSrc = p?.product_image
                  ? p.product_image.startsWith('http') ? p.product_image : `http://localhost:5000/uploads/${p.product_image.replace(/^\/+/, '')}`
                  : null;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-green-50 dark:bg-green-900/30 overflow-hidden">
                      {imgSrc ? <img src={imgSrc} alt={p?.name_ar} className="w-full h-full object-cover" /> : <img src="/icon.svg" alt="" className="w-full h-full object-cover opacity-30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{p?.name_ar}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t('checkout.quantity_label')} {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-[rgb(0,166,62)]">{(parseFloat(p?.effective_price || p?.price || 0) * item.quantity).toFixed(2)} {t('cart.currency')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('checkout.subtotal')}</span><span className="font-semibold text-gray-900 dark:text-white">{subtotal.toFixed(2)} {t('cart.currency')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('checkout.shipping')}</span><span className="font-semibold text-gray-900 dark:text-white">{shipping.toFixed(2)} {t('cart.currency')}</span></div>
              {discount > 0 && (
                <div className="flex justify-between"><span className="text-green-600 dark:text-green-400">{t('checkout.discount')}</span><span className="font-semibold text-green-600 dark:text-green-400">-{discount.toFixed(2)} {t('cart.currency')}</span></div>
              )}
              <hr className="border-gray-100 dark:border-gray-700" />
              <div className="flex justify-between text-base"><span className="font-bold text-gray-900 dark:text-white">{t('checkout.total')}</span><span className="font-bold text-[rgb(0,166,62)]">{totalAmount.toFixed(2)} {t('cart.currency')}</span></div>
            </div>
            <button onClick={handlePlaceOrder} disabled={!selectedAddressId || (cartItems || []).length === 0 || pendingAction} className="btn-primary w-full">
              {pendingAction ? t('checkout.place_order_loading') : t('checkout.place_order')}
            </button>
          </div>
        </>
      </div>
    </div>
  );
}
