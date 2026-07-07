import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sj020420@gmail.com');
  const [password, setPassword] = useState('Swapnil@1001');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
          <h1 className="font-display text-2xl text-ink">Admin Login</h1>
          <p className="text-xs text-ink/50">साज by Anita Jewellery</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gold/25 rounded-xl px-4 py-3 focus:border-gold outline-none"
          />
          <input
            type="password" required placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gold/25 rounded-xl px-4 py-3 focus:border-gold outline-none"
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-ink text-gold font-medium py-3 rounded-full hover:bg-gold-dark hover:text-ink transition-colors disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
