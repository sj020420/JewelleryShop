import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import api from '../../api/axios';

const emptyForm = { nameEn: '', nameMr: '', description: '', displayOrder: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    const { data } = await api.get('/categories');
    setCategories(data.data);
  }

  useEffect(() => { loadCategories(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ nameEn: c.NameEn, nameMr: c.NameMr || '', description: c.Description || '', displayOrder: c.DisplayOrder });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.CategoryId}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category added');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-ink text-gold px-5 py-2.5 rounded-full text-sm hover:bg-gold-dark hover:text-ink transition-colors">
          <FaPlus size={12} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gold/15 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ivory text-ink/60 text-left">
            <tr>
              <th className="p-4">Name (EN)</th>
              <th className="p-4">Name (MR)</th>
              <th className="p-4">Order</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.CategoryId} className="border-t border-gold/10">
                <td className="p-4 font-medium text-ink">{c.NameEn}</td>
                <td className="p-4">{c.NameMr}</td>
                <td className="p-4">{c.DisplayOrder}</td>
                <td className="p-4">{c.IsActive ? 'Active' : 'Inactive'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-gold-dark hover:text-ink"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(c.CategoryId)} className="text-red-500 hover:text-red-700"><FaTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-ink/40">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Name (English)" value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Name (Marathi)" value={form.nameMr}
                onChange={(e) => setForm({ ...form, nameMr: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Description" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Display Order" value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="w-full border border-gold/25 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" disabled={saving}
                className="w-full bg-ink text-gold font-medium py-3 rounded-full hover:bg-gold-dark hover:text-ink transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
