'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { USE_DEMO } from '@/lib/constants';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { ready, token, login, cardLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => { if (ready && token) router.replace('/dashboard'); }, [ready, token, router]);

  const fail = (msg) => { setError(msg); setShake(false); requestAnimationFrame(() => setShake(true)); };

  async function onSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !password) return fail(!password && /^\S+@\S+\.\S+$/.test(email.trim()) ? 'Enter your password.' : 'Enter a valid email and password.');
    setError(''); setBusy(true);
    try { await login(email.trim(), password); router.replace('/dashboard'); }
    catch (err) { fail(err.message); }
    finally { setBusy(false); }
  }

  async function onScan() {
    setScanning(true); setError('');
    await new Promise((r) => setTimeout(r, 900));
    try { await cardLogin(); router.replace('/dashboard'); }
    catch (err) { fail(err.message); }
    finally { setScanning(false); }
  }

  return (
    <section className="login-screen">
      <div className={`lcard ${shake ? 'shake' : ''}`}>
        <div className="logo"><i><Logo /></i></div>
        <h1>SENTINEX</h1>
        <div className="tag">Intelligent PPE Safety Monitoring</div>
        <form className="lform" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="em">Email address</label>
            <input id="em" type="email" placeholder="you@company.com" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw">Password</label>
            <input id="pw" type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="err">{error}</div>
          <button className="signin" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <div className="or">OR</div>
          <button className="scan" type="button" onClick={onScan} disabled={scanning}>
            <Icon name="scan" strokeWidth={2} /><span>{scanning ? 'Scanning…' : 'Scan login card'}</span>
          </button>
        </form>
        <div className="lfoot">{USE_DEMO ? 'Demo mode · any email and password signs you in' : 'Demo account: admin@sentinex.com / admin123'}</div>
      </div>
    </section>
  );
}
