import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#0b1120] dark:bg-black text-slate-300 mt-16 border-t-4 border-[#00a650]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/icon.svg" alt="" className="w-7 h-7" />
              <span className="text-xl font-black text-white">{t('nav.brand')}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">{t('footer.brand_subtitle')}</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-1">{t('footer.quick_links')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#00a650] transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/products" className="hover:text-[#00a650] transition-colors">{t('footer.products')}</Link></li>
              <li><Link to="/branches" className="hover:text-[#00a650] transition-colors">{t('footer.branches')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#00a650] transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-1">{t('footer.my_account')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-[#00a650] transition-colors">{t('footer.profile')}</Link></li>
              <li><Link to="/orders" className="hover:text-[#00a650] transition-colors">{t('footer.orders')}</Link></li>
              <li><Link to="/cart" className="hover:text-[#00a650] transition-colors">{t('footer.cart')}</Link></li>
              <li><Link to="/favorites" className="hover:text-[#00a650] transition-colors">{t('footer.favorites')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-1">{t('footer.contact_info')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><FiMapPin className="shrink-0 text-[#00a650]" /> {t('footer.country')}</li>
              <li className="flex items-center gap-2"><FiPhone className="shrink-0 text-[#00a650]" /> 01000000000</li>
              <li className="flex items-center gap-2"><FiMail className="shrink-0 text-[#00a650]" /> delora.market@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
