'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { D, TITLES } from '@/lib/constants';
import { useClock } from '@/hooks/useClock';
import Icon from './Icon';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, setIncidentFilter } = useApp();
  const now = useClock();
  const urgent = data.incidents.filter((x) => x.status === 'open' && x.severity === 'high' && x.ts >= data.now - D).length;

  return (
    <div className="topbar">
      <h2>{TITLES[pathname] || 'SENTINEX'}</h2>
      <span className="sysok"><i />System online</span>
      <div className="sp" />
      <span className="clock">
        {now ? now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' | ' + now.toLocaleTimeString('en-US') : ''}
      </span>
      <input className="search" placeholder="Search incidents" aria-label="Search" />
      <button className="iconbtn" aria-label="Open incidents" onClick={() => { setIncidentFilter('open'); router.push('/incidents'); }}>
        <Icon name="bell" strokeWidth={2} /><span className="badge">{urgent}</span>
      </button>
    </div>
  );
}
