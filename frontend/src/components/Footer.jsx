import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, MessageSquare, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaSnapchatGhost, FaTiktok, FaTwitter, FaTelegramPlane, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

const socialIconMap = {
  FaFacebookF: <FaFacebookF size={16} />,
  FaInstagram: <FaInstagram size={16} />,
  FaWhatsapp: <FaWhatsapp size={16} />,
  FaSnapchatGhost: <FaSnapchatGhost size={16} />,
  FaTiktok: <FaTiktok size={16} />,
  FaTwitter: <FaTwitter size={16} />,
  FaTelegramPlane: <FaTelegramPlane size={16} />,
  FaYoutube: <FaYoutube size={16} />,
  FaLinkedinIn: <FaLinkedinIn size={16} />,
};

const brandColors = {
  facebook: '#1877F2', instagram: '#E4405F', whatsapp: '#25D366', snapchat: '#FFFC00',
  tiktok: '#000000', twitter: '#1DA1F2', telegram: '#0088CC', youtube: '#FF0000', linkedin: '#0A66C2',
};

export default function Footer() {
  const { t, lang } = useLanguage();
  const { socialLinks, getSetting } = useSettings();
  const isRtl = lang === 'ar';
  const [showBranches, setShowBranches] = useState(false);

  const phone = getSetting('store_phone', lang) || '01000000000';
  const workingHours = getSetting('working_hours', lang) || (lang === 'en' ? '9 AM - 12 AM' : '9 ص - 12 ص');
  const address = getSetting('store_address', lang) || t('footer.country');
  const email = getSetting('store_email', lang) || '';
  const aboutText = getSetting('about_us', lang) || t('footer.brand_subtitle');

  return (
    <footer className="bg-[#0b1120] text-slate-300 pt-10 pb-6 border-t-4 border-[#00a650]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-2">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shrink-0 flex items-center">
            <img src="/icon.svg" alt="DELORA" className="w-24 h-24 lg:w-32 lg:h-32 object-contain rounded-xl hover:opacity-90 transition-opacity" />
          </Link>
          <p className="text-[11px] lg:text-sm text-slate-400">{aboutText}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm lg:text-lg border-b border-slate-700 pb-1">{t('footer.contact_info')}</h4>
          <div className="space-y-2 text-[11px] lg:text-sm">
            <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-[#00a650] transition-colors">
              <Phone size={14} className="text-[#00a650]" /> {phone}
            </a>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#00a650]" /> {workingHours}
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin size={14} className="text-[#00a650] shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm lg:text-lg border-b border-slate-700 pb-1">{t('footer.customer_service')}</h4>
          <div className="grid grid-cols-3 gap-x-0.5 gap-y-1 mt-2 w-fit">
            {socialLinks.map((link, i) => {
              const color = brandColors[link.platform_name.toLowerCase()] || '#00a650';
              return (
                <div key={link.id} className="relative group">
                  <a href={link.url} target="_blank" rel="noreferrer"
                    className="w-9 h-9 bg-slate-800 rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:bg-[#00a650]"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = color}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                    {socialIconMap[link.icon] || <MessageSquare size={16} />}
                  </a>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {link.platform_name}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm lg:text-lg border-b border-slate-700 pb-1">{t('footer.our_location')}</h4>
          {showBranches ? (
            <div className="flex flex-col gap-2 animate-fadein-up">
              <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                className="bg-slate-800 hover:bg-[#00a650] text-[11px] p-2 rounded-lg transition-colors flex items-center justify-between">
                {address} <MapPin size={12} />
              </a>
              <button onClick={() => setShowBranches(false)}
                className="text-[10px] text-slate-500 hover:text-white underline mt-1 cursor-pointer">
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowBranches(true)}
              className="block overflow-hidden rounded-xl border border-slate-700 h-24 lg:h-32 bg-slate-800 relative group transition-all hover:border-[#00a650] w-full cursor-pointer">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400" alt="Map"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold bg-black/40 group-hover:bg-transparent transition-colors">
                {isRtl ? 'اضغط لاختيار الفرع' : 'Click to select branch'}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8 pt-4 border-t border-slate-800 text-center text-slate-500 text-[10px]">
        &copy; {new Date().getFullYear()} DELORA STORE. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
      </div>
    </footer>
  );
}
