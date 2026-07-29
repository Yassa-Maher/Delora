import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success(t('forgot.send_success'));
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || t('forgot.send_failed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8 space-y-2">
          <img src="/icon.svg" alt="Delora" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('forgot.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('forgot.desc')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="email" className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[rgb(0,166,62)] py-3.5 text-lg font-semibold text-white transition-all hover:bg-[rgb(0,145,55)] shadow-lg shadow-[rgba(0,166,62,0.2)]">
            {loading ? t('common.loading') : t('forgot.submit')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Link to="/login" className="text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] font-semibold">{t('forgot.back')}</Link>
        </p>
      </div>
    </div>
  );
}
