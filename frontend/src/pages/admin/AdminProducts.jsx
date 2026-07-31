import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories } from '../../api/products';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import API from '../../api/axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', price: '', wholesale_price: '', sku: '', category_id: '', description_ar: '', unit_ar: '', product_image: null, discount_price: '', offer_start_at: '', offer_end_at: '', offer_until_stock_out: false, offer_max_quantity: '', available_quantity: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    getCategories({}).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.categories || [];
      setCategories(data);
    }).catch(() => {});
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name_ar: '', name_en: '', price: '', wholesale_price: '', sku: '', category_id: '', description_ar: '', unit_ar: '', product_image: null, discount_price: '', offer_start_at: '', offer_end_at: '', offer_until_stock_out: false, offer_max_quantity: '', available_quantity: '' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ name_ar: p.name_ar || '', name_en: p.name_en || '', price: p.price || '', wholesale_price: p.wholesale_price || '', sku: p.sku || '', category_id: p.category_id || '', description_ar: p.description_ar || '', unit_ar: p.unit_ar || '', product_image: null, discount_price: p.discount_price || '', offer_start_at: p.offer_start_at ? p.offer_start_at.slice(0, 16) : '', offer_end_at: p.offer_end_at ? p.offer_end_at.slice(0, 16) : '', offer_until_stock_out: !!p.offer_until_stock_out, offer_max_quantity: p.offer_max_quantity || '', available_quantity: p.available_quantity != null ? String(p.available_quantity) : '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') {
          if (typeof v === 'boolean') fd.append(k, v ? '1' : '0');
          else if (k === 'available_quantity') fd.append(k, String(parseInt(v) || 0));
          else fd.append(k, v);
        }
      });
      if (editing) {
        await API.put(`/products/${editing}`, fd);
        toast.success('تم تحديث المنتج');
      } else {
        await API.post('/products', fd);
        toast.success('تم إضافة المنتج');
      }
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('تم حذف المنتج');
      fetchProducts();
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div className="animate-fadein">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المنتجات</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><Plus size={15} /> إضافة منتج</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6 animate-fadein-up">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (عربي)</label><input type="text" name="name_ar" className="input-field" value={form.name_ar} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (إنجليزي)</label><input type="text" name="name_en" className="input-field" value={form.name_en} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر</label><input type="number" step="0.01" name="price" className="input-field" value={form.price} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سعر الجملة</label><input type="number" step="0.01" name="wholesale_price" className="input-field" value={form.wholesale_price} onChange={handleChange} /></div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 col-span-full"><h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">إعدادات العروض</h3></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سعر العرض</label><input type="number" step="0.01" name="discount_price" className="input-field" value={form.discount_price} onChange={handleChange} placeholder="اتركه فارغاً إذا لا يوجد عرض" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">بداية العرض</label><input type="datetime-local" name="offer_start_at" className="input-field" value={form.offer_start_at} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نهاية العرض (تاريخ)</label><input type="datetime-local" name="offer_end_at" className="input-field" value={form.offer_end_at} onChange={handleChange} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="offer_until_stock_out" id="offer_stock" checked={form.offer_until_stock_out} onChange={(e) => setForm({...form, offer_until_stock_out: e.target.checked})} className="w-4 h-4 accent-[rgb(0,166,62)]" /><label htmlFor="offer_stock" className="text-sm text-gray-700 dark:text-gray-300">العرض حتى نفاد الكمية</label></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحد الأقصى للعرض (كمية)</label><input type="number" name="offer_max_quantity" className="input-field" value={form.offer_max_quantity} onChange={handleChange} placeholder="اتركه فارغاً بدون حد" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المخزون (الكمية المتاحة)</label><input type="number" name="available_quantity" className="input-field" value={form.available_quantity} onChange={handleChange} placeholder="0" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label><input type="text" name="sku" className="input-field" value={form.sku} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم</label>
              <select name="category_id" className="input-field" value={form.category_id} onChange={handleChange} required>
                <option value="">اختر القسم</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name_ar} {c.name_en ? `(${c.name_en})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (عربي)</label><textarea name="description_ar" className="input-field" rows={3} value={form.description_ar} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوحدة</label><input type="text" name="unit_ar" className="input-field" value={form.unit_ar} onChange={handleChange} required placeholder="كجم / لتر / قطعة" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الصورة</label><input type="file" name="product_image" accept="image/*" onChange={handleChange} className="input-field file:bg-green-50 file:border-0 file:text-[rgb(0,166,62)] file:px-4 file:py-1.5 file:rounded-xl file:cursor-pointer" /></div>
            <div className="sm:col-span-3 flex gap-3 mt-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"><Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-gray-500 dark:text-gray-400">لا توجد منتجات</p></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">#</th>
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الصورة</th>
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الاسم</th>
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">SKU</th>
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">السعر</th>
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">المخزون</th>
              <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
            </tr></thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="p-3">
                    <img
                      src={p.product_image ? `http://localhost:5000/uploads/${p.product_image.replace(/^\/+/, '')}` : '/icon.svg'}
                      alt=""
                      className="w-10 h-10 object-cover rounded-xl bg-green-50 dark:bg-green-900/30"
                      onError={(e) => { e.target.src = '/icon.svg'; e.target.style.opacity = '0.4'; }}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{p.name_ar || p.name_en}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{p.sku || '---'}</td>
                  <td className="p-3 text-[rgb(0,166,62)] font-bold">{parseFloat(p.price || 0).toFixed(2)} ج.م</td>
                  <td className="p-3">
                    {p.available_quantity != null ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${p.available_quantity > 10 ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : p.available_quantity > 0 ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {p.available_quantity}
                      </span>
                    ) : <span className="text-gray-300 dark:text-gray-600">---</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
