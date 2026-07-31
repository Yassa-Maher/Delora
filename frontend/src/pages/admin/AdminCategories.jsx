import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Grid } from 'lucide-react';
import API from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', slug: '', image: null });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await API.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const openNew = () => { setEditing(null); setForm({ name_ar: '', name_en: '', slug: '', image: null }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name_ar: c.name_ar || '', name_en: c.name_en || '', slug: c.slug || '', image: null }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      if (editing) {
        await API.put(`/categories/${editing}`, fd);
        toast.success('تم تحديث القسم');
      } else {
        await API.post('/categories', fd);
        toast.success('تم إضافة القسم');
      }
      setShowForm(false); setEditing(null); fetch();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try { await API.delete(`/categories/${id}`); toast.success('تم الحذف'); fetch(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الأقسام</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><Plus size={15} /> إضافة قسم</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (عربي)</label><input type="text" name="name_ar" className="input-field" value={form.name_ar} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (إنجليزي)</label><input type="text" name="name_en" className="input-field" value={form.name_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرابط (slug)</label><input type="text" name="slug" className="input-field" value={form.slug} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الصورة</label><input type="file" name="image" accept="image/*" onChange={handleChange} className="input-field file:bg-green-50 file:border-0 file:text-[rgb(0,166,62)] file:px-4 file:py-1.5 file:rounded-xl file:cursor-pointer" /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center overflow-hidden shrink-0">
              {c.image_url ? (
                <img src={c.image_url.startsWith('http') ? c.image_url : `http://localhost:5000/uploads/${c.image_url}`} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <img src="/icon.svg" alt="" className="w-8 h-8 opacity-40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.name_ar || c.name_en}</h3>
              {c.name_en && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.name_en}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">لا توجد أقسام</div>}
      </div>
    </div>
  );
}
