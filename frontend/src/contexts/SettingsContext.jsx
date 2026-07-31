import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../api/settings';
import { getSocialLinks } from '../api/socialLinks';
import { getActivePaymentMethods } from '../api/paymentMethods';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [socialLinks, setSocialLinks] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSettings().catch(() => ({ data: [] })),
      getSocialLinks().catch(() => ({ data: [] })),
      getActivePaymentMethods().catch(() => ({ data: [] })),
    ]).then(([sRes, slRes, pmRes]) => {
      const sArr = Array.isArray(sRes.data) ? sRes.data : [];
      const sMap = {};
      sArr.forEach((item) => {
        sMap[item.key_name] = { ar: item.key_value_ar || '', en: item.key_value_en || '' };
      });
      setSettings(sMap);
      setSocialLinks(Array.isArray(slRes.data) ? slRes.data : []);
      setPaymentMethods(Array.isArray(pmRes.data) ? pmRes.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getSetting = (key, lang) => {
    const s = settings[key];
    if (!s) return '';
    return lang === 'en' ? s.en : s.ar;
  };

  return (
    <SettingsContext.Provider value={{ settings, socialLinks, paymentMethods, loading, getSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
