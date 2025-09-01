'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MobileBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Initiatives', href: '/initiatives', icon: '💡' },
    { name: 'Events', href: '/events', icon: '📅' },
    { name: 'Donate', href: '/donate', icon: '❤️' },
    { name: 'Contact', href: '/contact', icon: '📞' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;