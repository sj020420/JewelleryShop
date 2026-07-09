import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaWhatsapp, FaShareAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api, { getImageUrl } from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useLang } from '../context/LangContext';

export default function ProductDetails() {
  const { slug } = useParams();
  const { t } = useLang();
  const { isWishlisted, addItem, removeItem } = useWishlist();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((r) => { setProduct(r.data.data); setActiveImage(0); })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="container-shop py-20 text-center text-ink/50">Loading...</div>;
  }
  if (!product) {
    return (
      <div className="container-shop py-20 text-center">
        <p className="text-ink/60 mb-4">Product not found.</p>
        <Link to="/products" className="text-gold-dark underline">Back to Products</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ ImageUrl: null }];
  const wishlisted = isWishlisted(product.ProductId);

  function toggleWishlist() {
    if (wishlisted) { removeItem(product.ProductId); toast.info('Removed from wishlist'); }
    else { addItem(product.ProductId); toast.success('Added to wishlist'); }
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product.NameEn, url });
    else { navigator.clipboard.writeText(url); toast.info('Link copied to clipboard'); }
  }

  function buyNow() {
    const msg = `Hello,\n\nI am interested in this jewellery.\n\nProduct Name: ${product.NameEn}\nJewellery Number: ${product.JewelleryNumber}\nPrice: ₹${Number(product.Price).toLocaleString('en-IN')}\nWeight: ${product.Weight}g\n\nPlease share more details.\n\nThank you.`;
    window.open(`https://wa.me/919423033383?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <div className="container-shop py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div
            className={`relative aspect-square rounded-2xl overflow-hidden bg-ivory cursor-zoom-in ${zoom ? 'cursor-zoom-out' : ''}`}
            onClick={() => setZoom((z) => !z)}
          >
            {images[activeImage]?.ImageUrl ? (
              <img
                src={getImageUrl(images[activeImage].ImageUrl)}
                alt={product.NameEn}
                className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? 'scale-150' : 'scale-100'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold/40 font-display text-2xl">साज</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === activeImage ? 'border-gold' : 'border-transparent'}`}
                >
                  {img.ImageUrl && <img src={getImageUrl(img.ImageUrl)} alt="" className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-wider text-gold-dark mb-2">{product.CategoryName}</p>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">{product.NameEn}</h1>
          <p className="text-sm text-ink/50 mb-4">{t('jewellery_number')}: {product.JewelleryNumber}</p>
          <p className="font-display text-3xl text-gold-dark mb-6">₹{Number(product.Price).toLocaleString('en-IN')}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="border border-gold/20 rounded-xl p-3">
              <p className="text-ink/50">{t('weight')}</p>
              <p className="font-medium text-ink">{product.Weight} g</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-3">
              <p className="text-ink/50">{t('purity')}</p>
              <p className="font-medium text-ink">{product.Purity}</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-3">
              <p className="text-ink/50">{t('availability')}</p>
              <p className="font-medium text-ink">{product.Quantity > 0 ? t('in_stock') : t('out_of_stock')}</p>
            </div>
            <div className="border border-gold/20 rounded-xl p-3">
              <p className="text-ink/50">Quantity</p>
              <p className="font-medium text-ink">{product.Quantity}</p>
            </div>
          </div>

          {product.DescriptionEn && (
            <p className="text-ink/70 leading-relaxed mb-6">{product.DescriptionEn}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={buyNow}
              className="flex-1 flex items-center justify-center gap-2 bg-ink text-white font-medium py-3.5 rounded-full hover:bg-gold-dark transition-colors"
            >
              <FaWhatsapp size={18} /> {t('buy_now')}
            </button>
            <button
              onClick={toggleWishlist}
              aria-label={wishlisted ? t('remove_wishlist') : t('add_wishlist')}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gold/30 hover:bg-ivory transition-colors"
            >
              {wishlisted ? <FaHeart className="text-gold" /> : <FaRegHeart className="text-ink" />}
            </button>
            <button
              onClick={share}
              aria-label={t('share')}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gold/30 hover:bg-ivory transition-colors"
            >
              <FaShareAlt className="text-ink/70" size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {product.similarProducts?.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl md:text-3xl text-ink text-center mb-8">{t('similar_products')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.similarProducts.map((p) => <ProductCard key={p.ProductId} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
