import { useState } from 'react';
import { submitContact } from '../api/contacts';
import toast from 'react-hot-toast';
import { FiSend, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContact(form);
      toast.success(t('contact.send_success'));
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('contact.send_message')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" className="input-field" value={form.name} onChange={handleChange} required placeholder={t('contact.name')} />
              <input type="email" name="email" className="input-field" value={form.email} onChange={handleChange} required placeholder={t('contact.email')} />
              <input type="text" name="subject" className="input-field" value={form.subject} onChange={handleChange} required placeholder={t('contact.subject')} />
              <textarea name="message" className="input-field" rows={5} value={form.message} onChange={handleChange} required placeholder={t('contact.message_placeholder')} />
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <FiSend /> {loading ? t('common.loading') : t('contact.send')}
              </button>
            </form>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('contact.info')}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <FiMapPin className="text-[rgb(0,166,62)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{t('branches.address')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t('contact.country')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <FiPhone className="text-[rgb(0,166,62)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{t('branches.phone')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">01000000000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <FiMail className="text-[rgb(0,166,62)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{t('contact.email')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">delora.market@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
