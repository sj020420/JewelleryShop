import { useEffect, useState } from 'react';
import { FaGem, FaTags, FaBoxes, FaExclamationTriangle, FaStar, FaEye, FaEnvelope, FaClock } from 'react-icons/fa';
import api from '../../api/axios';

const cards = [
  { key: 'TotalProducts', label: 'Total Products', icon: FaGem },
  { key: 'TotalCategories', label: 'Total Categories', icon: FaTags },
  { key: 'TotalStock', label: 'Total Stock', icon: FaBoxes },
  { key: 'OutOfStock', label: 'Out of Stock', icon: FaExclamationTriangle },
  { key: 'FeaturedProducts', label: 'Featured Products', icon: FaStar },
  { key: 'ProductViews', label: 'Product Views', icon: FaEye },
  { key: 'InquiryCount', label: 'Total Inquiries', icon: FaEnvelope },
  { key: 'PendingInquiries', label: 'Pending Inquiries', icon: FaClock },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.key} className="bg-white rounded-2xl border border-gold/15 p-5">
            <c.icon className="text-gold-dark mb-2" size={18} />
            <p className="text-2xl font-display text-ink">{summary?.[c.key] ?? '—'}</p>
            <p className="text-xs text-ink/50">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gold/15 p-6">
          <h2 className="font-display text-xl text-ink mb-4">Monthly Inquiries</h2>
          {summary?.monthlyInquiries?.length ? (
            <div className="space-y-2">
              {summary.monthlyInquiries.map((m) => (
                <div key={m.Month} className="flex items-center gap-3">
                  <span className="text-xs text-ink/50 w-16">{m.Month}</span>
                  <div className="flex-1 bg-ivory rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gold-gradient h-full"
                      style={{ width: `${Math.min(m.InquiryCount * 10, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-ink w-8 text-right">{m.InquiryCount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/50">No inquiry data yet.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gold/15 p-6">
          <h2 className="font-display text-xl text-ink mb-4">Recent Products</h2>
          <div className="space-y-3">
            {summary?.recentProducts?.map((p) => (
              <div key={p.ProductId} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ivory overflow-hidden flex-shrink-0">
                  {p.PrimaryImage && <img src={p.PrimaryImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{p.NameEn}</p>
                  <p className="text-xs text-ink/50">₹{Number(p.Price).toLocaleString('en-IN')}</p>
                </div>
              </div>
            )) || <p className="text-sm text-ink/50">No products yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
