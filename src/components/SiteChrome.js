'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import ErrorBoundary from './ErrorBoundary';

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const admin = pathname.startsWith('/admin');
  const standalone = admin || pathname === '/links';
  return <>
    {!standalone && <Navbar />}
    <div className={standalone ? "" : "pb-16 lg:pb-0"}><ErrorBoundary key={pathname}>{children}</ErrorBoundary></div>
    {!standalone && <><Footer /><MobileBottomNav /></>}
  </>;
}
