import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('login.success'));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('login.failed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-8 relative transition-colors duration-200 animate-fadein">
      <div className="absolute top-6 left-6">
        <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[rgb(0,166,62)] transition-all duration-200 shadow-sm border border-gray-100 dark:border-gray-600">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8 space-y-2">
          <img src="/icon.svg" alt="Delora" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{t('login.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('login.welcome')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('login.email')}</label>
            <input type="email"
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200"
              value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.password')}</label>
              <Link to="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[rgb(0,166,62)] transition-colors">{t('login.forgot_password')}</Link>
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'}
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-[rgb(0,166,62)] transition-colors duration-200"
                value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[rgb(0,166,62)]">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-[rgb(0,166,62)] py-3.5 text-lg font-semibold text-white transition-all hover:bg-[rgb(0,145,55)] shadow-lg shadow-[rgba(0,166,62,0.2)] active:scale-[0.98]">
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t('login.no_account')} <Link to="/register" className="text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] font-semibold">{t('login.register')}</Link>
        </p>
      </div>
    </div>
  );
}
