import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiCheck, FiX } from 'react-icons/fi';
import API from '../../api/axios';

const statusColors = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700',
  confirmed: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700',
  processing: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700',
  out_for_delivery: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700',
  delivered: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700',
  cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700',
  completed: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700',
};
const statusLabels = { pending: 'قيد الانتظار', confirmed: 'مؤكد', processing: 'قيد المعالجة', out_for_delivery: 'في الطريق', delivered: 'تم التوصيل', cancelled: 'ملغي', completed: 'مكتمل' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await API.get('/orders/all');
      setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { order_status: status });
      toast.success('تم تحديث حالة الطلب');
      fetch();
    } catch {}
  };

  const handleReviewWallet = async (orderId, action) => {
    try {
      await API.put('/orders/review-wallet-payment', { order_id: orderId, action });
      toast.success(action === 'approve' ? 'تم اعتماد الدفع' : 'تم رفض الدفع');
      fetch();
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">الطلبات</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"><FiShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-gray-500 dark:text-gray-400">لا توجد طلبات</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-white">طلب #{o.id}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(o.order_date || o.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <select
                  value={o.order_status}
                  onChange={(e) => handleStatus(o.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-0 cursor-pointer ${statusColors[o.order_status] || 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600'}`}
                >
                  {Object.keys(statusLabels).map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-medium">العميل:</span> {o.user_name || `#${o.user_id}`} | 
                <span className="font-medium mr-2">المجموع:</span> {parseFloat(o.total_amount || 0).toFixed(2)} ج.م | 
                <span className="font-medium mr-2">الدفع:</span> {o.payment_method === 'wallet' ? 'محفظة' : 'عند الاستلام'}
                {o.payment_status && <span className={`mr-2 font-medium ${o.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : o.payment_status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{o.payment_status === 'paid' ? 'مدفوع' : o.payment_status === 'failed' ? 'فشل' : 'قيد الانتظار'}</span>}
              </div>
              {o.payment_method === 'wallet' && o.payment_info && (
                <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">معلومات تحويل المحفظة:</p>
                  <p className="text-gray-600 dark:text-gray-400">رقم العملية: <span className="font-medium text-gray-800 dark:text-gray-200" dir="ltr">{o.payment_info.process_number}</span></p>
                  {o.payment_info.sender_name && <p className="text-gray-600 dark:text-gray-400">اسم المرسل: <span className="font-medium text-gray-800 dark:text-gray-200">{o.payment_info.sender_name}</span></p>}
                  {o.payment_info.transfer_date && <p className="text-gray-600 dark:text-gray-400">تاريخ التحويل: <span className="font-medium text-gray-800 dark:text-gray-200">{o.payment_info.transfer_date}</span></p>}
                  {o.payment_proof_image && (
                    <div className="mt-2">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">صورة إثبات الدفع:</p>
                      <img src={o.payment_proof_image.startsWith('http') ? o.payment_proof_image : `http://localhost:5000/uploads/${o.payment_proof_image.replace(/^\/+/, '')}`} alt="proof" className="w-32 h-32 object-cover rounded-xl border border-blue-200 dark:border-blue-700 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(o.payment_proof_image.startsWith('http') ? o.payment_proof_image : `http://localhost:5000/uploads/${o.payment_proof_image.replace(/^\/+/, '')}`, '_blank')} />
                    </div>
                  )}
                  {o.wallet_review_status === 'pending_review' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleReviewWallet(o.id, 'approve')} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all"><FiCheck size={14} /> اعتماد</button>
                      <button onClick={() => handleReviewWallet(o.id, 'reject')} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all"><FiX size={14} /> رفض</button>
                    </div>
                  )}
                  {o.wallet_review_status === 'approved' && <span className="inline-block mt-2 text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">تم الاعتماد</span>}
                  {o.wallet_review_status === 'rejected' && <span className="inline-block mt-2 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">مرفوض</span>}
                </div>
              )}
              <div className="text-xs text-gray-400 dark:text-gray-500">
                <span className="font-medium">عنوان الشحن:</span> {o.shipping_address || '---'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
