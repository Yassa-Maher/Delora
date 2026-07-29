import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, resendOtp } from '../api/auth';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyEmail({ email, otp: code });
      toast.success(t('verify.success'));
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || t('verify.failed'));
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email });
      toast.success(t('verify.code_resent'));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
        <div className="mb-8 space-y-2">
          <img src="/icon.svg" alt="Delora" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('verify.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('verify.description')} {email || t('verify.your_email')}</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 text-center text-2xl tracking-[8px] outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
            placeholder="000000"
          />
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[rgb(0,166,62)] py-3.5 text-lg font-semibold text-white transition-all hover:bg-[rgb(0,145,55)] shadow-lg shadow-[rgba(0,166,62,0.2)]">
            {loading ? t('verify.loading') : t('verify.submit')}
          </button>
        </form>
        <button onClick={handleResend} className="mt-4 text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] text-sm font-semibold">
          {t('verify.resend')}
        </button>
      </div>
    </div>
  );
}
