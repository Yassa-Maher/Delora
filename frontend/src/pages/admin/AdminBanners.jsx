import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Image } from 'lucide-react';
import API from '../../api/axios';
import { getProducts, getCategories } from '../../api/products';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', button_text_ar: '', button_text_en: '', product_id: '', category_id: '', sort_order: '0', is_active: true, image: null });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await API.get('/banners');
      setBanners(Array.isArray(res.data) ? res.data : res.data.banners || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    getProducts({ limit: 100 }).then((res) => setProducts(Array.isArray(res.data) ? res.data : res.data.products || [])).catch(() => {});
    getCategories({}).then((res) => setCategories(Array.isArray(res.data) ? res.data : res.data.categories || [])).catch(() => {});
    fetch();
  }, [fetch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const openNew = () => { setEditing(null); setForm({ title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', button_text_ar: '', button_text_en: '', product_id: '', category_id: '', sort_order: '0', is_active: true, image: null }); setPreviewUrl(null); setShowForm(true); };
  const openEdit = (b) => { setEditing(b.id); setForm({ title_ar: b.title_ar || '', title_en: b.title_en || '', subtitle_ar: b.subtitle_ar || '', subtitle_en: b.subtitle_en || '', button_text_ar: b.button_text_ar || '', button_text_en: b.button_text_en || '', product_id: b.product_id != null ? String(b.product_id) : '', category_id: b.category_id != null ? String(b.category_id) : '', sort_order: b.sort_order || '0', is_active: b.is_active, image: null }); setPreviewUrl(b.image_url ? (b.image_url.startsWith('http') ? b.image_url : `http://localhost:5000/uploads/${b.image_url.replace(/^\/+/, '')}`) : null); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dom = new FormData(e.currentTarget);
    const titleAr = (dom.get('title_ar') || '').toString().trim();
    const pickedFile = dom.get('image');
    const hasImage = pickedFile instanceof File || (editing && previewUrl && !previewUrl.startsWith('blob:'));
    if (!titleAr || !hasImage) {
      toast.error('العنوان بالعربية والصورة مطلوبان');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      for (const [k, v] of dom.entries()) {
        if (v instanceof File) {
          if (v.size > 0) fd.append(k, v);
        } else if (typeof v === 'string' && v.trim() !== '') {
          fd.append(k, v);
        }
      }
      fd.set('is_active', form.is_active ? '1' : '0');
      if (editing) {
        await API.put(`/banners/${editing}`, fd);
        toast.success('تم تحديث البانر');
      } else {
        await API.post('/banners', fd);
        toast.success('تم إضافة البانر');
      }
      setShowForm(false); setEditing(null); fetch();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;
    try { await API.delete(`/banners/${id}`); toast.success('تم الحذف'); fetch(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">البانرات</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><Plus size={15} /> إضافة بانر</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل البانر' : 'إضافة بانر جديد'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (عربي)</label><input type="text" name="title_ar" className="input-field" value={form.title_ar} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (إنجليزي)</label><input type="text" name="title_en" className="input-field" value={form.title_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان الفرعي (عربي)</label><input type="text" name="subtitle_ar" className="input-field" value={form.subtitle_ar} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان الفرعي (إنجليزي)</label><input type="text" name="subtitle_en" className="input-field" value={form.subtitle_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نص الزر (عربي)</label><input type="text" name="button_text_ar" className="input-field" value={form.button_text_ar} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نص الزر (إنجليزي)</label><input type="text" name="button_text_en" className="input-field" value={form.button_text_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label><input type="number" name="sort_order" className="input-field" value={form.sort_order} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الصورة</label><input type="file" name="image" accept="image/*" onChange={handleImageChange} className="input-field file:bg-green-50 dark:file:bg-green-900/30 file:border-0 file:text-[rgb(0,166,62)] file:px-4 file:py-1.5 file:rounded-xl file:cursor-pointer" /></div>
            {previewUrl && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">معاينة الصورة</label>
                <img src={previewUrl} alt="" className="w-full h-40 sm:h-52 object-contain bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600" />
              </div>
            )}
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنتج المرتبط</label>
              <select name="product_id" className="input-field" value={form.product_id} onChange={handleChange}>
                <option value="">بدون منتج</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name_ar || p.name_en}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم المرتبط</label>
              <select name="category_id" className="input-field" value={form.category_id} onChange={handleChange}>
                <option value="">بدون قسم</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar || c.name_en}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" name="is_active" id="b_is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="b_is_active" className="text-sm text-gray-700 dark:text-gray-300">نشط</label></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {banners.map((b) => {
          const linkedProduct = products.find((p) => p.id == b.product_id);
          const linkedCategory = categories.find((c) => c.id == b.category_id);
          return (
          <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4">
            <div className="w-32 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
              {b.image_url ? (
                <img src={b.image_url.startsWith('http') ? b.image_url : `http://localhost:5000/uploads/${b.image_url}`} alt="" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Image className="text-gray-300 dark:text-gray-600" size={24} /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">{b.title_ar || 'بدون عنوان'}</h3>
              {b.subtitle_ar && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{b.subtitle_ar}</p>}
              {(linkedProduct || linkedCategory) && (
                <p className="text-xs text-[rgb(0,166,62)] mt-1 truncate">
                  {linkedProduct ? `منتج: ${linkedProduct.name_ar || linkedProduct.name_en}` : ''}
                  {linkedProduct && linkedCategory ? ' | ' : ''}
                  {linkedCategory ? `قسم: ${linkedCategory.name_ar || linkedCategory.name_en}` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={14} /></button>
            </div>
          </div>
          );
        })}
        {banners.length === 0 && <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">لا توجد بانرات</div>}
      </div>
    </div>
  );
}
