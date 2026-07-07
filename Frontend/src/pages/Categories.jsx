import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGem } from 'react-icons/fa';
import api from '../api/axios';
import { useLang } from '../context/LangContext';

export default function Categories() {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="container-shop py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl text-ink">{t('categories_heading')}</h1>
        <div className="chain-divider mt-4"><span /><span /><span /><span /><span /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((c) => (
          <Link
            key={c.CategoryId}
            to={`/products?category=${c.Slug}`}
            className="group text-center p-8 rounded-2xl border border-gold/15 hover:border-gold/50 hover:shadow-gold transition-all bg-white"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-ivory flex items-center justify-center mb-4 group-hover:bg-gold-gradient transition-colors">
              <FaGem className="text-gold-dark group-hover:text-ink" size={26} />
            </div>
            <p className="font-display text-lg text-ink mb-1">{c.NameEn}</p>
            {c.NameMr && <p className="text-xs text-ink/50">{c.NameMr}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
