import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useLang } from '../context/LangContext';

const PURITY_OPTIONS = ['22K', '18K', '916'];

export default function Products() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    purity: '',
    availability: '',
    sortBy: 'newest',
    page: 1,
  });

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', 12);
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
    if (key === 'search' || key === 'category') setSearchParams({ [key]: value });
  }

  return (
    <div className="container-shop py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-ink">{t('nav_products')}</h1>
        <div className="chain-divider mt-4"><span /><span /><span /><span /><span /></div>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto mb-6 relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={15} />
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-full border border-gold/25 focus:border-gold outline-none"
        />
      </div>

      <div className="flex justify-center mb-6 lg:hidden">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 text-sm border border-gold/30 px-4 py-2 rounded-full"
        >
          <FaFilter size={12} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Filters sidebar */}
        <aside className={`space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div>
            <h4 className="font-display text-lg mb-2">{t('filter_category')}</h4>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {categories.map((c) => <option key={c.CategoryId} value={c.Slug}>{c.NameEn}</option>)}
            </select>
          </div>

          <div>
            <h4 className="font-display text-lg mb-2">{t('filter_price')}</h4>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-1/2 border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Max" value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-1/2 border border-gold/25 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg mb-2">{t('filter_purity')}</h4>
            <select
              value={filters.purity}
              onChange={(e) => updateFilter('purity', e.target.value)}
              className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {PURITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <h4 className="font-display text-lg mb-2">{t('filter_availability')}</h4>
            <select
              value={filters.availability}
              onChange={(e) => updateFilter('availability', e.target.value)}
              className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="in-stock">{t('in_stock')}</option>
              <option value="out-of-stock">{t('out_of_stock')}</option>
            </select>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex justify-end mb-4">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="border border-gold/25 rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="nameAZ">Name: A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-ivory animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-ink/50 py-20">No products found. Try adjusting your filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => <ProductCard key={p.ProductId} product={p} />)}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                  className={`w-9 h-9 rounded-full text-sm ${filters.page === i + 1 ? 'bg-ink text-gold' : 'border border-gold/25 text-ink/70'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
