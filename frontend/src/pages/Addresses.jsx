import { useState, useEffect } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../api/addresses';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', city: '', area: '', street_details: '', building_number: '', floor_number: '', is_default: false });
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(Array.isArray(res.data) ? res.data : res.data.addresses || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', city: '', area: '', street_details: '', building_number: '', floor_number: '', is_default: false });
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditing(addr.id);
    setForm({
      title: addr.title || '',
      city: addr.city || '',
      area: addr.area || '',
      street_details: addr.street_details || '',
      building_number: addr.building_number || '',
      floor_number: addr.floor_number || '',
      is_default: addr.is_default || false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateAddress(editing, form);
        toast.success(t('addresses.updated'));
      } else {
        await createAddress(form);
        toast.success(t('addresses.added'));
      }
      setShowForm(false);
      setEditing(null);
      fetchAddresses();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('addresses.confirm_delete'))) return;
    try {
      await deleteAddress(id);
      toast.success(t('addresses.deleted'));
      fetchAddresses();
    } catch {}
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('addresses.title')}</h1>
          <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4">
            <FiPlus /> {t('addresses.add')}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? t('addresses.edit_title') : t('addresses.add_title')}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addresses.address_name')}</label>
                <input type="text" name="title" className="input-field" value={form.title} onChange={handleChange} required placeholder={t('addresses.home_work')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addresses.city')}</label>
                <input type="text" name="city" className="input-field" value={form.city} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addresses.area')}</label>
                <input type="text" name="area" className="input-field" value={form.area} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addresses.building')}</label>
                <input type="text" name="building_number" className="input-field" value={form.building_number} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addresses.floor')}</label>
                <input type="text" name="floor_number" className="input-field" value={form.floor_number} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('addresses.street')}</label>
                <textarea name="street_details" className="input-field" rows={2} value={form.street_details} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" name="is_default" id="is_default" checked={form.is_default} onChange={handleChange} className="w-4 h-4 accent-[rgb(0,166,62)]" />
                <label htmlFor="is_default" className="text-sm text-gray-700 dark:text-gray-300">{t('addresses.default')}</label>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? t('profile.saving') : editing ? t('common.edit') : t('common.add')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <FiMapPin size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500">{t('addresses.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{addr.title}</span>
                      {addr.is_default && <span className="badge-green text-[10px]">{t('addresses.default_badge')}</span>}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {addr.city}{addr.area ? `, ${addr.area}` : ''}{addr.street_details ? ` - ${addr.street_details}` : ''}
                    </p>
                    {(addr.building_number || addr.floor_number) && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{t('addresses.building_prefix')} {addr.building_number}{addr.floor_number ? `, ${t('addresses.floor_prefix')} ${addr.floor_number}` : ''}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mr-4">
                    <button onClick={() => openEdit(addr)} className="p-2 text-gray-400 hover:text-[rgb(0,166,62)] hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-colors"><FiEdit2 size={16} /></button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"><FiTrash2 size={16} /></button>
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
