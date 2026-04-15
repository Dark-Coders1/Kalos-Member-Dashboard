'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppProvider';
import DashboardPage from '@/components/DashboardPage';

export default function DashboardRoute() {
  const { token, loading, member, scans, summary, onLogout, onUpload } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  if (loading || !member) {
    return (
      <main className="container">
        <p className="subtle">Loading dashboard…</p>
      </main>
    );
  }

  return (
    <DashboardPage
      member={member}
      scans={scans}
      summary={summary}
      onLogout={onLogout}
      onUpload={onUpload}
    />
  );
}
