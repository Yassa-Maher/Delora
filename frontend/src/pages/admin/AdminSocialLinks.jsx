import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } from '../../api/socialLinks';
import { Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaSnapchatGhost, FaTiktok, FaTwitter, FaTelegramPlane, FaYoutube, FaLinkedinIn } from 'react-icons/fa';

const iconOptions = [
  { value: 'FaFacebookF', label: 'Facebook', icon: <FaFacebookF /> },
  { value: 'FaInstagram', label: 'Instagram', icon: <FaInstagram /> },
  { value: 'FaWhatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
  { value: 'FaTelegramPlane', label: 'Telegram', icon: <FaTelegramPlane /> },
  { value: 'FaTwitter', label: 'Twitter', icon: <FaTwitter /> },
  { value: 'FaSnapchatGhost', label: 'Snapchat', icon: <FaSnapchatGhost /> },
  { value: 'FaTiktok', label: 'TikTok', icon: <FaTiktok /> },
  { value: 'FaYoutube', label: 'YouTube', icon: <FaYoutube /> },
  { value: 'FaLinkedinIn', label: 'LinkedIn', icon: <FaLinkedinIn /> },
];

const iconMap = {};
iconOptions.forEach((o) => { iconMap[o.value] = o.icon; });

export default function AdminSocialLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ platform_name: '', url: '', icon: 'FaFacebookF', sort_order: 0, is_active: true });

  const fetch = useCallback(async () => {
    try {
      const res = await getSocialLinks();
      setLinks(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openNew = () => {
    setEditing(null);
    setForm({ platform_name: '', url: '', icon: 'FaFacebookF', sort_order: links.length + 1, is_active: true });
    setShowForm(true);
  };

  const openEdit = (link) => {
    setEditing(link);
    setForm({ platform_name: link.platform_name, url: link.url, icon: link.icon, sort_order: link.sort_order, is_active: link.is_active });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.platform_name.trim() || !form.url.trim()) { toast.error('اسم المنصة والرابط مطلوبان'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateSocialLink(editing.id, form);
        toast.success('تم التحديث');
      } else {
        await createSocialLink(form);
        toast.success('تمت الإضافة');
      }
      setShowForm(false);
      fetch();
    } catch { toast.error('فشل الحفظ'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try { await deleteSocialLink(id); toast.success('تم الحذف'); fetch(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">روابط التواصل الاجتماعي</h1>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4"><Plus size={15} /> إضافة رابط</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'تعديل الرابط' : 'إضافة رابط جديد'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنصة</label>
              <input type="text" name="platform_name" className="input-field" value={form.platform_name} onChange={handleChange} required placeholder="مثال: facebook" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأيقونة</label>
              <select name="icon" className="input-field" value={form.icon} onChange={handleChange} required>
                {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرابط</label>
              <input type="url" name="url" className="input-field" value={form.url} onChange={handleChange} required placeholder="https://" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label>
              <input type="number" name="sort_order" className="input-field" value={form.sort_order} onChange={handleChange} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_active" id="sl_is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" />
              <label htmlFor="sl_is_active" className="text-sm text-gray-700 dark:text-gray-300">نشط</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <div key={link.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${!link.is_active ? 'border-gray-200 dark:border-gray-600 opacity-60' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-[rgb(0,166,62)] text-lg shrink-0">
              {iconMap[link.icon] || <LinkIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{link.platform_name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{link.url}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(link)} className="p-1.5 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(link.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {links.length === 0 && <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">لا توجد روابط</div>}
      </div>
    </div>
  );
}
