import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../../api/paymentMethods';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name_ar: '', name_en: '', type: 'wallet', provider: '',
    receiver_number: '', receiver_name: '', require_screenshot: true,
    require_transaction_id: true, sort_order: 0, is_active: true,
  });

  const fetch = useCallback(async () => {
    try {
      const res = await getPaymentMethods();
      setMethods(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openNew = () => {
    setEditing(null);
    setForm({ name_ar: '', name_en: '', type: 'wallet', provider: '', receiver_number: '', receiver_name: '', require_screenshot: true, require_transaction_id: true, sort_order: methods.length + 1, is_active: true });
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ name_ar: m.name_ar, name_en: m.name_en, type: m.type, provider: m.provider || '', receiver_number: m.receiver_number || '', receiver_name: m.receiver_name || '', require_screenshot: m.require_screenshot, require_transaction_id: m.require_transaction_id, sort_order: m.sort_order, is_active: m.is_active });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_ar.trim() || !form.name_en.trim()) { toast.error('الاسم مطلوب'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updatePaymentMethod(editing.id, form);
        toast.success('تم التحديث');
      } else {
        await createPaymentMethod(form);
        toast.success('تمت الإضافة');
      }
      setShowForm(false);
      fetch();
    } catch { toast.error('فشل الحفظ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try { await deletePaymentMethod(id); toast.success('تم الحذف'); fetch(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">طرق الدفع</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><Plus size={15} /> إضافة طريقة</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (عربي)</label><input type="text" name="name_ar" className="input-field" value={form.name_ar} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (إنجليزي)</label><input type="text" name="name_en" className="input-field" value={form.name_en} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع</label>
              <select name="type" className="input-field" value={form.type} onChange={handleChange}>
                <option value="wallet">محفظة</option>
                <option value="cod">الدفع عند الاستلام</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المزود</label><input type="text" name="provider" className="input-field" value={form.provider} onChange={handleChange} placeholder="vodafone / instapay" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم المستلم</label><input type="text" name="receiver_number" className="input-field" value={form.receiver_number} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستلم</label><input type="text" name="receiver_name" className="input-field" value={form.receiver_name} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label><input type="number" name="sort_order" className="input-field" value={form.sort_order} onChange={handleChange} /></div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><input type="checkbox" name="require_screenshot" id="pm_req_ss" checked={form.require_screenshot} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="pm_req_ss" className="text-sm text-gray-700 dark:text-gray-300">يتطلب صورة إثبات</label></div>
              <div className="flex items-center gap-2"><input type="checkbox" name="require_transaction_id" id="pm_req_tid" checked={form.require_transaction_id} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="pm_req_tid" className="text-sm text-gray-700 dark:text-gray-300">يتطلب رقم عملية</label></div>
              <div className="flex items-center gap-2"><input type="checkbox" name="is_active" id="pm_is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="pm_is_active" className="text-sm text-gray-700 dark:text-gray-300">نشط</label></div>
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((m) => (
          <div key={m.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-4 ${!m.is_active ? 'border-gray-200 dark:border-gray-600 opacity-60' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Wallet className="text-[rgb(0,166,62)]" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{m.name_ar}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{m.name_en}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={14} /></button>
              </div>
            </div>
            {m.type === 'wallet' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {m.provider && <p>المزود: {m.provider}</p>}
                {m.receiver_number && <p>رقم: {m.receiver_number}</p>}
                {m.receiver_name && <p>المستلم: {m.receiver_name}</p>}
              </div>
            )}
            <div className="mt-2 text-xs">
              <span className={`inline-block px-2 py-0.5 rounded-full font-semibold ${m.type === 'cod' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                {m.type === 'cod' ? 'الدفع عند الاستلام' : 'محفظة'}
              </span>
            </div>
          </div>
        ))}
        {methods.length === 0 && <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">لا توجد طرق دفع</div>}
      </div>
    </div>
  );
}
