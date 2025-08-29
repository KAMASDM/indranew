// Updated src/components/Navbar.js with teal colors
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav className={`fixed w-full z-20 top-0 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Image src="/logo.png" alt="Indraprasth Foundation Logo" width={50} height={50} 
                       className="group-hover:scale-110 transition duration-300" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800 group-hover:text-teal-500 transition duration-300">
                  Indraprasth Foundation
                </span>
                <p className="text-xs text-gray-500 -mt-1">Serving Humanity</p>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/about">About Us</NavLink>
              <NavLink href="/initiatives">Initiatives</NavLink>
              <NavLink href="/events">Events</NavLink>
              <NavLink href="/gallery">Gallery</NavLink>
              <NavLink href="/volunteer">Volunteer</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              <Link 
                href="/donate" 
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 px-6 py-2 rounded-full text-base font-semibold shadow-md transition duration-300 transform hover:scale-105 ml-4"
              >
                Donate Now
              </Link>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              type="button" 
              className="bg-teal-500 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-500 focus:ring-white transition duration-200"
            >
              <span className="sr-only">Open main menu</span>
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
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden bg-white shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink href="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setIsOpen(false)}>About Us</MobileNavLink>
          <MobileNavLink href="/initiatives" onClick={() => setIsOpen(false)}>Initiatives</MobileNavLink>
          <MobileNavLink href="/events" onClick={() => setIsOpen(false)}>Events</MobileNavLink>
          <MobileNavLink href="/gallery" onClick={() => setIsOpen(false)}>Gallery</MobileNavLink>
          <MobileNavLink href="/volunteer" onClick={() => setIsOpen(false)}>Volunteer</MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setIsOpen(false)}>Contact</MobileNavLink>
          <Link 
            href="/donate" 
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 block px-3 py-2 rounded-md text-base font-semibold text-center mx-2 mt-4"
          >
            Donate Now
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Helper components for navigation links
const NavLink = ({ href, children }) => (
  <Link 
    href={href} 
    className="text-gray-700 hover:text-teal-500 px-3 py-2 rounded-md text-base font-medium transition duration-200 relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="text-gray-700 hover:text-teal-500 hover:bg-teal-50 block px-3 py-2 rounded-md text-base font-medium transition duration-200"
  >
    {children}
  </Link>
);

export default Navbar;
