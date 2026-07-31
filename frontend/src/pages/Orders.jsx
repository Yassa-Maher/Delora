import { useState, useEffect } from 'react';
import { getMyOrders } from '../api/orders';
import Loader from '../components/Loader';
import { useLanguage } from '../contexts/LanguageContext';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700',
  confirmed: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700',
  processing: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700',
  out_for_delivery: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700',
  delivered: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700',
  cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700',
  completed: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600',
};

export default function Orders() {
  const { t } = useLanguage();
  const statusLabels = {
    pending: t('orders.pending'),
    confirmed: t('orders.confirmed'),
    processing: t('orders.processing'),
    out_for_delivery: t('orders.out_for_delivery'),
    delivered: t('orders.delivered'),
    cancelled: t('orders.cancelled'),
    completed: t('orders.completed'),
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10 animate-fadein">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('nav.orders')}</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t('orders.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = order.order_status || order.status || 'pending';
              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full p-4 flex items-center gap-4 text-right">
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-[rgb(0,166,62)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{`${t('orders.order_prefix')}${order.id}`}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${statusColors[status] || 'bg-gray-50 text-gray-600'}`}>{statusLabels[status] || status}</span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(order.order_date || order.created_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <span className="font-bold text-[rgb(0,166,62)]">{parseFloat(order.total_amount || 0).toFixed(2)} {t('orders.currency')}</span>
                    {expanded === order.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </button>
                  {expanded === order.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2 text-sm">
                      <p><span className="text-gray-500 dark:text-gray-400">{t('orders.payment_method')}</span> <span className="font-medium text-gray-900 dark:text-white">{order.payment_method === 'cash_on_delivery' ? t('orders.payment_cash') : t('orders.payment_wallet')}</span></p>
                      <p><span className="text-gray-500 dark:text-gray-400">{t('orders.payment_status')}</span> <span className="font-medium text-gray-900 dark:text-white">{order.payment_status === 'paid' ? t('orders.payment_paid') : order.payment_status === 'failed' ? t('orders.payment_failed') : t('orders.payment_pending')}</span></p>
                      <p><span className="text-gray-500 dark:text-gray-400">{t('orders.shipping_address')}</span> <span className="font-medium text-gray-900 dark:text-white">{order.shipping_address}</span></p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
