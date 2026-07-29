import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [form, setForm] = useState({ email, otp: '', new_password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirmPassword) {
      toast.error(t('reset.password_mismatch'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email: form.email, otp: form.otp, new_password: form.new_password });
      toast.success(t('reset.success'));
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || t('reset.failed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8 space-y-2">
          <img src="/icon.svg" alt="Delora" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('reset.title')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="email" value={form.email} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reset.verify_code')}</label>
            <input type="text" name="otp" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.otp} onChange={handleChange} required placeholder={t('reset.enter_code')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reset.new_password')}</label>
            <input type="password" name="new_password" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.new_password} onChange={handleChange} required placeholder="********" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reset.confirm_password')}</label>
            <input type="password" name="confirmPassword" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={form.confirmPassword} onChange={handleChange} required placeholder="********" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[rgb(0,166,62)] py-3.5 text-lg font-semibold text-white transition-all hover:bg-[rgb(0,145,55)] shadow-lg shadow-[rgba(0,166,62,0.2)]">
            {loading ? t('reset.loading') : t('reset.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
