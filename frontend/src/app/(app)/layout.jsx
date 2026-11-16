'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import IncidentDrawer from '@/components/IncidentDrawer';

/* Everything behind login: redirects to /login without a token, then waits for the data. */
export default function AppLayout({ children }) {
  const router = useRouter();
  const { ready, token, data, loadError, reload, logout } = useApp();

  useEffect(() => { if (ready && !token) router.replace('/login'); }, [ready, token, router]);

  if (!ready || !token) return null;

  if (loadError) {
    return (
      <div className="boot">
        <h2>Can&apos;t load data</h2>
        <p>{loadError}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn primary" onClick={reload}>Try again</button>
          <button className="btn" onClick={() => { logout(); router.replace('/login'); }}>Back to login</button>
        </div>
      </div>
    );
  }
  if (!data) return <div className="boot"><div className="spinner" /><p>Loading SENTINEX…</p></div>;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="mainwrap">
        <Topbar />
        <main className="main">{children}</main>
      </div>
      <IncidentDrawer />
    </div>
  );
}
