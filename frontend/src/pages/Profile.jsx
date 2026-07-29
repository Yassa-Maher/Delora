import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../api/auth';
import toast from 'react-hot-toast';
import { FiUser, FiCamera } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', gender: 'male' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || 'male',
      });
      if (user.photo_url || user.photo) {
        const url = user.photo_url || user.photo;
        setPhotoPreview(url.startsWith('http') ? url : `http://localhost:5000/uploads/${url.replace(/^\/+/, '')}`);
      }
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('gender', form.gender);
      if (photo) fd.append('photo', photo);
      const res = await updateProfile(fd);
      const updated = res.data.user || res.data;
      setUser(updated);
      toast.success(t('profile.updated'));
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={30} className="text-[rgb(0,166,62)]" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[rgb(0,166,62)] text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-[rgb(0,145,55)] transition-colors">
                <FiCamera size={12} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('profile.full_name')}</label>
              <input type="text" name="name" className="input-field" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('profile.phone')}</label>
              <input type="tel" name="phone" className="input-field" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('profile.gender')}</label>
              <select name="gender" className="input-field" value={form.gender} onChange={handleChange}>
                <option value="male">{t('profile.male')}</option>
                <option value="female">{t('profile.female')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('profile.email')}</label>
              <input type="email" className="input-field" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('profile.role')}</label>
              <input type="text" className="input-field" value={user?.role === 'customer' ? t('profile.customer') : user?.role || ''} disabled />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
