import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-ink text-white/80 mt-20">
      <div className="container-shop py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-11 h-11 rounded-full object-cover" />
            <span className="font-display text-xl text-gold">साज by Anita</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {t('footer_desc')}
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"><FaFacebookF size={13} /></a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"><FaInstagram size={13} /></a>
            <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"><FaYoutube size={13} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-gold font-display text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-gold transition-colors">{t('nav_products')}</Link></li>
            <li><Link to="/categories" className="hover:text-gold transition-colors">{t('nav_categories')}</Link></li>
            <li><Link to="/wishlist" className="hover:text-gold transition-colors">{t('nav_wishlist')}</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">{t('nav_about')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold font-display text-lg mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">{t('nav_contact')}</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-gold transition-colors">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold font-display text-lg mb-4">Visit Us</h4>
          <p className="text-sm text-white/60 leading-relaxed">
            Near Maruti Temple,<br />
            Malegaon BK, Baramati,<br />
            Pune - 413115
          </p>
          <p className="text-sm text-white/60 mt-2">+91 94230 33383</p>
          <p className="text-sm text-white/60">anita.pradip.jadhav@gmail.com</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-xs text-white/40">
        <div className="container-shop flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} साज by Anita Jewellery. All rights reserved.
          </p>
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            className="border border-gold/30 hover:border-gold/80 text-gold/80 hover:text-gold transition-colors px-4 py-1.5 rounded-full font-medium tracking-wide whitespace-nowrap"
          >
            {isAuthenticated ? "Go to Admin Dashboard" : "Admin Login"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
