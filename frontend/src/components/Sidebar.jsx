'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { NAV } from '@/lib/constants';
import { initials } from '@/lib/utils';
import Icon from './Icon';
import Logo from './Logo';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useApp();
  const name = user?.name || 'Admin';

  return (
    <aside className="side">
      <div className="brand">
        <div className="mk"><Logo /></div>
        <b>SENTINEX</b><small>PPE Safety Monitoring</small>
      </div>
      <nav className="nav">
        {NAV.map((n) => n.href ? (
          <Link key={n.label} href={n.href} className={pathname === n.href ? 'active' : ''}>
            <Icon name={n.icon} /><span>{n.label}</span>
          </Link>
        ) : (
          <a key={n.label} className="dis" aria-disabled="true"><Icon name={n.icon} /><span>{n.label}</span><em className="soon">{n.tag}</em></a>
        ))}
      </nav>
      <div className="side-foot">
        <div className="nav">
          <a role="button" tabIndex={0} onClick={() => { logout(); router.replace('/login'); }}><Icon name="logout" /><span>Logout</span></a>
        </div>
        <div className="user"><div className="avatar">{initials(name)}</div><div><b>{name}</b></div></div>
      </div>
    </aside>
  );
}
