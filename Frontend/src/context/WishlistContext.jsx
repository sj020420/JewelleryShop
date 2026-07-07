import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const WishlistContext = createContext(null);

function getDeviceToken() {
  let token = localStorage.getItem('sajDeviceToken');
  if (!token) {
    token = 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sajDeviceToken', token);
  }
  return token;
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const deviceToken = getDeviceToken();

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(`/wishlist/${deviceToken}`);
      setItems(data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [deviceToken]);

  useEffect(() => { refresh(); }, [refresh]);

  async function addItem(productId) {
    await api.post('/wishlist', { deviceToken, productId });
    refresh();
  }

  async function removeItem(productId) {
    await api.delete('/wishlist', { data: { deviceToken, productId } });
    setItems((prev) => prev.filter((p) => p.ProductId !== productId));
  }

  function isWishlisted(productId) {
    return items.some((p) => p.ProductId === productId);
  }

  return (
    <WishlistContext.Provider value={{ items, loading, addItem, removeItem, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
