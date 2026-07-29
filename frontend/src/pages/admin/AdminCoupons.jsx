import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPercent } from 'react-icons/fi';
import API from '../../api/axios';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', max_discount_amount: '', min_order_amount: '0', usage_limit: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await API.get('/coupons');
      setCoupons(Array.isArray(res.data) ? res.data : res.data.coupons || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNew = () => { setEditing(null); setForm({ code: '', discount_type: 'percentage', discount_value: '', max_discount_amount: '', min_order_amount: '0', usage_limit: '', is_active: true }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ code: c.code || '', discount_type: c.discount_type || 'percentage', discount_value: c.discount_value || '', max_discount_amount: c.max_discount_amount || '', min_order_amount: c.min_order_amount || '0', usage_limit: c.usage_limit || '', is_active: c.is_active }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/coupons/${editing}`, form);
        toast.success('تم تحديث الكوبون');
      } else {
        await API.post('/coupons', form);
        toast.success('تم إضافة الكوبون');
      }
      setShowForm(false); setEditing(null); fetch();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    try { await API.delete(`/coupons/${id}`); toast.success('تم الحذف'); fetch(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الكوبونات</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><FiPlus /> إضافة كوبون</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكود</label><input type="text" name="code" className="input-field" value={form.code} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع</label><select name="discount_type" className="input-field" value={form.discount_type} onChange={handleChange}><option value="percentage">نسبة مئوية</option><option value="fixed">قيمة ثابتة</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القيمة</label><input type="number" step="0.01" name="discount_value" className="input-field" value={form.discount_value} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأقصى للخصم</label><input type="number" step="0.01" name="max_discount_amount" className="input-field" value={form.max_discount_amount} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأدنى للطلب</label><input type="number" step="0.01" name="min_order_amount" className="input-field" value={form.min_order_amount} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حد الاستخدام</label><input type="number" name="usage_limit" className="input-field" value={form.usage_limit} onChange={handleChange} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="is_active" id="c_is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="c_is_active" className="text-sm text-gray-700 dark:text-gray-300">نشط</label></div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4 ${!c.is_active ? 'border-gray-200 dark:border-gray-600 opacity-60' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-[rgb(0,166,62)] bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-xl text-sm">{c.code}</span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><FiTrash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `${parseFloat(c.discount_value).toFixed(2)} ج.م`}{c.max_discount_amount ? ` (حد أقصى ${parseFloat(c.max_discount_amount).toFixed(2)} ج.م)` : ''}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">الاستخدام: {c.used_count || 0}/{c.usage_limit || '∞'}</p>
          </div>
        ))}
        {coupons.length === 0 && <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">لا توجد كوبونات</div>}
      </div>
    </div>
  );
}
