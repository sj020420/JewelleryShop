import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import api from '../../api/axios';

const requiredNames = [
  'Jewellery Collection',
  'Gold Jewellery',
  'Diamond Jewellery',
  'Jewellery Shop',
  'Handmade Jewellery'
];

const categoryMap = {
  1: 'Jewellery Collection',
  2: 'Gold Jewellery',
  3: 'Diamond Jewellery',
  4: 'Jewellery Shop',
  5: 'Handmade Jewellery'
};

const emptyForm = {
  jewelleryNumber: '', nameEn: '', nameMr: '', categoryId: '', price: '', weight: '',
  purity: '1 Gram', quantity: 0, isFeatured: false, isBestSelling: false, descriptionEn: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    const { data } = await api.get(`/products?limit=50${search ? `&search=${search}` : ''}`);
    setProducts(data.data);
  }

  async function ensureCategories() {
    try {
      const { data } = await api.get('/categories');
      const existing = data.data || [];
      const updatedCategories = [...existing];

      for (const name of requiredNames) {
        const found = existing.find(c => c.NameEn === name);
        if (!found) {
          try {
            const res = await api.post('/categories', {
              nameEn: name,
              nameMr: '',
              description: `${name} category`,
              displayOrder: 0
            });
            if (res.data && res.data.data) {
              updatedCategories.push(res.data.data);
            }
          } catch (postErr) {
            console.error(`Failed to create category ${name}:`, postErr);
          }
        }
      }
      setCategories(updatedCategories);
    } catch (err) {
      console.error('Failed to ensure categories:', err);
    }
  }

  useEffect(() => {
    loadProducts();
    ensureCategories();
  }, [search]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      jewelleryNumber: p.JewelleryNumber, nameEn: p.NameEn, nameMr: p.NameMr || '',
      categoryId: p.CategoryId, price: p.Price, weight: p.Weight, purity: p.Purity || '1 Gram',
      quantity: p.Quantity, isFeatured: p.IsFeatured, isBestSelling: p.IsBestSelling,
      descriptionEn: p.DescriptionEn || '',
    });
    setImages([]);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'weight') {
          const parsed = parseFloat(String(v).replace(/[^\d.]/g, ''));
          fd.append(k, isNaN(parsed) ? 0 : parsed);
        } else {
          fd.append(k, v);
        }
      });
      images.forEach((img) => fd.append('images', img));

      if (editing) {
        await api.put(`/products/${editing.ProductId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch {
      toast.error('Delete failed');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-ink text-gold px-5 py-2.5 rounded-full text-sm hover:bg-gold-dark hover:text-ink transition-colors">
          <FaPlus size={12} /> Add Product
        </button>
      </div>

      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gold/25 rounded-full px-4 py-2.5 mb-6 text-sm"
      />

      <div className="bg-white rounded-2xl border border-gold/15 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ivory text-ink/60 text-left">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.ProductId} className="border-t border-gold/10">
                <td className="p-4">
                  <div className="w-10 h-10 rounded-lg bg-ivory overflow-hidden">
                    {p.PrimaryImage && <img src={p.PrimaryImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-medium text-ink">{p.NameEn}</p>
                  <p className="text-xs text-ink/40">{p.JewelleryNumber}</p>
                </td>
                <td className="p-4">{categoryMap[p.CategoryId] || p.CategoryName}</td>
                <td className="p-4">₹{Number(p.Price).toLocaleString('en-IN')}</td>
                <td className="p-4">{p.Quantity}</td>
                <td className="p-4">{p.IsFeatured ? 'Yes' : 'No'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-gold-dark hover:text-ink"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(p.ProductId)} className="text-red-500 hover:text-red-700"><FaTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-ink/40">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Jewellery Number" value={form.jewelleryNumber}
                onChange={(e) => setForm({ ...form, jewelleryNumber: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Name (English)" value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Name (Marathi)" value={form.nameMr}
                onChange={(e) => setForm({ ...form, nameMr: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <select required value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm">
                <option value="">Select Category</option>
                {categories
                  .filter((c) => requiredNames.includes(c.NameEn))
                  .map((c) => (
                    <option key={c.CategoryId} value={c.CategoryId}>
                      {c.NameEn}
                    </option>
                  ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Price" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border border-gold/25 rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Quantity" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-ink/50 block mb-1">Weight (e.g., 2gm, 5gm, 10gm)</label>
                <input required type="text" placeholder="Weight" value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              </div>
              <textarea placeholder="Description" rows={3} value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isBestSelling}
                    onChange={(e) => setForm({ ...form, isBestSelling: e.target.checked })} /> Best Selling
                </label>
              </div>
              <div>
                <label className="text-xs text-ink/50 block mb-1">Product Images (up to 8)</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))}
                  className="w-full text-sm" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-ink text-gold font-medium py-3 rounded-full hover:bg-gold-dark hover:text-ink transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
