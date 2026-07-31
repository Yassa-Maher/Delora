import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import API from '../../api/axios';

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', address_ar: '', address_en: '', phone: '', working_hours_ar: '', working_hours_en: '', gps_link: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await API.get('/branches');
      setBranches(Array.isArray(res.data) ? res.data : res.data.branches || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNew = () => { setEditing(null); setForm({ name_ar: '', name_en: '', address_ar: '', address_en: '', phone: '', working_hours_ar: '', working_hours_en: '', gps_link: '', is_active: true }); setShowForm(true); };
  const openEdit = (b) => { setEditing(b.id); setForm({ name_ar: b.name_ar || '', name_en: b.name_en || '', address_ar: b.address_ar || '', address_en: b.address_en || '', phone: b.phone || '', working_hours_ar: b.working_hours_ar || '', working_hours_en: b.working_hours_en || '', gps_link: b.gps_link || '', is_active: b.is_active }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/branches/${editing}`, form);
        toast.success('تم تحديث الفرع');
      } else {
        await API.post('/branches', form);
        toast.success('تم إضافة الفرع');
      }
      setShowForm(false); setEditing(null); fetch();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;
    try { await API.delete(`/branches/${id}`); toast.success('تم الحذف'); fetch(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الفروع</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><Plus size={15} /> إضافة فرع</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (عربي)</label><input type="text" name="name_ar" className="input-field" value={form.name_ar} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (إنجليزي)</label><input type="text" name="name_en" className="input-field" value={form.name_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (عربي)</label><textarea name="address_ar" className="input-field" rows={2} value={form.address_ar} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (إنجليزي)</label><textarea name="address_en" className="input-field" rows={2} value={form.address_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الهاتف</label><input type="text" name="phone" className="input-field" value={form.phone} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مواعيد العمل (عربي)</label><input type="text" name="working_hours_ar" className="input-field" value={form.working_hours_ar} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مواعيد العمل (إنجليزي)</label><input type="text" name="working_hours_en" className="input-field" value={form.working_hours_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط GPS</label><input type="text" name="gps_link" className="input-field" value={form.gps_link} onChange={handleChange} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="is_active" id="br_is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="br_is_active" className="text-sm text-gray-700 dark:text-gray-300">نشط</label></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {branches.map((b) => (
          <div key={b.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 ${!b.is_active ? 'border-gray-200 dark:border-gray-600 opacity-60' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{b.name_ar}</h3>
                {b.name_en && <p className="text-xs text-gray-400 dark:text-gray-500">{b.name_en}</p>}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{b.address_ar}</p>
                {b.phone && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1" dir="ltr">{b.phone}</p>}
                {b.working_hours_ar && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{b.working_hours_ar}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {branches.length === 0 && <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">لا توجد فروع</div>}
      </div>
    </div>
  );
}
