import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '../context/LangContext';
import { useWishlist } from '../context/WishlistContext';

const links = [
  { to: '/', key: 'nav_home' },
  { to: '/products', key: 'nav_products' },
  { to: '/categories', key: 'nav_categories' },
  { to: '/about', key: 'nav_about' },
  { to: '/contact', key: 'nav_contact' },
];

export default function Header() {
  const { t } = useLang();
  const { items } = useWishlist();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gold/15">
      <div className="container-shop flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-12 h-12 rounded-full object-cover" />
          <span className="font-display text-xl md:text-2xl text-ink leading-tight">
            साज <span className="text-gold-dark italic text-sm md:text-base">by Anita</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${isActive ? 'text-gold-dark' : 'text-ink/70 hover:text-ink'}`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/wishlist" className="relative" aria-label={t('nav_wishlist')}>
            <FaHeart className="text-ink/70 hover:text-gold-dark transition-colors" size={20} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
        </div>

        <button className="lg:hidden text-ink" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gold/15 bg-white px-4 py-4 space-y-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block text-sm font-medium ${isActive ? 'text-gold-dark' : 'text-ink/80'}`}
            >
              {t(l.key)}
            </NavLink>
          ))}
          <NavLink to="/wishlist" onClick={() => setOpen(false)} className="block text-sm font-medium text-ink/80">
            {t('nav_wishlist')} ({items.length})
          </NavLink>
          <div className="pt-2"><LanguageSwitcher /></div>
        </div>
      )}
    </header>
  );
}
