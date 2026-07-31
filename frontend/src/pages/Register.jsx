import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', gender: 'male' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      if (data.requiresVerification || data.message?.includes('تحقق')) {
        navigate('/verify-email', { state: { email: form.email } });
      } else {
        toast.success(t('register.success'));
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('register.failed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-8 animate-fadein">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8 space-y-2">
          <img src="/icon.svg" alt="Delora" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{t('register.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('register.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.full_name')}</label>
            <input type="text" name="name" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.name} onChange={handleChange} required placeholder={t('register.name_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.email')}</label>
            <input type="email" name="email" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.email} onChange={handleChange} required placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.phone')}</label>
            <input type="tel" name="phone" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.phone} onChange={handleChange} required placeholder="01000000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.password')}</label>
            <input type="password" name="password" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.password} onChange={handleChange} required placeholder="********" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.gender')}</label>
            <select name="gender" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.gender} onChange={handleChange}>
              <option value="male">{t('register.male')}</option>
              <option value="female">{t('register.female')}</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-[rgb(0,166,62)] py-3.5 text-lg font-semibold text-white transition-all hover:bg-[rgb(0,145,55)] shadow-lg shadow-[rgba(0,166,62,0.2)] active:scale-[0.98] mt-2">
            {loading ? t('register.loading') : t('register.submit')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t('register.have_account')} <Link to="/login" className="text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] font-semibold">{t('register.login')}</Link>
        </p>
      </div>
    </div>
  );
}
