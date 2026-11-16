'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { USE_DEMO } from '@/lib/constants';
import { generateDemo } from '@/lib/demoData';
import { computeView } from '@/lib/analytics';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const TOKEN_KEY = 'sentinex_token';
const USER_KEY = 'sentinex_user';

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);       // localStorage has been read
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);          // { now, cameras, incidents, checks, workers }
  const [loadError, setLoadError] = useState(null);

  /* shared filters + UI state */
  const [range, setRange] = useState('7d');
  const [camera, setCamera] = useState('all');
  const [incidentFilter, setIncidentFilter] = useState('all');
  const [drawerId, setDrawerId] = useState(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY), u = localStorage.getItem(USER_KEY);
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch {}
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
    setToken(null); setUser(null); setData(null); setDrawerId(null);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadError(null);
    try {
      setData(USE_DEMO ? generateDemo() : await api.bootstrap(token));
    } catch (e) {
      if (e.status === 401) logout();
      else setLoadError(e.message);
    }
  }, [token, logout]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const finishLogin = useCallback((res) => {
    try { localStorage.setItem(TOKEN_KEY, res.token); localStorage.setItem(USER_KEY, JSON.stringify(res.user)); } catch {}
    setToken(res.token); setUser(res.user);
  }, []);

  const login = useCallback(async (email, password) => {
    if (USE_DEMO) return finishLogin({ token: 'demo', user: { name: 'Admin', role: 'ADMIN' } });
    finishLogin(await api.login(email, password));
  }, [finishLogin]);

  const cardLogin = useCallback(async () => {
    if (USE_DEMO) return finishLogin({ token: 'demo', user: { name: 'Admin', role: 'ADMIN' } });
    finishLogin(await api.cardLogin('DEMO-CARD-001'));
  }, [finishLogin]);

  /* Optimistic status change; rolls back if the API refuses. */
  const setIncidentStatus = useCallback(async (id, status) => {
    const old = data.incidents.find((i) => i.id === id)?.status;
    const apply = (s) => setData((d) => ({ ...d, incidents: d.incidents.map((i) => (i.id === id ? { ...i, status: s } : i)) }));
    apply(status);
    if (USE_DEMO) return;
    try { await api.setIncidentStatus(token, id, status); }
    catch (e) { apply(old); window.alert(e.message); }
  }, [data, token]);

  const view = useMemo(() => (data ? computeView(data, range, camera) : null), [data, range, camera]);

  const value = {
    ready, token, user, data, view, loadError, reload: load,
    login, cardLogin, logout,
    range, setRange, camera, setCamera, incidentFilter, setIncidentFilter,
    drawerId, setDrawerId, setIncidentStatus
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
