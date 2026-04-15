'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function AppShell({ children, authed }) {
  const pathname = usePathname();

  const navClass = (href) => `navLink${pathname === href ? ' active' : ''}`;

  return (
    <div className="appShell">
      <header className="topNav">
        <div className="brandWrap">
          <div className="brandMark" aria-hidden="true">K</div>
          <div>
            <p className="brandName">Kalos</p>
            <p className="brandSub">Member Intelligence</p>
          </div>
        </div>

        <nav className="navLinks">
          <Link href="/" className={navClass('/')}>Home</Link>
          <Link href="/about" className={navClass('/about')}>About</Link>
          <Link href={authed ? '/dashboard' : '/login'} className={navClass(authed ? '/dashboard' : '/login')}>
            {authed ? 'Dashboard' : 'Login'}
          </Link>
        </nav>
      </header>

      {children}

      <footer className="footer">
        <span>Kalos Health Platform</span>
        <span>Built for member progress and coaching clarity</span>
      </footer>
    </div>
  );
}

export default AppShell;
