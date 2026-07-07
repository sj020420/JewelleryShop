import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaGem, FaTags, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', icon: FaTachometerAlt, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: FaGem, label: 'Products' },
  { to: '/admin/categories', icon: FaTags, label: 'Categories' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-ivory">
      <aside className="w-64 bg-ink text-white/80 flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <img src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-display text-gold text-sm leading-tight">साज by Anita</p>
            <p className="text-[10px] text-white/40">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-gold text-ink font-medium' : 'hover:bg-white/5'}`
              }
            >
              <l.icon size={15} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/50 mb-2">Logged in as {admin?.fullName}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-white/70 hover:text-gold transition-colors">
            <FaSignOutAlt size={13} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
