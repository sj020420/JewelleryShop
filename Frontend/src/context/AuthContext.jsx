import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('sajAdmin');
    return saved ? JSON.parse(saved) : null;
  });

  // Login always goes through the real backend. There is intentionally no
  // client-side fallback here: a frontend-forged token would need your
  // JWT secret embedded in public JS, which is a critical security hole.
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sajAdminToken', data.token);
    localStorage.setItem('sajAdmin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }

  function logout() {
    localStorage.removeItem('sajAdminToken');
    localStorage.removeItem('sajAdmin');
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
