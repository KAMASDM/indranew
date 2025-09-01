// Enhanced src/components/Navbar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    {
      label: 'Our Work',
      items: [
        { href: '/initiatives', label: 'Initiatives' },
        { href: '/events', label: 'Events' },
        { href: '/gallery', label: 'Photo Gallery' },
        { href: '/search-face', label: 'Find My Photo' }
      ]
    },
    {
      label: 'Get Involved',
      items: [
        { href: '/volunteer', label: 'Become a Volunteer' },
        { href: '/donate', label: 'Make a Donation' },
        { href: '/contact', label: 'Partner with Us' }
      ]
    },
    { href: '/contact', label: 'Contact' }
  ];

  const isActiveLink = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleDropdownToggle = (index, event) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <>
      {/* Navigation */}
      <nav className={`fixed w-full z-30 top-0 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative overflow-hidden rounded-full">
                  <Image 
                    src="/indra.png" 
                    alt="Indraprasth Foundation Logo" 
                    width={100} 
                    height={70} 
                    className="group-hover:scale-110 transition-transform duration-300"
                    priority
                  />
                  <div className="absolute inset-0 bg-teal-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300">
                    Indraprasth Foundation
                  </span>
                  <p className="text-xs text-gray-500 -mt-1 group-hover:text-teal-500 transition-colors duration-300">
                    Serving Humanity with Compassion
                  </p>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                {navigationItems.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.items ? (
                      // Dropdown Menu
                      <div className="relative">
                        <button
                          onClick={(e) => handleDropdownToggle(index, e)}
                          className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                            activeDropdown === index
                              ? 'text-teal-600 bg-teal-50'
                              : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                          }`}
                        >
                          {item.label}
                          <svg
                            className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                              activeDropdown === index ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                        
                        {/* Dropdown Content */}
                        <div className={`absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40 transition-all duration-200 ${
                          activeDropdown === index 
                            ? 'opacity-100 visible transform translate-y-0' 
                            : 'opacity-0 invisible transform -translate-y-2'
                        }`}>
                          {item.items.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                isActiveLink(subItem.href)
                                  ? 'text-teal-600 bg-teal-50 font-medium'
                                  : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                              }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Regular Link
                      <NavLink href={item.href} isActive={isActiveLink(item.href)}>
                        {item.label}
                      </NavLink>
                    )}
                  </div>
                ))}
                
                {/* CTA Button */}
                <Link 
                  href="/donate" 
                  className="ml-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black px-6 py-2 rounded-full text-base font-extrabold shadow-xl border-2 border-white transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    Donate Now
                  </span>
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                type="button" 
                className="bg-teal-500 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                aria-expanded={isOpen}
                aria-label="Main menu"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                  }`}></span>
                  <span className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-screen opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible'
        } overflow-hidden bg-white/95 backdrop-blur-md shadow-lg`}>
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigationItems.map((item, index) => (
              <div key={index}>
                {item.items ? (
                  <div>
                    <button
                      onClick={(e) => handleDropdownToggle(`mobile-${index}`, e)}
                      className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        activeDropdown === `mobile-${index}`
                          ? 'text-teal-600 bg-teal-50'
                          : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === `mobile-${index}` ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <div className={`transition-all duration-200 overflow-hidden ${
                      activeDropdown === `mobile-${index}` ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pl-4 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <MobileNavLink 
                            key={subIndex}
                            href={subItem.href}
                            isActive={isActiveLink(subItem.href)}
                          >
                            {subItem.label}
                          </MobileNavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <MobileNavLink href={item.href} isActive={isActiveLink(item.href)}>
                    {item.label}
                  </MobileNavLink>
                )}
              </div>
            ))}
            
            {/* Mobile CTA Button */}
            <Link 
              href="/donate" 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white block px-3 py-3 rounded-md text-base font-semibold text-center mx-2 mt-4 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                Donate Now
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Helper components for navigation links
const NavLink = ({ href, children, isActive }) => (
  <Link 
    href={href} 
    className={`px-3 py-2 rounded-md text-base font-medium transition-all duration-200 relative group ${
      isActive 
        ? 'text-teal-600 bg-teal-50' 
        : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
    }`}
  >
    {children}
    <span className={`absolute bottom-0 left-0 h-0.5 bg-teal-500 transition-all duration-300 ${
      isActive ? 'w-full' : 'w-0 group-hover:w-full'
    }`}></span>
  </Link>
);

const MobileNavLink = ({ href, children, isActive }) => (
  <Link 
    href={href}
    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
      isActive
        ? 'text-teal-600 bg-teal-50 font-semibold'
        : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
