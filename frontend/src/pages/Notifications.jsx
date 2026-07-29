import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyNotifications, markNotificationRead, markAllRead } from '../api/notifications';
import Loader from '../components/Loader';
import { FiBell, FiCheck, FiChevronLeft } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyNotifications()
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  if (loading) return <Loader />;

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('notifications.title')}</h1>
          {unread > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-sm text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] font-semibold">
              <FiCheck size={15} /> {t('notifications.mark_all_read')}
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <FiBell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t('notifications.empty')}</p>
            <Link to="/products" className="btn-primary inline-block mt-4">{t('notifications.browse')}</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card border p-4 transition-all ${n.is_read ? 'border-gray-100 dark:border-gray-700' : 'border-[rgb(0,166,62)] bg-green-50/40 dark:bg-green-900/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${n.is_read ? 'font-medium text-gray-700 dark:text-gray-300' : 'font-bold text-gray-900 dark:text-white'}`}>{n.title_ar}</h3>
                      {!n.is_read && <span className="bg-[rgb(0,166,62)] w-2 h-2 rounded-full shrink-0"></span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.message_ar}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.created_at).toLocaleString('ar-EG')}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {n.order_id && (
                      <Link to={`/orders`} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] rounded-xl"><FiChevronLeft size={14} /></Link>
                    )}
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><FiCheck size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
