import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';

function CustomerLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <ToastContainer position="top-center" autoClose={2500} />
      <Routes>
        {/* Customer site */}
        <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
        <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
        <Route path="/products/:slug" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
        <Route path="/categories" element={<CustomerLayout><Categories /></CustomerLayout>} />
        <Route path="/wishlist" element={<CustomerLayout><Wishlist /></CustomerLayout>} />
        <Route path="/about" element={<CustomerLayout><About /></CustomerLayout>} />
        <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
        <Route path="/faq" element={<CustomerLayout><FAQ /></CustomerLayout>} />
        <Route path="/privacy-policy" element={<CustomerLayout><Privacy /></CustomerLayout>} />
        <Route path="/terms-conditions" element={<CustomerLayout><Terms /></CustomerLayout>} />

        {/* Admin panel */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
      </Routes>
    </>
  );
}
