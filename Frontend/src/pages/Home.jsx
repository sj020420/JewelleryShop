import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaGem, FaTruck, FaHandHoldingHeart, FaStar } from 'react-icons/fa';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useLang } from '../context/LangContext';

function Section({ id, heading, children }) {
  return (
    <section id={id} className="container-shop py-16">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-4xl text-ink">{heading}</h2>
        <div className="chain-divider mt-4"><span /><span /><span /><span /><span /></div>
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const { t } = useLang();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=4').then((r) => setFeatured(r.data.data)).catch(() => {});
    api.get('/products?sortBy=newest&limit=4').then((r) => setLatest(r.data.data)).catch(() => {});
    api.get('/products?bestSelling=true&limit=4').then((r) => setBestSelling(r.data.data)).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-ink overflow-hidden">
        <div className="absolute inset-0 bg-gold-gradient opacity-[0.06]" />
        <div className="container-shop relative py-24 md:py-32 flex flex-col items-center text-center">
          <motion.img
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-24 h-24 rounded-full object-cover mb-6 shadow-gold"
          />
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-white max-w-3xl leading-tight"
          >
            {t('hero_title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/70 mt-5 max-w-xl"
          >
            {t('hero_subtitle')}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}>
            <Link
              to="/products"
              className="inline-block mt-8 bg-gold-gradient text-ink font-medium px-8 py-3 rounded-full hover:shadow-gold transition-shadow"
            >
              {t('hero_cta')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <Section heading={t('categories_heading')}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.CategoryId}
              to={`/products?category=${c.Slug}`}
              className="group text-center p-6 rounded-2xl border border-gold/15 hover:border-gold/50 hover:shadow-gold transition-all"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-ivory flex items-center justify-center mb-3 group-hover:bg-gold-gradient transition-colors">
                <FaGem className="text-gold-dark group-hover:text-ink" size={22} />
              </div>
              <p className="font-display text-base text-ink">{c.NameEn}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured */}
      {featured.length > 0 && (
        <Section heading={t('featured_heading')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.ProductId} product={p} />)}
          </div>
        </Section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <Section heading={t('latest_heading')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latest.map((p) => <ProductCard key={p.ProductId} product={p} />)}
          </div>
        </Section>
      )}

      {/* Best Selling */}
      {bestSelling.length > 0 && (
        <Section heading={t('bestselling_heading')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSelling.map((p) => <ProductCard key={p.ProductId} product={p} />)}
          </div>
        </Section>
      )}

      {/* Why Choose Us */}
      <section className="bg-ivory">
        <Section heading={t('why_heading')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaGem, title: t('why_feature1_title'), desc: t('why_feature1_desc') },
              { icon: FaShieldAlt, title: t('why_feature2_title'), desc: t('why_feature2_desc') },
              { icon: FaHandHoldingHeart, title: t('why_feature3_title'), desc: t('why_feature3_desc') },
              { icon: FaTruck, title: t('why_feature4_title'), desc: t('why_feature4_desc') },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <f.icon className="text-gold-dark mx-auto mb-3" size={28} />
                <h3 className="font-display text-lg text-ink mb-1">{f.title}</h3>
                <p className="text-sm text-ink/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* Testimonials */}
      <Section heading={t('testimonials_heading')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(testimonials.length ? testimonials : [
            { TestimonialId: 1, CustomerName: 'Priya Deshmukh', Rating: 5, MessageEn: 'Beautiful craftsmanship and excellent service. My bridal set was exactly what I dreamed of.' },
            { TestimonialId: 2, CustomerName: 'Sneha Patil', Rating: 5, MessageEn: 'Loved the mangalsutra design, very traditional and elegant.' },
            { TestimonialId: 3, CustomerName: 'Kavita Joshi', Rating: 4, MessageEn: 'Great collection and quick response on WhatsApp for inquiries.' },
          ]).map((tm) => (
            <div key={tm.TestimonialId} className="bg-white p-6 rounded-2xl border border-gold/15">
              <div className="flex gap-1 mb-3 text-gold">
                {Array.from({ length: tm.Rating }).map((_, i) => <FaStar key={i} size={13} />)}
              </div>
              <p className="text-sm text-ink/70 mb-4">&ldquo;{tm.MessageEn}&rdquo;</p>
              <p className="font-display text-base text-ink">{tm.CustomerName}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="bg-ink">
        <div className="container-shop py-16 text-center">
          <h2 className="font-display text-3xl text-white mb-3">{t('newsletter_heading')}</h2>
          <form className="max-w-md mx-auto flex gap-2 mt-6" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email" required placeholder={t('newsletter_placeholder')}
              className="flex-1 px-4 py-3 rounded-full bg-white/10 text-white placeholder-white/40 border border-gold/30 focus:outline-none focus:border-gold"
            />
            <button className="bg-gold-gradient text-ink font-medium px-6 py-3 rounded-full hover:shadow-gold transition-shadow">
              {t('newsletter_cta')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
