'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from './AppShell';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export default function AppProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [scans, setScans] = useState([]);
  const [summary, setSummary] = useState(null);
  const router = useRouter();

  const loadDashboard = useCallback(async (jwt) => {
    const headers = { Authorization: `Bearer ${jwt}` };
    const [memberRes, scansRes, summaryRes] = await Promise.all([
      fetch('/api/members/me', { headers }),
      fetch('/api/members/me/scans', { headers }),
      fetch('/api/members/me/summary', { headers }),
    ]);
    if (!memberRes.ok || !scansRes.ok || !summaryRes.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    setMember(await memberRes.json());
    setScans(await scansRes.json());
    setSummary(await summaryRes.json());
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('kalos_token');
    if (stored) {
      setToken(stored);
      loadDashboard(stored)
        .catch(() => {
          localStorage.removeItem('kalos_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadDashboard]);

  const onLogin = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Login failed');
    localStorage.setItem('kalos_token', data.token);
    setToken(data.token);
    await loadDashboard(data.token);
    router.push('/dashboard');
  };

  const onRegister = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Registration failed');
    localStorage.setItem('kalos_token', data.token);
    setToken(data.token);
    await loadDashboard(data.token);
    router.push('/dashboard');
  };

  const onLogout = () => {
    localStorage.removeItem('kalos_token');
    setToken(null);
    setMember(null);
    setScans([]);
    setSummary(null);
    router.push('/login');
  };

  const onUpload = async (file) => {
    if (!file || !token) throw new Error('Missing file or session');
    const form = new FormData();
    form.append('scan', file);
    const res = await fetch('/api/scans/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed');
    await loadDashboard(token);
  };

  return (
    <AppContext.Provider value={{ token, loading, member, scans, summary, onLogin, onRegister, onLogout, onUpload }}>
      <AppShell authed={Boolean(token)}>{children}</AppShell>
    </AppContext.Provider>
  );
}
