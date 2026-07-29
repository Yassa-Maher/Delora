import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../../api/products';
import API from '../../api/axios';
import { FiPackage, FiGrid, FiShoppingBag, FiMail, FiArrowUp, FiDollarSign, FiTrendingUp, FiStar, FiBox, FiPieChart } from 'react-icons/fi';

const statusLabels = { pending: 'قيد الانتظار', confirmed: 'مؤكد', processing: 'قيد المعالجة', out_for_delivery: 'في الطريق', delivered: 'تم التوصيل', cancelled: 'ملغي', completed: 'مكتمل' };
const statusColors = { pending: 'bg-yellow-500', confirmed: 'bg-blue-500', processing: 'bg-indigo-500', out_for_delivery: 'bg-purple-500', delivered: 'bg-green-500', cancelled: 'bg-red-500', completed: 'bg-emerald-500' };

export default function DashboardHome() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0 });
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 }, products: [] } })),
      getCategories({}).catch(() => ({ data: [] })),
      API.get('/orders/stats').catch(() => ({ data: null })),
    ])
      .then(([pRes, cRes, oRes]) => {
        const pData = Array.isArray(pRes.data) ? pRes.data : pRes.data.products || [];
        const cData = Array.isArray(cRes.data) ? cRes.data : [];
        const totalProducts = pData.length > 0 ? (pRes.data.pagination?.total || pData.length) : 0;
        setStats({
          products: totalProducts,
          categories: cData.length,
          orders: oRes.data?.totalOrders || 0,
          revenue: parseFloat(oRes.data?.totalRevenue || 0),
        });
        if (oRes.data) setOrderStats(oRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'المنتجات', value: stats.products, icon: FiPackage, color: '#2563EB', bg: '#e8f0fe', link: '/admin/products' },
    { label: 'الأقسام', value: stats.categories, icon: FiGrid, color: '#7C3AED', bg: '#f0ebff', link: '/admin/categories' },
    { label: 'الطلبات', value: stats.orders, icon: FiShoppingBag, color: '#EA580C', bg: '#fff4ed', link: '/admin/orders' },
    { label: 'الإيرادات', value: `${stats.revenue.toFixed(2)}`, icon: FiDollarSign, color: '#16A34A', bg: '#ecfdf3', link: '/admin/orders', suffix: ' ج.م' },
  ];

  const monthlyData = orderStats?.monthlySales || [];
  const maxSale = Math.max(...monthlyData.map(m => parseFloat(m.total)), 1);

  return (
    <div className="animate-fadein">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger">
        {statCards.map((c, i) => (
          <Link key={c.label} to={c.link} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-500/30 animate-fadein-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{c.label}</span>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                <c.icon size={22} />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <span className="animate-count-up">{c.value}{c.suffix || ''}</span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="flex items-center gap-0.5 font-semibold text-emerald-500">
                <FiArrowUp size={16} /> 0%
              </span>
              <span className="text-gray-400 dark:text-gray-500 truncate">منذ آخر شهر</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {orderStats?.bestSeller && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 lg:col-span-1 animate-fadein-up">
            <div className="flex items-center gap-2 mb-4">
              <FiStar className="text-yellow-500" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">الأكثر مبيعاً</h2>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={orderStats.bestSeller.product_image ? `http://localhost:5000/uploads/${orderStats.bestSeller.product_image.replace(/^\/+/, '')}` : '/icon.svg'}
                alt=""
                className="w-16 h-16 rounded-xl object-cover bg-green-50 dark:bg-green-900/30"
                onError={(e) => { e.target.src = '/icon.svg'; e.target.style.opacity = '0.4'; }}
              />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{orderStats.bestSeller.name_ar}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{parseFloat(orderStats.bestSeller.price).toFixed(2)} ج.م</p>
                <p className="text-xs text-[rgb(0,166,62)] font-semibold">تم بيع {orderStats.bestSeller.total_sold} وحدة</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 lg:col-span-2 animate-fadein-up">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-[rgb(0,166,62)]" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">المبيعات الشهرية</h2>
          </div>
          {monthlyData.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">لا توجد بيانات مبيعات</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {monthlyData.map((m, i) => {
                const height = (parseFloat(m.total) / maxSale) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{parseFloat(m.total).toFixed(0)}</span>
                    <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-t-lg overflow-hidden" style={{ height: '100%', maxHeight: '120px' }}>
                      <div className="chart-bar bg-gradient-to-t from-[rgb(0,166,62)] to-green-400 dark:from-green-600 dark:to-green-500 rounded-t-lg w-full transition-all" style={{ height: `${height}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{m.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 animate-fadein-up">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-purple-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">حالات الطلبات</h2>
          </div>
          {(!orderStats?.statusCounts || orderStats.statusCounts.length === 0) ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">لا توجد طلبات</p>
          ) : (
            <div className="space-y-3">
              {orderStats.statusCounts.map((s) => {
                const total = orderStats.totalOrders || 1;
                const pct = (s.count / total) * 100;
                return (
                  <div key={s.order_status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{statusLabels[s.order_status] || s.order_status}</span>
                      <span className="text-gray-500 dark:text-gray-400">{s.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${statusColors[s.order_status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 animate-fadein-up">
          <div className="flex items-center gap-2 mb-4">
            <FiBox className="text-orange-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">المبيعات حسب الأقسام</h2>
          </div>
          {(!orderStats?.categoryStats || orderStats.categoryStats.length === 0) ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {orderStats.categoryStats.map((c, i) => {
                const max = orderStats.categoryStats[0]?.total_items || 1;
                const pct = (c.total_items / max) * 100;
                return (
                  <div key={c.id} className="animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{c.name_ar}</span>
                      <span className="text-gray-500 dark:text-gray-400">{c.total_items} منتج</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: `linear-gradient(90deg, rgb(0,166,62), rgb(0,200,80))` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 animate-fadein-up">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">روابط سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { to: '/admin/products', label: 'إدارة المنتجات', desc: 'إضافة، تعديل، حذف المنتجات' },
            { to: '/admin/categories', label: 'إدارة الأقسام', desc: 'إضافة، تعديل، حذف الأقسام' },
            { to: '/admin/orders', label: 'الطلبات', desc: 'مشاهدة وتحديث حالات الطلبات' },
            { to: '/admin/coupons', label: 'الكوبونات', desc: 'إدارة أكواد الخصم' },
            { to: '/admin/banners', label: 'البانرات', desc: 'إدارة بانرات الإعلانات' },
            { to: '/admin/branches', label: 'الفروع', desc: 'إدارة فروع المتجر' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="p-4 border border-gray-200 dark:border-gray-600 rounded-2xl hover:border-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-300 active:scale-[0.98]">
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
