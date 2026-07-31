import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getSettings, updateSetting } from '../../api/settings';
import { Settings, Save } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [editing, setEditing] = useState({});

  const fetch = async () => {
    try {
      const res = await getSettings();
      setSettings(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error('فشل تحميل الإعدادات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async (s) => {
    const key_value_ar = editing[s.key_name]?.ar ?? s.key_value_ar;
    const key_value_en = editing[s.key_name]?.en ?? s.key_value_en;
    if (key_value_ar === s.key_value_ar && key_value_en === s.key_value_en) {
      setEditing((p) => { const n = { ...p }; delete n[s.key_name]; return n; });
      return;
    }
    setSaving((p) => ({ ...p, [s.key_name]: true }));
    try {
      await updateSetting({ key_name: s.key_name, key_value_ar, key_value_en });
      toast.success('تم الحفظ');
      setEditing((p) => { const n = { ...p }; delete n[s.key_name]; return n; });
      fetch();
    } catch { toast.error('فشل الحفظ'); }
    finally { setSaving((p) => ({ ...p, [s.key_name]: false })); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-[rgb(0,166,62)] rounded-full animate-spin"></div></div>;

  return (
    <div className="animate-fadein">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="text-[rgb(0,166,62)]" size={24} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إعدادات المتجر</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {settings.map((s) => {
            const isEditing = editing[s.key_name];
            return (
              <div key={s.key_name} className="p-4 sm:p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.display_name_ar || s.key_name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-mono">{s.key_name}</p>
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">عربي</label>
                        <input type="text" className="input-field text-sm" value={editing[s.key_name]?.ar ?? s.key_value_ar ?? ''}
                          onChange={(e) => setEditing({ ...editing, [s.key_name]: { ...editing[s.key_name], ar: e.target.value } })} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">English</label>
                        <input type="text" className="input-field text-sm" value={editing[s.key_name]?.en ?? s.key_value_en ?? ''}
                          onChange={(e) => setEditing({ ...editing, [s.key_name]: { ...editing[s.key_name], en: e.target.value } })} />
                      </div>
                      <div className="flex gap-1 self-end">
                        <button onClick={() => handleSave(s)} disabled={saving[s.key_name]}
                          className="p-2 bg-[rgb(0,166,62)] hover:bg-[rgb(0,145,55)] text-white rounded-xl transition-colors disabled:opacity-50">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditing((p) => { const n = { ...p }; delete n[s.key_name]; return n; })}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{s.key_value_ar || '---'}</span>
                      {s.key_value_en && <span className="text-xs text-gray-400 dark:text-gray-500">/ {s.key_value_en}</span>}
                      <button onClick={() => setEditing({ ...editing, [s.key_name]: { ar: s.key_value_ar, en: s.key_value_en } })}
                        className="p-1 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {settings.length === 0 && <div className="text-center py-16 text-gray-500 dark:text-gray-400">لا توجد إعدادات</div>}
        </div>
      </div>
    </div>
  );
}
