import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShareAlt, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useWishlist } from '../context/WishlistContext';
import { useLang } from '../context/LangContext';

export default function ProductCard({ product }) {
  const { t } = useLang();
  const { isWishlisted, addItem, removeItem } = useWishlist();
  const wishlisted = isWishlisted(product.ProductId);

  function toggleWishlist(e) {
    e.preventDefault();
    if (wishlisted) {
      removeItem(product.ProductId);
      toast.info('Removed from wishlist');
    } else {
      addItem(product.ProductId);
      toast.success('Added to wishlist');
    }
  }

  function share(e) {
    e.preventDefault();
    const url = `${window.location.origin}/products/${product.Slug}`;
    if (navigator.share) {
      navigator.share({ title: product.NameEn, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.info('Link copied to clipboard');
    }
  }

  function buyNow(e) {
    e.preventDefault();
    const msg = `Hello,\n\nI am interested in this jewellery.\n\nProduct Name: ${product.NameEn}\nJewellery Number: ${product.JewelleryNumber}\nPrice: ₹${Number(product.Price).toLocaleString('en-IN')}\nWeight: ${product.Weight}g\n\nPlease share more details.\n\nThank you.`;
    window.open(`https://wa.me/919423033383?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-gold/15 overflow-hidden hover:shadow-gold transition-shadow duration-300">
      <Link to={`/products/${product.Slug}`} className="block relative aspect-square overflow-hidden bg-ivory">
        {product.PrimaryImage ? (
          <img
            src={product.PrimaryImage}
            alt={product.NameEn}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold/40 font-display text-lg">साज</div>
        )}
        {!product.IsAvailable || product.Quantity === 0 ? (
          <span className="absolute top-3 left-3 bg-ink/80 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded">
            {t('out_of_stock')}
          </span>
        ) : product.IsFeatured ? (
          <span className="absolute top-3 left-3 bg-gold-gradient text-ink text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold">
            Featured
          </span>
        ) : null}

        <button
          onClick={toggleWishlist}
          aria-label={wishlisted ? t('remove_wishlist') : t('add_wishlist')}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          {wishlisted ? <FaHeart className="text-gold" size={14} /> : <FaRegHeart className="text-ink" size={14} />}
        </button>
      </Link>

      <div className="p-4 space-y-1.5">
        <p className="text-[11px] uppercase tracking-wider text-gold-dark">{product.CategoryName}</p>
        <Link to={`/products/${product.Slug}`}>
          <h3 className="font-display text-lg leading-snug text-ink hover:text-gold-dark transition-colors line-clamp-1">
            {product.NameEn}
          </h3>
        </Link>
        <p className="text-xs text-ink/50">{t('jewellery_number')}: {product.JewelleryNumber}</p>
        <div className="flex items-center justify-between text-xs text-ink/60 pt-1">
          <span>{product.Weight}g &middot; {product.Purity}</span>
        </div>
        <p className="font-display text-xl text-ink pt-1">₹{Number(product.Price).toLocaleString('en-IN')}</p>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={buyNow}
            className="flex-1 flex items-center justify-center gap-1.5 bg-ink text-white text-xs font-medium py-2 rounded-full hover:bg-gold-dark transition-colors"
          >
            <FaWhatsapp size={14} /> {t('buy_now')}
          </button>
          <button
            onClick={share}
            aria-label={t('share')}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/30 hover:bg-ivory transition-colors"
          >
            <FaShareAlt size={13} className="text-ink/70" />
          </button>
        </div>
      </div>
    </div>
  );
}
