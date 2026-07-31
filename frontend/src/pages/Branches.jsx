import { useState, useEffect } from 'react';
import { getBranches } from '../api/products';
import Loader from '../components/Loader';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    getBranches()
      .then((res) => setBranches(Array.isArray(res.data) ? res.data : res.data.branches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10 animate-fadein">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('branches.title')}</h1>
        {branches.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <MapPin size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t('branches.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{lang === 'ar' ? b.name_ar : (b.name_en || b.name_ar)}</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[rgb(0,166,62)] mt-1 shrink-0" size={18} />
                    <p className="text-gray-600 dark:text-gray-300">{lang === 'ar' ? b.address_ar : (b.address_en || b.address_ar)}</p>
                  </div>
                  {b.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-[rgb(0,166,62)] shrink-0" size={18} />
                      <a href={`tel:${b.phone}`} className="text-gray-600 dark:text-gray-300 hover:text-[rgb(0,166,62)]" dir="ltr">{b.phone}</a>
                    </div>
                  )}
                  {b.working_hours_ar && (
                    <div className="flex items-start gap-3">
                      <Clock className="text-[rgb(0,166,62)] mt-1 shrink-0" size={18} />
                      <p className="text-gray-600 dark:text-gray-300">{lang === 'ar' ? b.working_hours_ar : (b.working_hours_en || b.working_hours_ar)}</p>
                    </div>
                  )}
                </div>
                {b.gps_link && (
                  <a href={b.gps_link} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-4 text-sm text-[rgb(0,166,62)] hover:text-[rgb(0,145,55)] font-semibold border-2 border-[rgb(0,166,62)] rounded-xl px-5 py-2 hover:bg-[rgb(0,166,62)] hover:text-white transition-all">
                    {t('branches.view_map')}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
