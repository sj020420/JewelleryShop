import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useLang } from '../context/LangContext';

export default function Wishlist() {
  const { t } = useLang();
  const { items, loading } = useWishlist();

  return (
    <div className="container-shop py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl text-ink">{t('your_wishlist')}</h1>
        <div className="chain-divider mt-4"><span /><span /><span /><span /><span /></div>
      </div>

      {loading ? (
        <p className="text-center text-ink/50 py-16">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink/60 mb-4">{t('empty_wishlist')}</p>
          <Link to="/products" className="inline-block bg-ink text-gold px-6 py-3 rounded-full text-sm">
            {t('nav_products')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => <ProductCard key={p.ProductId} product={p} />)}
        </div>
      )}
    </div>
  );
}
